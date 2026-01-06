using System.Text;
using System.Text.Json;
using api.Data;
using api.Entities;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

/// <summary>
/// Uses Ollama for local, free, and accurate meeting minutes generation
/// Similar to how Whisper works for transcription - runs locally with no API costs
/// </summary>
public class OllamaService : IOpenAIService
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;
    private readonly ILogger<OllamaService> _logger;
    private readonly HttpClient _httpClient;

    public OllamaService(IConfiguration config, AppDbContext db, ILogger<OllamaService> logger, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _db = db;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.Timeout = TimeSpan.FromMinutes(5); // Longer timeout for local processing
    }

    public async Task GenerateMinutesAsync(Meeting meeting)
    {
        if (meeting.Transcript == null || string.IsNullOrWhiteSpace(meeting.Transcript.Text))
            throw new InvalidOperationException("No transcript available");

        var ollamaUrl = _config["Ollama:Url"] ?? "http://localhost:11434";
        var model = _config["Ollama:Model"] ?? "llama3.1:8b"; // Default to Llama 3.1 8B

        _logger.LogInformation("🦙 Starting Ollama local minutes generation for meeting {MeetingId}", meeting.Id);
        _logger.LogInformation("📋 Model: {Model} | Transcript length: {Length} characters", model, meeting.Transcript?.Text?.Length ?? 0);

        try
        {
            // Check if Ollama is running
            try
            {
                var healthCheck = await _httpClient.GetAsync($"{ollamaUrl}/api/tags");
                if (!healthCheck.IsSuccessStatusCode)
                {
                    throw new Exception("Ollama is not running");
                }
            }
            catch (HttpRequestException)
            {
                _logger.LogWarning("⚠️ Ollama not running, falling back to Gemini/local AI");
                await FallbackToAlternative(meeting);
                return;
            }

            var systemPrompt = @"You are an elite meeting analyst with expertise in extracting precise, actionable information from transcripts.

Your task: Analyze meeting transcripts with surgical precision and extract structured meeting minutes.

Core principles:
- ACCURACY: Extract only explicitly stated information
- PRECISION: Capture exact numbers, names, and dates
- CLARITY: Create clear, actionable items
- COMPLETENESS: Don't miss critical details

Output: Valid JSON only, no markdown, no explanations.";

            var userPrompt = $@"Analyze this meeting transcript and generate comprehensive, accurate meeting minutes.

═══════════════════════════════════════════════════════════════
TRANSCRIPT:
═══════════════════════════════════════════════════════════════
{meeting.Transcript.Text}

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
OUTPUT FORMAT (JSON only, no markdown):
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
                model = model,
                prompt = $"{systemPrompt}\n\n{userPrompt}",
                stream = false,
                format = "json",
                options = new
                {
                    temperature = 0.05,  // Very low for maximum accuracy and consistency
                    top_p = 0.85,        // Slightly lower for more focused outputs
                    top_k = 30,          // Reduced for better precision
                    num_predict = 6144,  // Increased for longer, more detailed outputs
                    repeat_penalty = 1.1 // Prevent repetition
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            _logger.LogInformation("🌐 Sending request to Ollama (local)...");
            var response = await _httpClient.PostAsync($"{ollamaUrl}/api/generate", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("❌ Ollama request failed: {StatusCode} - {Error}", response.StatusCode, errorContent);
                throw new Exception($"Ollama request failed: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("✅ Ollama response received: {Length} characters", responseContent.Length);

            var ollamaResponse = JsonSerializer.Deserialize<OllamaResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (ollamaResponse?.Response == null)
            {
                _logger.LogError("❌ Empty response from Ollama");
                throw new Exception("Empty response from Ollama");
            }

            _logger.LogInformation("📝 Parsing Ollama response JSON...");
            
            // Clean the response - sometimes models add markdown formatting
            var cleanedResponse = ollamaResponse.Response.Trim();
            if (cleanedResponse.StartsWith("```json"))
            {
                cleanedResponse = cleanedResponse.Substring(7);
            }
            if (cleanedResponse.StartsWith("```"))
            {
                cleanedResponse = cleanedResponse.Substring(3);
            }
            if (cleanedResponse.EndsWith("```"))
            {
                cleanedResponse = cleanedResponse.Substring(0, cleanedResponse.Length - 3);
            }
            cleanedResponse = cleanedResponse.Trim();

            var minutesData = JsonSerializer.Deserialize<MinutesData>(cleanedResponse, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (minutesData == null)
            {
                _logger.LogError("❌ Failed to parse minutes data from Ollama response");
                _logger.LogError("Raw response: {Response}", cleanedResponse);
                throw new Exception("Failed to parse minutes data");
            }

            _logger.LogInformation("✅ Parsed: {AgendaCount} agenda, {KeyPointsCount} key points, {DecisionsCount} decisions, {ActionItemsCount} action items",
                minutesData.Agenda?.Count ?? 0,
                minutesData.KeyPoints?.Count ?? 0,
                minutesData.Decisions?.Count ?? 0,
                minutesData.ActionItems?.Count ?? 0);

            // Save to database
            await SaveMinutesToDatabase(meeting, minutesData);

            _logger.LogInformation("✅ Successfully generated meeting minutes with Ollama (local)");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error generating minutes with Ollama, falling back to alternative");
            await FallbackToAlternative(meeting);
        }
    }

    private async Task SaveMinutesToDatabase(Meeting meeting, MinutesData minutesData)
    {
        var minutes = await _db.Minutes.FirstOrDefaultAsync(m => m.MeetingId == meeting.Id);

        if (minutes == null)
        {
            minutes = new Minutes
            {
                MeetingId = meeting.Id,
                Version = 1
            };
            _db.Minutes.Add(minutes);
        }
        else
        {
            minutes.Version++;
            var existingActionItems = await _db.ActionItems.Where(a => a.MinutesId == minutes.Id).ToListAsync();
            _db.ActionItems.RemoveRange(existingActionItems);
        }

        minutes.Agenda = minutesData.Agenda ?? new List<string>();
        minutes.KeyPoints = minutesData.KeyPoints ?? new List<string>();
        minutes.Decisions = minutesData.Decisions ?? new List<string>();

        await _db.SaveChangesAsync();

        if (minutesData.ActionItems != null)
        {
            foreach (var item in minutesData.ActionItems)
            {
                var actionItem = new ActionItem
                {
                    MinutesId = minutes.Id,
                    Description = item.Description ?? "Unnamed action item",
                    AssignedTo = item.AssignedTo,
                    DueDate = item.DueDate,
                    Status = ActionItemStatus.Pending
                };
                _db.ActionItems.Add(actionItem);
            }
        }

        meeting.Status = MeetingStatus.Completed;
        await _db.SaveChangesAsync();
    }

    private async Task FallbackToAlternative(Meeting meeting)
    {
        _logger.LogInformation("🔄 Attempting Gemini fallback...");
        
        var geminiApiKey = _config["Gemini:ApiKey"];
        if (!string.IsNullOrEmpty(geminiApiKey) && !geminiApiKey.StartsWith("YOUR_"))
        {
            _logger.LogInformation("🐍 Using local Python pattern matching as fallback");
            await GenerateMinutesWithLocalAI(meeting);
        }
        else
        {
            _logger.LogInformation("🐍 Using local Python pattern matching as last resort");
            await GenerateMinutesWithLocalAI(meeting);
        }
    }

    private async Task GenerateMinutesWithLocalAI(Meeting meeting)
    {
        _logger.LogInformation("🐍 Using local pattern-based AI analysis for meeting {MeetingId}", meeting.Id);

        var pythonScript = Path.Combine(Directory.GetCurrentDirectory(), "generate_minutes_local.py");

        if (!File.Exists(pythonScript))
        {
            _logger.LogError("❌ Local AI script not found: {Path}", pythonScript);
            throw new FileNotFoundException("Local AI script not found", pythonScript);
        }

        var transcriptJson = JsonSerializer.Serialize(meeting.Transcript?.Text ?? "");

        var process = new System.Diagnostics.Process
        {
            StartInfo = new System.Diagnostics.ProcessStartInfo
            {
                FileName = "python3",
                Arguments = $"\"{pythonScript}\"",
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        process.Start();
        await process.StandardInput.WriteAsync(transcriptJson);
        process.StandardInput.Close();

        var output = await process.StandardOutput.ReadToEndAsync();
        var errors = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        if (!string.IsNullOrEmpty(errors))
        {
            _logger.LogInformation("🐍 Python script output: {Errors}", errors);
        }

        if (process.ExitCode != 0)
        {
            _logger.LogError("❌ Python script failed with exit code {ExitCode}", process.ExitCode);
            throw new Exception($"Python script failed with exit code {process.ExitCode}");
        }

        var minutesData = JsonSerializer.Deserialize<MinutesData>(output, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (minutesData == null)
        {
            throw new Exception("Failed to parse minutes data from local AI");
        }

        await SaveMinutesToDatabase(meeting, minutesData);
    }

    // Helper class for HttpClientFactory
    private class HttpClientFactory : IHttpClientFactory
    {
        private readonly HttpClient _client;
        public HttpClientFactory(HttpClient client) => _client = client;
        public HttpClient CreateClient(string name) => _client;
    }

    // Response models
    private class OllamaResponse
    {
        public string? Response { get; set; }
        public bool Done { get; set; }
    }

    private class MinutesData
    {
        public List<string>? Agenda { get; set; }
        public List<string>? KeyPoints { get; set; }
        public List<string>? Decisions { get; set; }
        public List<ActionItemData>? ActionItems { get; set; }
    }

    private class ActionItemData
    {
        public string? Description { get; set; }
        public string? AssignedTo { get; set; }
        public DateTime? DueDate { get; set; }
    }
}
