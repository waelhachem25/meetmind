using System.Text;
using System.Text.Json;
using api.Data;
using api.Entities;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class GeminiService : IOpenAIService
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;
    private readonly ILogger<GeminiService> _logger;
    private readonly HttpClient _httpClient;

    public GeminiService(IConfiguration config, AppDbContext db, ILogger<GeminiService> logger, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _db = db;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task GenerateMinutesAsync(Meeting meeting)
    {
        if (meeting.Transcript == null || string.IsNullOrWhiteSpace(meeting.Transcript.Text))
            throw new InvalidOperationException("No transcript available");

        var apiKey = _config["Gemini:ApiKey"];

        if (string.IsNullOrEmpty(apiKey) || apiKey.StartsWith("YOUR_"))
        {
            _logger.LogInformation("Gemini API not configured, using local AI analysis");
            await GenerateMinutesWithLocalAI(meeting);
            return;
        }

        _logger.LogInformation("🚀 Starting Gemini minutes generation for meeting {MeetingId}", meeting.Id);
        _logger.LogInformation("📋 Transcript length: {Length} characters", meeting.Transcript?.Text?.Length ?? 0);

        try
        {
            var prompt = $@"You are an elite meeting analyst with expertise in extracting precise, actionable information from transcripts.

═══════════════════════════════════════════════════════════════
TRANSCRIPT:
═══════════════════════════════════════════════════════════════
{meeting.Transcript?.Text ?? "No transcript available"}

═══════════════════════════════════════════════════════════════
EXTRACTION GUIDELINES:
═══════════════════════════════════════════════════════════════

1. AGENDA (3-8 main discussion topics):
   • Extract the PRIMARY topics/themes actually discussed
   • Use clear, business-appropriate language
   • Order by importance or chronological order
   • Examples:
     - ""Q4 Financial Performance Review""
     - ""Product Roadmap for 2026""
     - ""Team Restructuring Discussion""

2. KEY POINTS (5-12 critical facts):
   • Focus on ACTIONABLE and QUANTIFIABLE information
   • Include ALL numbers, percentages, dates, metrics
   • Capture strategic decisions and important updates
   • Be specific - avoid vague statements
   • Examples:
     - ""Revenue increased 23.5% YoY to $2.4M""
     - ""Launch date confirmed for March 15, 2026""
     - ""Customer satisfaction score: 87/100 (up from 82)""
     - ""Team will expand from 12 to 18 members by Q2""

3. DECISIONS (3-10 formal agreements):
   • Extract CONCRETE decisions and approvals
   • Include WHO decided if explicitly mentioned
   • Capture the rationale if stated
   • Examples:
     - ""Approved $150K marketing budget for Q1 campaign""
     - ""CEO decided to postpone product launch to May 2026""
     - ""Board voted 5-1 to proceed with acquisition""
     - ""Team agreed to switch from bi-weekly to weekly sprints""

4. ACTION ITEMS (3-15 specific tasks):
   • Extract EVERY actionable task mentioned
   • Assignee: Use exact name if stated, otherwise ""Unassigned""
   • DueDate: Format as YYYY-MM-DD if mentioned, otherwise null
   • Make descriptions specific and measurable
   • Examples:
     - {{""description"": ""Prepare Q1 budget proposal with 3 scenarios"", ""assignedTo"": ""Sarah Chen"", ""dueDate"": ""2026-01-15""}}
     - {{""description"": ""Complete security audit and deliver report"", ""assignedTo"": ""IT Team"", ""dueDate"": null}}

═══════════════════════════════════════════════════════════════
CRITICAL EXTRACTION RULES:
═══════════════════════════════════════════════════════════════

✓ DO:
  • Extract information EXACTLY as stated
  • Preserve specific numbers, percentages, dates, names
  • Capture both positive and negative information
  • Include context when it adds clarity
  • Be thorough - better to include than exclude

✗ DON'T:
  • Infer, assume, or extrapolate information
  • Add your own interpretation
  • Summarize when you can be specific
  • Skip important details
  • Use vague language like ""soon"", ""later"", ""maybe""

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT (JSON only):
═══════════════════════════════════════════════════════════════

{{
  ""agenda"": [""string""],
  ""keyPoints"": [""string""],
  ""decisions"": [""string""],
  ""actionItems"": [
    {{
      ""description"": ""string"",
      ""assignedTo"": ""string or Unassigned"",
      ""dueDate"": ""YYYY-MM-DD or null""
    }}
  ]
}}

Begin extraction now. Output JSON only.";
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.05, // Very low for maximum accuracy
                    topK = 30,
                    topP = 0.85,
                    maxOutputTokens = 8192,
                    responseMimeType = "application/json"
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Use Gemini 1.5 Pro for better accuracy (still FREE with generous limits)
            // Free tier: 15 RPM, 1M TPM, 1,500 requests/day
            var url = $"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key={apiKey}";
            
            _logger.LogInformation("🌐 Sending request to Gemini API...");
            var response = await _httpClient.PostAsync(url, content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("❌ Gemini API request failed: {StatusCode} - {Error}", response.StatusCode, errorContent);
                throw new Exception($"Gemini API request failed: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("✅ Gemini API response received: {Length} characters", responseContent.Length);

            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (geminiResponse?.Candidates == null || geminiResponse.Candidates.Count == 0)
            {
                _logger.LogError("❌ No candidates in Gemini response");
                throw new Exception("No candidates in Gemini response");
            }

            var textResponse = geminiResponse.Candidates[0].Content?.Parts?[0]?.Text;
            if (string.IsNullOrEmpty(textResponse))
            {
                _logger.LogError("❌ Empty text in Gemini response");
                throw new Exception("Empty text in Gemini response");
            }

            _logger.LogInformation("📝 Gemini text response: {Preview}", textResponse.Substring(0, Math.Min(200, textResponse.Length)));

            var data = JsonSerializer.Deserialize<MinutesDto>(textResponse, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (data == null)
            {
                _logger.LogError("❌ Failed to deserialize Gemini response");
                throw new Exception("Failed to deserialize response");
            }

            _logger.LogInformation("✅ Parsed minutes: Agenda={AgendaCount}, KeyPoints={KeyPointsCount}, Decisions={DecisionsCount}, ActionItems={ActionItemsCount}",
                data.Agenda?.Count ?? 0,
                data.KeyPoints?.Count ?? 0,
                data.Decisions?.Count ?? 0,
                data.ActionItems?.Count ?? 0);

            await SaveMinutesAsync(meeting, data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Gemini API failed: {Message}. Falling back to local AI script", ex.Message);
            await GenerateMinutesWithLocalAI(meeting);
        }
    }

    private async Task SaveMinutesAsync(Meeting meeting, MinutesDto data)
    {
        var minutes = await _db.Minutes
            .Include(m => m.ActionItems)
            .FirstOrDefaultAsync(m => m.MeetingId == meeting.Id);

        if (minutes == null)
        {
            minutes = new Minutes { MeetingId = meeting.Id, Version = 1 };
            _db.Minutes.Add(minutes);
            _logger.LogInformation("Creating new minutes for meeting {MeetingId}", meeting.Id);
        }
        else
        {
            minutes.Version++;
            _db.ActionItems.RemoveRange(minutes.ActionItems);
            _logger.LogInformation("Updating minutes for meeting {MeetingId}, version {Version}", meeting.Id, minutes.Version);
        }

        minutes.Agenda = data.Agenda ?? new List<string>();
        minutes.KeyPoints = data.KeyPoints ?? new List<string>();
        minutes.Decisions = data.Decisions ?? new List<string>();
        minutes.ActionItems = new List<ActionItem>();

        if (data.ActionItems != null)
        {
            foreach (var item in data.ActionItems)
            {
                minutes.ActionItems.Add(new ActionItem
                {
                    Description = item.Description ?? "No description",
                    AssignedTo = item.AssignedTo ?? "Unassigned",
                    DueDate = DateTime.TryParse(item.DueDate, out var d) ? d : null,
                    Status = ActionItemStatus.Pending
                });
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("✅ Saved minutes with {ActionItemCount} action items for meeting {MeetingId}", 
            minutes.ActionItems.Count, meeting.Id);
    }

    private async Task GenerateMinutesWithLocalAI(Meeting meeting)
    {
        var scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "generate_minutes_local.py");
        var transcript = meeting.Transcript!.Text;
        
        _logger.LogInformation("🐍 Generating minutes with local pattern-based extraction for meeting {MeetingId}", meeting.Id);
        _logger.LogInformation("📋 Transcript length: {Length} characters", transcript.Length);
        
        try
        {
            var startInfo = new System.Diagnostics.ProcessStartInfo
            {
                FileName = "python3",
                Arguments = $"\"{scriptPath}\" \"{transcript.Replace("\"", "\\\"")}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = System.Diagnostics.Process.Start(startInfo);
            if (process == null)
            {
                throw new Exception("Failed to start minutes generation process");
            }

            var outputTask = process.StandardOutput.ReadToEndAsync();
            var errorTask = process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync();

            var output = await outputTask;
            var error = await errorTask;

            _logger.LogInformation("🐍 Python script completed with exit code: {ExitCode}", process.ExitCode);
            
            if (!string.IsNullOrWhiteSpace(error))
            {
                _logger.LogWarning("⚠️ Python script stderr: {Error}", error);
            }

            if (process.ExitCode != 0)
            {
                _logger.LogError("❌ Python minutes generation failed: {Error}", error);
                throw new Exception($"Minutes generation failed: {error}");
            }

            var minutesJson = JsonSerializer.Deserialize<LocalAIMinutesDto>(output, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (minutesJson == null)
            {
                _logger.LogError("❌ Failed to parse minutes JSON from Python output");
                throw new Exception("Failed to parse minutes JSON");
            }

            var existingMinutes = await _db.Minutes
                .Where(m => m.MeetingId == meeting.Id)
                .OrderByDescending(m => m.Version)
                .FirstOrDefaultAsync();

            var agendaList = minutesJson.Agenda != null && minutesJson.Agenda.Count > 0
                ? minutesJson.Agenda.Where(s => !string.IsNullOrWhiteSpace(s)).ToList()
                : new List<string> { "No agenda items extracted" };

            var keyPointsList = minutesJson.KeyPoints != null && minutesJson.KeyPoints.Count > 0
                ? minutesJson.KeyPoints.Where(s => !string.IsNullOrWhiteSpace(s)).ToList()
                : new List<string> { "No key points extracted" };

            var decisionsList = minutesJson.Decisions != null && minutesJson.Decisions.Count > 0
                ? minutesJson.Decisions.Where(s => !string.IsNullOrWhiteSpace(s)).ToList()
                : new List<string> { "No decisions extracted" };

            var minutes = new Minutes
            {
                MeetingId = meeting.Id,
                Version = (existingMinutes?.Version ?? 0) + 1,
                Agenda = agendaList,
                KeyPoints = keyPointsList,
                Decisions = decisionsList
            };

            _db.Minutes.Add(minutes);
            await _db.SaveChangesAsync();

            if (minutesJson.ActionItems != null && minutesJson.ActionItems.Count > 0)
            {
                foreach (var actionDto in minutesJson.ActionItems)
                {
                    if (!string.IsNullOrWhiteSpace(actionDto.Description))
                    {
                        ActionItemStatus status = ActionItemStatus.Pending;
                        if (!string.IsNullOrWhiteSpace(actionDto.Status) && 
                            Enum.TryParse<ActionItemStatus>(actionDto.Status, true, out var parsedStatus))
                        {
                            status = parsedStatus;
                        }

                        _db.ActionItems.Add(new ActionItem
                        {
                            MinutesId = minutes.Id,
                            Description = actionDto.Description,
                            AssignedTo = actionDto.AssignedTo ?? "Unassigned",
                            DueDate = !string.IsNullOrWhiteSpace(actionDto.DueDate) 
                                ? DateTime.Parse(actionDto.DueDate) 
                                : DateTime.UtcNow.AddDays(7),
                            Status = status,
                            CreatedAt = DateTime.UtcNow,
                            LastModifiedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            await _db.SaveChangesAsync();
            _logger.LogInformation("✅ Saved AI-generated minutes with {ActionItemCount} action items for meeting {MeetingId}", 
                minutesJson.ActionItems?.Count ?? 0, meeting.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating minutes with local AI");
            throw;
        }
    }

    private class GeminiResponse
    {
        public List<Candidate>? Candidates { get; set; }
    }

    private class Candidate
    {
        public Content? Content { get; set; }
    }

    private class Content
    {
        public List<Part>? Parts { get; set; }
    }

    private class Part
    {
        public string? Text { get; set; }
    }

    private class LocalAIMinutesDto
    {
        public List<string>? Agenda { get; set; }
        public List<string>? KeyPoints { get; set; }
        public List<string>? Decisions { get; set; }
        public List<LocalActionItemDto>? ActionItems { get; set; }
    }

    private class LocalActionItemDto
    {
        public string? Description { get; set; }
        public string? AssignedTo { get; set; }
        public string? DueDate { get; set; }
        public string? Status { get; set; }
    }

    private class MinutesDto
    {
        public List<string>? Agenda { get; set; }
        public List<string>? KeyPoints { get; set; }
        public List<string>? Decisions { get; set; }
        public List<ActionItemDto>? ActionItems { get; set; }
    }

    private class ActionItemDto
    {
        public string? Description { get; set; }
        public string? AssignedTo { get; set; }
        public string? DueDate { get; set; }
    }
}
