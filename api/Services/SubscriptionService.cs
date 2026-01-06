using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Entities;

namespace api.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly AppDbContext _db;
    private readonly ILogger<SubscriptionService> _logger;

    public SubscriptionService(AppDbContext db, ILogger<SubscriptionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Subscription> CreateFreeSubscriptionAsync(int userId)
    {
        var subscription = new Subscription
        {
            UserId = userId,
            Plan = SubscriptionPlan.Free,
            Status = SubscriptionStatus.Active,
            MeetingsLimit = 3,
            MeetingsThisMonth = 0,
            CurrentPeriodStart = DateTime.UtcNow,
            CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1),
            LastResetDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Subscriptions.Add(subscription);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Created free subscription for user {UserId}", userId);
        return subscription;
    }

    public async Task<Subscription?> GetUserSubscriptionAsync(int userId)
    {
        return await _db.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);
    }

    public async Task<bool> CanCreateMeetingAsync(int userId)
    {
        var subscription = await GetUserSubscriptionAsync(userId);
        if (subscription == null)
        {
            _logger.LogWarning("No subscription found for user {UserId}", userId);
            return false;
        }

        // Reset counter if needed
        await ResetMonthlyUsageIfNeededAsync(userId);

        // Reload subscription after potential reset
        subscription = await GetUserSubscriptionAsync(userId);
        if (subscription == null) return false;

        return subscription.CanCreateMeeting();
    }

    public async Task IncrementMeetingCountAsync(int userId)
    {
        var subscription = await GetUserSubscriptionAsync(userId);
        if (subscription == null)
        {
            _logger.LogError("Cannot increment meeting count - no subscription for user {UserId}", userId);
            return;
        }

        subscription.MeetingsThisMonth++;
        subscription.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Incremented meeting count for user {UserId}: {Count}/{Limit}", 
            userId, subscription.MeetingsThisMonth, subscription.MeetingsLimit);
    }

    public async Task ResetMonthlyUsageIfNeededAsync(int userId)
    {
        var subscription = await GetUserSubscriptionAsync(userId);
        if (subscription == null) return;

        var now = DateTime.UtcNow;
        var lastReset = subscription.LastResetDate;

        // Check if we've crossed into a new month
        var shouldReset = lastReset.Year != now.Year || lastReset.Month != now.Month;

        if (shouldReset)
        {
            _logger.LogInformation("Resetting monthly usage for user {UserId}. Previous: {Count}/{Limit}", 
                userId, subscription.MeetingsThisMonth, subscription.MeetingsLimit);

            subscription.MeetingsThisMonth = 0;
            subscription.LastResetDate = now;
            subscription.CurrentPeriodStart = now;
            subscription.CurrentPeriodEnd = now.AddMonths(1);
            subscription.UpdatedAt = now;

            await _db.SaveChangesAsync();

            _logger.LogInformation("Monthly usage reset for user {UserId}", userId);
        }
    }

    public async Task<int> GetMeetingsRemainingAsync(int userId)
    {
        var subscription = await GetUserSubscriptionAsync(userId);
        if (subscription == null) return 0;

        await ResetMonthlyUsageIfNeededAsync(userId);
        
        // Reload subscription after potential reset
        subscription = await GetUserSubscriptionAsync(userId);
        if (subscription == null) return 0;

        return subscription.GetMeetingsRemaining();
    }
}
