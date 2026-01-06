namespace api.Services;

public interface IStripeService
{
    Task<string> CreateCheckoutSessionAsync(int userId, string priceId, string successUrl, string cancelUrl);
    Task<string> CreatePortalSessionAsync(int userId, string returnUrl);
    Task HandleWebhookAsync(string json, string signature);
    Task VerifyAndUpdateSubscriptionAsync(int userId);
}
