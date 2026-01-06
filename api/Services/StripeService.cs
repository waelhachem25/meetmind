using api.Data;
using api.Entities;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using StripeSubscription = Stripe.Subscription;
using AppSubscription = api.Entities.Subscription;

namespace api.Services;

public class StripeService : IStripeService
{
    private readonly AppDbContext _db;
    private readonly ILogger<StripeService> _logger;
    private readonly IConfiguration _config;
    private readonly string _webhookSecret;
    private readonly Dictionary<string, SubscriptionPlan> _priceIdMap;

    public StripeService(AppDbContext db, IConfiguration config, ILogger<StripeService> logger)
    {
        _db = db;
        _logger = logger;
        _config = config;
        
        // Initialize Stripe API key
        StripeConfiguration.ApiKey = config["Stripe:SecretKey"];
        _webhookSecret = config["Stripe:WebhookSecret"] ?? string.Empty;
        
        // Build price ID to plan mapping
        _priceIdMap = new Dictionary<string, SubscriptionPlan>
        {
            { config["Stripe:Prices:ProMonthly"]!, SubscriptionPlan.Pro },
            { config["Stripe:Prices:ProYearly"]!, SubscriptionPlan.Pro },
            { config["Stripe:Prices:EnterpriseMonthly"]!, SubscriptionPlan.Enterprise },
            { config["Stripe:Prices:EnterpriseYearly"]!, SubscriptionPlan.Enterprise }
        };
        
        _logger.LogInformation("Stripe Service initialized");
    }

