SELECT 
    u.Id as UserId,
    u.Email,
    s.Plan,
    s.Status,
    s.MeetingsLimit,
    s.StripeCustomerId,
    s.StripeSubscriptionId,
    s.CurrentPeriodStart,
    s.CurrentPeriodEnd
FROM Users u
LEFT JOIN Subscriptions s ON u.Id = s.UserId
ORDER BY u.Id DESC
LIMIT 5;
