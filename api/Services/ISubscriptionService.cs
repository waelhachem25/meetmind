using api.Entities;

namespace api.Services;

public interface ISubscriptionService
{
    Task<Subscription> CreateFreeSubscriptionAsync(int userId);
    Task<Subscription?> GetUserSubscriptionAsync(int userId);
    Task<bool> CanCreateMeetingAsync(int userId);
    Task IncrementMeetingCountAsync(int userId);
    Task ResetMonthlyUsageIfNeededAsync(int userId);
    Task<int> GetMeetingsRemainingAsync(int userId);
}
