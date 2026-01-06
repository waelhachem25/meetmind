using api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<AdminController> _logger;

    public AdminController(AppDbContext db, ILogger<AdminController> logger)
    {
        _db = db;
        _logger = logger;
    }

    // Get all users with subscription info
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _db.Users
            .Include(u => u.Subscription)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.IsActive,
                u.CreatedAt,
                u.LastLoginAt,
                Subscription = u.Subscription == null ? null : new
                {
                    u.Subscription.Plan,
                    u.Subscription.Status,
                    u.Subscription.MeetingsThisMonth,
                    u.Subscription.MeetingsLimit,
                    u.Subscription.CurrentPeriodStart,
                    u.Subscription.CurrentPeriodEnd,
                    u.Subscription.StripeCustomerId,
                    u.Subscription.StripeSubscriptionId
                },
                MeetingCount = _db.Meetings.Count(m => m.UserId == u.Id)
            })
            .ToListAsync();

        return Ok(users);
    }

    // Get statistics
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _db.Users.CountAsync();
        var activeUsers = await _db.Users.CountAsync(u => u.IsActive);
        var totalMeetings = await _db.Meetings.CountAsync();
        
        var subscriptionStats = await _db.Subscriptions
            .GroupBy(s => s.Plan)
            .Select(g => new { Plan = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var revenueByPlan = await _db.Subscriptions
            .Where(s => s.Status == api.Entities.SubscriptionStatus.Active)
            .GroupBy(s => s.Plan)
            .Select(g => new 
            { 
                Plan = g.Key.ToString(), 
                Count = g.Count(),
                MonthlyRevenue = g.Key == api.Entities.SubscriptionPlan.Free ? 0 : 
                                 g.Key == api.Entities.SubscriptionPlan.Pro ? g.Count() * 5 : 
                                 g.Count() * 15
            })
            .ToListAsync();

        var freeUsers = totalUsers - await _db.Subscriptions.CountAsync();

        return Ok(new
        {
            totalUsers,
            activeUsers,
            inactiveUsers = totalUsers - activeUsers,
            totalMeetings,
            freeUsers,
            subscriptionStats,
            revenueByPlan,
            totalMonthlyRevenue = revenueByPlan.Sum(r => r.MonthlyRevenue)
        });
    }

    // Get user detail by ID
    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserDetail(int id)
    {
        var user = await _db.Users
            .Include(u => u.Subscription)
            .Include(u => u.Meetings)
                .ThenInclude(m => m.Transcript)
            .Include(u => u.Meetings)
                .ThenInclude(m => m.Minutes)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound();

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.IsActive,
            user.CreatedAt,
            user.LastLoginAt,
            Subscription = user.Subscription == null ? null : new
            {
                user.Subscription.Plan,
                user.Subscription.Status,
                user.Subscription.MeetingsThisMonth,
                user.Subscription.MeetingsLimit,
                user.Subscription.CurrentPeriodStart,
                user.Subscription.CurrentPeriodEnd,
                user.Subscription.StripeCustomerId,
                user.Subscription.StripeSubscriptionId
            },
            Meetings = user.Meetings.Select(m => new
            {
                m.Id,
                m.Title,
                m.MeetingDate,
                m.Status,
                HasTranscript = m.Transcript != null,
                HasMinutes = m.Minutes != null
            })
        });
    }

    // Deactivate/Activate user
    [HttpPatch("users/{id}/toggle-active")]
    public async Task<IActionResult> ToggleUserActive(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        user.IsActive = !user.IsActive;
        await _db.SaveChangesAsync();

        return Ok(new { user.Id, user.IsActive, Message = user.IsActive ? "User activated" : "User deactivated" });
    }

    // Get recent activity
    [HttpGet("activity")]
    public async Task<IActionResult> GetRecentActivity()
    {
        var recentMeetings = await _db.Meetings
            .Include(m => m.User)
            .OrderByDescending(m => m.CreatedAt)
            .Take(20)
            .Select(m => new
            {
                m.Id,
                m.Title,
                m.CreatedAt,
                m.Status,
                User = new { m.User.Id, m.User.FullName, m.User.Email }
            })
            .ToListAsync();

        var recentUsers = await _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Take(10)
            .Select(u => new { u.Id, u.FullName, u.Email, u.CreatedAt })
            .ToListAsync();

        return Ok(new
        {
            recentMeetings,
            recentUsers
        });
    }
}