    public async Task<string> CreateCheckoutSessionAsync(int userId, string priceId, string successUrl, string cancelUrl)
    {
        try
        {
            var user = await _db.Users
                .Include(u => u.Subscription)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            // Create or get Stripe customer
            var customerId = await GetOrCreateCustomerAsync(user);

            // Create checkout session
            var options = new SessionCreateOptions
            {
                Customer = customerId,
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Price = priceId,
                        Quantity = 1,
                    },
                },
                Mode = "subscription",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                Metadata = new Dictionary<string, string>
                {
                    { "user_id", userId.ToString() }
                }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            _logger.LogInformation("Created checkout session {SessionId} for user {UserId}", session.Id, userId);

            return session.Url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout session for user {UserId}", userId);
            throw;
        }
    }

    public async Task<string> CreatePortalSessionAsync(int userId, string returnUrl)
    {
        try
        {
            var user = await _db.Users
                .Include(u => u.Subscription)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || user.Subscription == null || string.IsNullOrEmpty(user.Subscription.StripeCustomerId))
                throw new Exception("No active subscription found");

            var options = new Stripe.BillingPortal.SessionCreateOptions
            {
                Customer = user.Subscription.StripeCustomerId,
                ReturnUrl = returnUrl,
            };

            var service = new Stripe.BillingPortal.SessionService();
            var session = await service.CreateAsync(options);

            _logger.LogInformation("Created billing portal session for user {UserId}", userId);

            return session.Url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating portal session for user {UserId}", userId);
            throw;
        }
    }

    public async Task HandleWebhookAsync(string json, string signature)
    {
        try
        {
            Event stripeEvent;
            
            // If webhook secret is not configured (test mode), parse JSON directly
            if (string.IsNullOrEmpty(_webhookSecret) || _webhookSecret.StartsWith("whsec_YOUR_"))
            {
                _logger.LogWarning("Webhook secret not configured - processing event without verification (TEST MODE ONLY)");
                stripeEvent = EventUtility.ParseEvent(json);
            }
            else
            {
                stripeEvent = EventUtility.ConstructEvent(json, signature, _webhookSecret);
            }

            _logger.LogInformation("Processing webhook event: {EventType}", stripeEvent.Type);

            switch (stripeEvent.Type)
            {
                case "checkout.session.completed":
                    await HandleCheckoutCompletedAsync(stripeEvent);
                    break;

                case "customer.subscription.created":
                case "customer.subscription.updated":
                    await HandleSubscriptionUpdatedAsync(stripeEvent);
                    break;

                case "customer.subscription.deleted":
                    await HandleSubscriptionDeletedAsync(stripeEvent);
                    break;

                case "invoice.payment_succeeded":
                    await HandlePaymentSucceededAsync(stripeEvent);
                    break;

                case "invoice.payment_failed":
                    await HandlePaymentFailedAsync(stripeEvent);
                    break;

                default:
                    _logger.LogInformation("Unhandled event type: {EventType}", stripeEvent.Type);
                    break;
            }
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe webhook signature verification failed");
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            throw;
        }
    }

    private async Task<string> GetOrCreateCustomerAsync(User user)
    {
        // Check if user already has a Stripe customer ID
        if (user.Subscription != null && !string.IsNullOrEmpty(user.Subscription.StripeCustomerId))
        {
            return user.Subscription.StripeCustomerId;
        }

        // Create new Stripe customer
        var customerOptions = new CustomerCreateOptions
        {
            Email = user.Email,
            Name = user.FullName,
            Metadata = new Dictionary<string, string>
            {
                { "user_id", user.Id.ToString() }
            }
        };

        var customerService = new CustomerService();
        var customer = await customerService.CreateAsync(customerOptions);

        // Create or update subscription record
        if (user.Subscription == null)
        {
            user.Subscription = new AppSubscription
            {
                UserId = user.Id,
                StripeCustomerId = customer.Id,
                Plan = SubscriptionPlan.Free,
                Status = SubscriptionStatus.Active,
                MeetingsLimit = 3,
                LastResetDate = DateTime.UtcNow,
                CurrentPeriodStart = DateTime.UtcNow,
                CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1)
            };
            _db.Subscriptions.Add(user.Subscription);
        }
        else
        {
            user.Subscription.StripeCustomerId = customer.Id;
            user.Subscription.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        _logger.LogInformation("Created Stripe customer {CustomerId} for user {UserId}", customer.Id, user.Id);

        return customer.Id;
    }

    public async Task VerifyAndUpdateSubscriptionAsync(int userId)
    {
        try
        {
            var userSubscription = await _db.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (userSubscription == null || string.IsNullOrEmpty(userSubscription.StripeCustomerId))
            {
                _logger.LogWarning("No subscription found for user {UserId}", userId);
                return;
            }

            // Fetch the latest subscription from Stripe
            var stripeSubscriptionService = new Stripe.SubscriptionService();
            var options = new SubscriptionListOptions
            {
                Customer = userSubscription.StripeCustomerId,
                Status = "all",
                Limit = 1
            };

            var subscriptions = await stripeSubscriptionService.ListAsync(options);
            var activeSubscription = subscriptions.Data.FirstOrDefault(s => s.Status == "active" || s.Status == "trialing");

            if (activeSubscription != null)
            {
                await UpdateUserSubscriptionAsync(activeSubscription);
                _logger.LogInformation("Verified and updated subscription for user {UserId}", userId);
            }
            else
            {
                _logger.LogInformation("No active Stripe subscription found for user {UserId}", userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying subscription for user {UserId}", userId);
            throw;
        }
    }

    private async Task HandleCheckoutCompletedAsync(Event stripeEvent)
    {
        var session = stripeEvent.Data.Object as Session;
        if (session == null) return;

        var userId = int.Parse(session.Metadata["user_id"]);

        _logger.LogInformation("Checkout completed for user {UserId}, session {SessionId}", userId, session.Id);

        // Retrieve the full session with subscription details
        var sessionService = new SessionService();
        var fullSession = await sessionService.GetAsync(session.Id, new SessionGetOptions
        {
            Expand = new List<string> { "subscription" }
        });

        if (fullSession.Subscription != null)
        {
            // Update subscription immediately
            var subscription = fullSession.Subscription as StripeSubscription;
            if (subscription != null)
            {
                await UpdateUserSubscriptionAsync(subscription);
            }
        }
    }

    private async Task HandleSubscriptionUpdatedAsync(Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as StripeSubscription;
        if (subscription == null) return;

        await UpdateUserSubscriptionAsync(subscription);
    }

    private async Task UpdateUserSubscriptionAsync(StripeSubscription subscription)
    {
        var userSubscription = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeCustomerId == subscription.CustomerId);

        if (userSubscription == null)
        {
            _logger.LogWarning("No subscription found for Stripe customer {CustomerId}", subscription.CustomerId);
            return;
        }

        // Determine plan based on price ID
        var priceId = subscription.Items.Data[0].Price.Id;
        var plan = DeterminePlanFromPriceId(priceId);

        userSubscription.StripeSubscriptionId = subscription.Id;
        userSubscription.Plan = plan;
        userSubscription.Status = MapStripeStatus(subscription.Status);
        
        // Access current_period_start and current_period_end from RawJObject since they're not exposed as properties in Stripe.NET SDK
        var currentPeriodStart = subscription.RawJObject["current_period_start"]?.ToObject<long>() ?? 0;
        var currentPeriodEnd = subscription.RawJObject["current_period_end"]?.ToObject<long>() ?? 0;
        userSubscription.CurrentPeriodStart = DateTimeOffset.FromUnixTimeSeconds(currentPeriodStart).DateTime;
        userSubscription.CurrentPeriodEnd = DateTimeOffset.FromUnixTimeSeconds(currentPeriodEnd).DateTime;
        
        userSubscription.MeetingsLimit = GetMeetingsLimit(plan);
        userSubscription.UpdatedAt = DateTime.UtcNow;

        if (subscription.CanceledAt.HasValue)
        {
            userSubscription.CanceledAt = subscription.CanceledAt.Value;
        }

        await _db.SaveChangesAsync();

        _logger.LogInformation("Updated subscription for user {UserId} to plan {Plan}", userSubscription.UserId, plan);
    }

    private async Task HandleSubscriptionDeletedAsync(Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as StripeSubscription;
        if (subscription == null) return;

        var userSubscription = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeCustomerId == subscription.CustomerId);

        if (userSubscription == null) return;

        // Downgrade to free plan
        userSubscription.Plan = SubscriptionPlan.Free;
        userSubscription.Status = SubscriptionStatus.Canceled;
        userSubscription.MeetingsLimit = 3; // Back to free plan limit
        userSubscription.CanceledAt = DateTime.UtcNow;
        userSubscription.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Canceled subscription for user {UserId}, downgraded to Free plan", userSubscription.UserId);
    }

    private async Task HandlePaymentSucceededAsync(Event stripeEvent)
    {
        var invoice = stripeEvent.Data.Object as Invoice;
        if (invoice == null) return;

        _logger.LogInformation("Payment succeeded for customer {CustomerId}, amount {Amount}", 
            invoice.CustomerId, invoice.AmountPaid / 100.0);

        // Reset monthly usage on successful payment
        var userSubscription = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeCustomerId == invoice.CustomerId);

        if (userSubscription != null)
        {
            userSubscription.MeetingsThisMonth = 0;
            userSubscription.Status = SubscriptionStatus.Active;
            userSubscription.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    private async Task HandlePaymentFailedAsync(Event stripeEvent)
    {
        var invoice = stripeEvent.Data.Object as Invoice;
        if (invoice == null) return;

        _logger.LogWarning("Payment failed for customer {CustomerId}", invoice.CustomerId);

        var userSubscription = await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeCustomerId == invoice.CustomerId);

        if (userSubscription != null)
        {
            userSubscription.Status = SubscriptionStatus.PastDue;
            userSubscription.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    private SubscriptionPlan DeterminePlanFromPriceId(string priceId)
    {
        if (_priceIdMap.TryGetValue(priceId, out var plan))
        {
            return plan;
        }
        
        _logger.LogWarning("Unknown price ID: {PriceId}, defaulting to Free plan", priceId);
        return SubscriptionPlan.Free;
    }

    private SubscriptionStatus MapStripeStatus(string status)
    {
        return status switch
        {
            "active" => SubscriptionStatus.Active,
            "canceled" => SubscriptionStatus.Canceled,
            "past_due" => SubscriptionStatus.PastDue,
            "trialing" => SubscriptionStatus.Trialing,
            _ => SubscriptionStatus.Active
        };
    }

    private int GetMeetingsLimit(SubscriptionPlan plan)
    {
        return plan switch
        {
            SubscriptionPlan.Free => 3, // 3 meetings per month for free plan
            SubscriptionPlan.Pro => -1, // Unlimited
            SubscriptionPlan.Enterprise => -1, // Unlimited
            _ => 3
        };
    }
}
