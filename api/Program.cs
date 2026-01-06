using Hangfire;
using Microsoft.EntityFrameworkCore;
using Azure.Storage.Blobs;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using api.Data;
using api.Entities;
using api.Dtos;
using api.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to accept large file uploads (500MB)
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 500 * 1024 * 1024; // 500 MB
});

// Configure form options for large file uploads
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 500 * 1024 * 1024; // 500 MB
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo { Title = "MeetMind API", Version = "v1" }));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfire(c => c.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHangfireServer();

// Add HttpClient for external API calls (Gemini)
builder.Services.AddHttpClient();

builder.Services.AddCors(o => o.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var storageConn = builder.Configuration["Storage:ConnectionString"]
    ?? "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;";

builder.Services.AddSingleton(new BlobServiceClient(storageConn));
builder.Services.AddSingleton<IBlobStorage, BlobStorage>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Use local Whisper AI for transcription
Console.WriteLine("✅ Using local Whisper AI for transcription");
builder.Services.AddScoped<ISpeechService, WhisperSpeechService>();

// Use Gemini API for meeting minutes - FREE and accurate, no downloads!
Console.WriteLine("🚀 Using Gemini API for meeting minutes (FREE)");
Console.WriteLine("   ✅ No downloads required");
Console.WriteLine("   ✅ Fast and accurate");
Console.WriteLine("   ✅ Generous free tier");
builder.Services.AddScoped<IOpenAIService, GeminiService>();

builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IAudioMetadataService, AudioMetadataService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<PipelineJobs>();
builder.Services.AddScoped<IStripeService, StripeService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    // Run migrations
    db.Database.Migrate();
    
    // Create free subscriptions for users who don't have one
    try
    {
        var usersWithoutSubscription = await db.Users
            .Where(u => u.Subscription == null)
            .ToListAsync();
        
        if (usersWithoutSubscription.Any())
        {
            logger.LogInformation($"Found {usersWithoutSubscription.Count} users without subscriptions. Creating free subscriptions...");
            
            foreach (var user in usersWithoutSubscription)
            {
                var subscription = new Subscription
                {
                    UserId = user.Id,
                    Plan = SubscriptionPlan.Free,
                    Status = SubscriptionStatus.Active,
                    MeetingsThisMonth = 0,
                    MeetingsLimit = 3,
                    LastResetDate = DateTime.UtcNow,
                    CurrentPeriodStart = DateTime.UtcNow,
                    CurrentPeriodEnd = DateTime.UtcNow.AddMonths(1),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                db.Subscriptions.Add(subscription);
                logger.LogInformation($"Created free subscription for user {user.Email}");
            }
            
            await db.SaveChangesAsync();
            logger.LogInformation($"Successfully created {usersWithoutSubscription.Count} free subscriptions");
        }
        else
        {
            logger.LogInformation("All users already have subscriptions");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error creating free subscriptions for existing users");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapGet("/health", () => Results.Ok(new { status = "ok", timestamp = DateTime.UtcNow }));

// Subscription endpoint
app.MapGet("/api/subscription", async (HttpContext http, ISubscriptionService subscriptionService) =>
{
    var userIdClaim = http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    var subscription = await subscriptionService.GetUserSubscriptionAsync(userId);
    if (subscription == null)
    {
        return Results.NotFound(new { error = "No subscription found" });
    }
    
    // Reset monthly usage if needed
    await subscriptionService.ResetMonthlyUsageIfNeededAsync(userId);
    
    // Reload subscription after potential reset
    subscription = await subscriptionService.GetUserSubscriptionAsync(userId);
    if (subscription == null)
    {
        return Results.NotFound(new { error = "No subscription found" });
    }
    
    var meetingsRemaining = subscription.GetMeetingsRemaining();
    
    return Results.Ok(new
    {
        plan = subscription.Plan.ToString(),
        status = subscription.Status.ToString(),
        meetingsThisMonth = subscription.MeetingsThisMonth,
        meetingsLimit = subscription.MeetingsLimit,
        meetingsRemaining = meetingsRemaining,
        currentPeriodStart = subscription.CurrentPeriodStart?.ToString("o"),
        currentPeriodEnd = subscription.CurrentPeriodEnd?.ToString("o"),
        isUnlimited = subscription.MeetingsLimit == -1
    });
}).RequireAuthorization();

app.MapGet("/api/meetings", async (HttpContext http, AppDbContext db) =>
{
    var userIdClaim = http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    var meetings = await db.Meetings
        .Where(m => m.UserId == userId)
        .OrderByDescending(m => m.CreatedAt)
        .ToListAsync();
    
    return Results.Ok(meetings);
}).RequireAuthorization();

app.MapGet("/api/meetings/{id:int}", async (int id, HttpContext http, AppDbContext db) =>
{
    var userIdClaim = http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    var m = await db.Meetings
        .Include(x => x.Transcript)
        .Include(x => x.Minutes!)
            .ThenInclude(x => x.ActionItems)
        .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
    
    return m == null ? Results.NotFound() : Results.Ok(m);
}).RequireAuthorization();

app.MapPost("/api/meetings", async (CreateMeetingDto dto, HttpContext http, AppDbContext db, ISubscriptionService subscriptionService) =>
{
    var userIdClaim = http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    // Check if user can create a meeting based on their subscription
    var canCreate = await subscriptionService.CanCreateMeetingAsync(userId);
    if (!canCreate)
    {
        var remaining = await subscriptionService.GetMeetingsRemainingAsync(userId);
        var subscription = await subscriptionService.GetUserSubscriptionAsync(userId);
        
        if (subscription?.Status != SubscriptionStatus.Active)
        {
            return Results.Json(
                new { error = "Your subscription is not active. Please check your subscription status." },
                statusCode: 403
            );
        }
        
        return Results.Json(
            new { 
                error = "You have reached your monthly meeting limit. Please upgrade your plan to create more meetings.",
                meetingsLimit = subscription?.MeetingsLimit ?? 0,
                meetingsUsed = subscription?.MeetingsThisMonth ?? 0,
                meetingsRemaining = remaining
            },
            statusCode: 403
        );
    }
    
    var m = new Meeting
    {
        Title = dto.Title,
        DateUtc = DateTime.SpecifyKind(dto.DateUtc, DateTimeKind.Utc),
        DurationMinutes = dto.DurationMinutes,
        Location = dto.Location,
        Participants = dto.Participants,
        UserId = userId
    };
    db.Meetings.Add(m);
    await db.SaveChangesAsync();
    
    // Increment the meeting count
    await subscriptionService.IncrementMeetingCountAsync(userId);
    
    return Results.Created($"/api/meetings/{m.Id}", m);
}).RequireAuthorization();

app.MapGet("/api/meetings/{id:int}/transcript", async (int id, HttpContext http, AppDbContext db) =>
{
    var userIdClaim = http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    // Verify meeting belongs to user
    var meetingExists = await db.Meetings.AnyAsync(m => m.Id == id && m.UserId == userId);
    if (!meetingExists) return Results.NotFound();
    
    var transcript = await db.Transcripts
        .Where(t => t.MeetingId == id)
        .OrderByDescending(t => t.Version)
        .FirstOrDefaultAsync();
    
    return transcript == null ? Results.NotFound() : Results.Ok(transcript);
}).RequireAuthorization();

app.MapPut("/api/meetings/{id:int}/transcript", async (int id, UpdateTranscriptDto dto, HttpContext http, AppDbContext db, IOpenAIService openai) =>
{
    var userIdClaim = http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    var meeting = await db.Meetings
        .Include(m => m.Transcript)
        .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);
    
    if (meeting == null) return Results.NotFound();
    if (meeting.Transcript == null) return Results.BadRequest("No transcript exists");

    meeting.Transcript.Text = dto.Text;
    meeting.Transcript.IsEdited = true;
    meeting.Transcript.EditedAt = DateTime.UtcNow;
    meeting.Transcript.Version++;

    meeting.Status = MeetingStatus.Summarizing;
    await db.SaveChangesAsync();

    await openai.GenerateMinutesAsync(meeting);

    meeting.Status = MeetingStatus.Completed;
    meeting.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok(meeting.Transcript);
}).RequireAuthorization();

app.MapGet("/api/meetings/{id:int}/minutes", async (int id, HttpContext http, AppDbContext db) =>
{
    var userIdClaim = http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    // Verify meeting belongs to user
    var meetingExists = await db.Meetings.AnyAsync(m => m.Id == id && m.UserId == userId);
    if (!meetingExists) return Results.NotFound();
    
    var minutes = await db.Minutes
        .Include(m => m.ActionItems)
        .Where(m => m.MeetingId == id)
        .OrderByDescending(m => m.Version)
        .FirstOrDefaultAsync();
    
    return minutes == null ? Results.NotFound() : Results.Ok(minutes);
}).RequireAuthorization();

app.MapPut("/api/action-items/{id:int}", async (int id, UpdateActionItemDto dto, HttpContext http, AppDbContext db, ILogger<Program> logger) =>
{
    var userIdClaim = http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    var actionItem = await db.ActionItems
        .Include(a => a.Minutes)
            .ThenInclude(m => m.Meeting)
        .FirstOrDefaultAsync(a => a.Id == id);
    
    if (actionItem == null) return Results.NotFound();
    
    // Verify the action item belongs to a meeting owned by the user
    if (actionItem.Minutes?.Meeting?.UserId != userId)
        return Results.Forbid();

    var changes = new List<string>();

    if (dto.AssignedTo != null && dto.AssignedTo != actionItem.AssignedTo)
    {
        changes.Add($"AssignedTo: '{actionItem.AssignedTo}' → '{dto.AssignedTo}'");
        actionItem.AssignedTo = dto.AssignedTo;
    }
    
    if (dto.DueDate.HasValue && dto.DueDate.Value != actionItem.DueDate)
    {
        changes.Add($"DueDate: '{actionItem.DueDate:yyyy-MM-dd}' → '{dto.DueDate.Value:yyyy-MM-dd}'");
        actionItem.DueDate = dto.DueDate.Value;
    }
    
    if (dto.Status.HasValue && dto.Status.Value != actionItem.Status)
    {
        changes.Add($"Status: '{actionItem.Status}' → '{dto.Status.Value}'");
        actionItem.Status = dto.Status.Value;
        if (dto.Status.Value == ActionItemStatus.Completed)
            actionItem.CompletedAt = DateTime.UtcNow;
    }

    if (changes.Any())
    {
        var userName = http.User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "User";
        actionItem.LastModifiedBy = userName;
        actionItem.LastModifiedAt = DateTime.UtcNow;
        
        // Audit trail log
        logger.LogInformation("Action item {ActionItemId} updated by {User}: {Changes}", 
            id, actionItem.LastModifiedBy, string.Join(", ", changes));
    }

    await db.SaveChangesAsync();
    return Results.Ok(actionItem);
}).RequireAuthorization();

app.MapPost("/api/uploads/{id:int}", async (int id, HttpContext context, AppDbContext db, IBlobStorage blobs, IBackgroundJobClient jobs) =>
{
    var userIdClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    var http = context.Request;
    if (!http.HasFormContentType) 
        return Results.BadRequest("multipart/form-data required");
    
    var form = await http.ReadFormAsync();
    var file = form.Files.GetFile("file");
    
    if (file == null || file.Length == 0) 
        return Results.BadRequest("file missing");

    var m = await db.Meetings.FindAsync(id);
    if (m == null) 
        return Results.NotFound();
    
    // Verify meeting belongs to user
    if (m.UserId != userId)
        return Results.Forbid();

    var blobName = $"{Guid.NewGuid():N}-{file.FileName}";
    
    using (var s = file.OpenReadStream())
    {
        await blobs.UploadAsync("audio", blobName, s, file.ContentType ?? "audio/mpeg");
    }

    var asset = new AudioAsset
    {
        MeetingId = id,
        BlobName = blobName,
        Container = "audio",
        OriginalFileName = file.FileName,
        ContentType = file.ContentType ?? "audio/mpeg",
        SizeBytes = file.Length
    };
    db.AudioAssets.Add(asset);
    await db.SaveChangesAsync();

    jobs.Enqueue<PipelineJobs>(p => p.ProcessUploadedAudio(id, asset.Id));
    return Results.Ok(new { uploaded = true, assetId = asset.Id });
})
.RequireAuthorization()
.DisableAntiforgery();

app.MapGet("/api/meetings/{id:int}/pdf", async (int id, HttpContext http, AppDbContext db, IPdfService pdfService) =>
{
    var userIdClaim = http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    var m = await db.Meetings
        .Include(x => x.Minutes!)
            .ThenInclude(x => x.ActionItems)
        .Include(x => x.Transcript)
        .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

    if (m == null) 
        return Results.NotFound();
    
    if (m.Status != MeetingStatus.Completed) 
        return Results.BadRequest("Meeting not completed");
    
    var bytes = pdfService.GenerateMeetingMinutesPdf(m);
    var fileName = $"{m.Title.Replace(" ", "_")}_{m.MeetingDate:yyyy-MM-dd}.pdf";
    
    return Results.File(bytes, "application/pdf", fileName);
}).RequireAuthorization();

app.MapGet("/api/meetings/{id:int}/markdown", async (int id, HttpContext http, AppDbContext db) =>
{
    var userIdClaim = http.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();
    
    var m = await db.Meetings
        .Include(x => x.Minutes!)
            .ThenInclude(x => x.ActionItems)
        .Include(x => x.Transcript)
        .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

    if (m == null) 
        return Results.NotFound();
    
    if (m.Status != MeetingStatus.Completed || m.Minutes == null) 
        return Results.BadRequest("Meeting not completed");

    var markdown = $@"# {m.Title}

**Date:** {m.MeetingDate:yyyy-MM-dd HH:mm}  
**Duration:** {m.DurationMinutes} minutes  
**Location:** {m.Location ?? "N/A"}  
**Participants:** {m.Participants ?? "N/A"}

---

## Agenda
{string.Join("\n", m.Minutes.Agenda.Select(a => $"- {a}"))}

## Key Points
{string.Join("\n", m.Minutes.KeyPoints.Select(k => $"- {k}"))}

## Decisions
{string.Join("\n", m.Minutes.Decisions.Select(d => $"- {d}"))}

## Action Items

| Description | Assigned To | Due Date | Status |
|-------------|-------------|----------|--------|
{string.Join("\n", m.Minutes.ActionItems.Select(a => 
    $"| {a.Description} | {a.AssignedTo ?? "Unassigned"} | {a.DueDate?.ToString("yyyy-MM-dd") ?? "No date"} | {a.Status} |"))}

---

## Transcript

{m.Transcript?.Text ?? "No transcript available"}
";

    var fileName = $"{m.Title.Replace(" ", "_")}_{m.MeetingDate:yyyy-MM-dd}.md";
    var bytes = System.Text.Encoding.UTF8.GetBytes(markdown);
    
    return Results.File(bytes, "text/markdown", fileName);
}).RequireAuthorization();

app.UseHangfireDashboard("/hangfire");
app.Run();

