namespace api.Entities;

public enum SubscriptionPlan
{
    Free = 0,
    Pro = 1,
    Enterprise = 2
}

public enum SubscriptionStatus
{
    Active = 0,
    Canceled = 1,
    PastDue = 2,
    Trialing = 3
}

public class Subscription
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    // Stripe identifiers
    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public string? StripePaymentMethodId { get; set; }
    
    // Subscription details
    public SubscriptionPlan Plan { get; set; } = SubscriptionPlan.Free;
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
    
    // Dates
    public DateTime? CurrentPeriodStart { get; set; }
    public DateTime? CurrentPeriodEnd { get; set; }
    public DateTime? CanceledAt { get; set; }
    public DateTime? TrialEnd { get; set; }
    
    // Usage tracking
    public int MeetingsThisMonth { get; set; } = 0;
    public int MeetingsLimit { get; set; } = 3; // Free: 3, Pro: -1 (unlimited), Enterprise: -1 (unlimited)
    public DateTime LastResetDate { get; set; } = DateTime.UtcNow; // Track when we last reset the counter
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Helper methods
    public bool HasReachedLimit()
    {
        // -1 means unlimited
        if (MeetingsLimit == -1) return false;
        return MeetingsThisMonth >= MeetingsLimit;
    }
    
    public bool CanCreateMeeting()
    {
        return Status == SubscriptionStatus.Active && !HasReachedLimit();
    }
    
    public int GetMeetingsRemaining()
    {
        if (MeetingsLimit == -1) return -1; 
        return Math.Max(0, MeetingsLimit - MeetingsThisMonth);
    }
}
