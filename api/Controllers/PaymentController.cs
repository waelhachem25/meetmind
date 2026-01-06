using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IStripeService _stripe;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(IStripeService stripe, ILogger<PaymentController> logger)
    {
        _stripe = stripe;
        _logger = logger;
    }

    [HttpPost("create-checkout-session")]
    [Authorize]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] CheckoutRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { error = "Invalid user" });
            }

            var url = await _stripe.CreateCheckoutSessionAsync(
                userId,
                request.PriceId,
                request.SuccessUrl,
                request.CancelUrl
            );

            return Ok(new { url });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout session");
            return StatusCode(500, new { error = "Failed to create checkout session" });
        }
    }

    [HttpPost("create-portal-session")]
    [Authorize]
    public async Task<IActionResult> CreatePortalSession([FromBody] PortalRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { error = "Invalid user" });
            }

            var url = await _stripe.CreatePortalSessionAsync(userId, request.ReturnUrl);

            return Ok(new { url });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating portal session");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("verify-subscription")]
    [Authorize]
    public async Task<IActionResult> VerifySubscription()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { error = "Invalid user" });
            }

            await _stripe.VerifyAndUpdateSubscriptionAsync(userId);

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying subscription");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> WebhookHandler()
    {
        try
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].ToString();

            if (string.IsNullOrEmpty(signature))
            {
                _logger.LogWarning("Webhook received without signature");
                return BadRequest("Missing signature");
            }

            await _stripe.HandleWebhookAsync(json, signature);

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook");
            return StatusCode(500);
        }
    }
}

public record CheckoutRequest(string PriceId, string SuccessUrl, string CancelUrl);
public record PortalRequest(string ReturnUrl);
