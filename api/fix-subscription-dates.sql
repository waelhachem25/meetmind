-- Check current subscription dates
SELECT 
    Id,
    UserId,
    Plan,
    Status,
    CurrentPeriodStart,
    CurrentPeriodEnd,
    LastResetDate,
    CreatedAt
FROM Subscriptions;

-- Update subscriptions with NULL or invalid dates
UPDATE Subscriptions
SET 
    CurrentPeriodStart = GETUTCDATE(),
    CurrentPeriodEnd = DATEADD(MONTH, 1, GETUTCDATE()),
    LastResetDate = GETUTCDATE(),
    UpdatedAt = GETUTCDATE()
WHERE CurrentPeriodStart IS NULL 
   OR CurrentPeriodEnd IS NULL 
   OR YEAR(CurrentPeriodStart) < 2020
   OR YEAR(CurrentPeriodEnd) < 2020;

-- Verify the fix
SELECT 
    Id,
    UserId,
    Plan,
    Status,
    CurrentPeriodStart,
    CurrentPeriodEnd,
    LastResetDate
FROM Subscriptions;
