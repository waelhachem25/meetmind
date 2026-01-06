using api.Data;
using api.Entities;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PipelineJobs
{
    private readonly AppDbContext _db;
    private readonly IBlobStorage _blobs;
    private readonly ISpeechService _speech;
    private readonly IOpenAIService _openai;
    private readonly IAudioMetadataService _audioMetadata;
    private readonly ILogger<PipelineJobs> _logger;

    public PipelineJobs(
        AppDbContext db, 
        IBlobStorage blobs, 
        ISpeechService speech, 
        IOpenAIService openai,
        IAudioMetadataService audioMetadata,
        ILogger<PipelineJobs> logger)
    {
        _db = db;
        _blobs = blobs;
        _speech = speech;
        _openai = openai;
        _audioMetadata = audioMetadata;
        _logger = logger;
    }

    public async Task ProcessUploadedAudio(int meetingId, int assetId)
    {
        try
        {
            var meeting = await _db.Meetings
                .Include(m => m.Transcript)
                .FirstOrDefaultAsync(m => m.Id == meetingId);
            
            var asset = await _db.AudioAssets.FindAsync(assetId);

            if (meeting == null || asset == null)
            {
                _logger.LogError("Meeting {MeetingId} or asset {AssetId} not found", meetingId, assetId);
                return;
            }

            // Step 1: Extract duration and transcribe audio
            meeting.Status = MeetingStatus.Transcribing;
            await _db.SaveChangesAsync();

            // First: Extract duration from the audio file
            _logger.LogInformation("Extracting duration for meeting {MeetingId}...", meetingId);
            using (var durationStream = await _blobs.DownloadAsync(asset.Container, asset.BlobName))
            {
                var duration = await _audioMetadata.GetDurationInMinutesAsync(durationStream, asset.OriginalFileName);
                meeting.DurationMinutes = duration;
                await _db.SaveChangesAsync();
                _logger.LogInformation("✅ Meeting {MeetingId} duration set to {Duration} minutes", meetingId, duration);
            }

            // Check duration limit based on subscription plan
            var user = await _db.Users
                .Include(u => u.Subscription)
                .FirstOrDefaultAsync(u => u.Id == meeting.UserId);
            
            if (user?.Subscription != null)
            {
                int maxDuration = user.Subscription.Plan switch
                {
                    SubscriptionPlan.Free => 30,
                    SubscriptionPlan.Pro => 120,  // 2 hours
                    SubscriptionPlan.Enterprise => int.MaxValue,  // Unlimited
                    _ => 30
                };

                if (meeting.DurationMinutes > maxDuration)
                {
                    meeting.Status = MeetingStatus.Failed;
                    await _db.SaveChangesAsync();
                    _logger.LogWarning("❌ Meeting {MeetingId} exceeds duration limit: {Duration} > {MaxDuration} minutes for {Plan} plan", 
                        meetingId, meeting.DurationMinutes, maxDuration, user.Subscription.Plan);
                    throw new Exception($"Audio duration ({meeting.DurationMinutes} min) exceeds your plan limit of {maxDuration} minutes. Please upgrade your plan.");
                }
            }

            // Second: Download and transcribe the audio (fresh download since Azure streams can't be reused)
            _logger.LogInformation("Transcribing audio for meeting {MeetingId}...", meetingId);
            string transcribedText;
            using (var transcriptionStream = await _blobs.DownloadAsync(asset.Container, asset.BlobName))
            {
                transcribedText = await _speech.TranscribeAudioAsync(transcriptionStream, asset.OriginalFileName);
                _logger.LogInformation("🔍 Transcription returned {Length} characters", transcribedText?.Length ?? 0);
                
                if (string.IsNullOrWhiteSpace(transcribedText))
                {
                    throw new Exception("Transcription service returned empty text");
                }
            }

            // Create transcript entity OUTSIDE the using block
            var transcript = new Transcript 
            { 
                MeetingId = meetingId, 
                Text = transcribedText, 
                Version = 1 
            };
            
            _logger.LogInformation("🔍 Created transcript entity with text length: {Length}", transcript.Text.Length);
            _db.Transcripts.Add(transcript);
            
            _logger.LogInformation("✅ Meeting {MeetingId} transcription completed", meetingId);

            // Step 2: Generate Minutes
            meeting.Status = MeetingStatus.Summarizing;
            await _db.SaveChangesAsync();
            _logger.LogInformation("🔍 SaveChanges completed, transcript should be in DB now");

            // Explicitly query for the transcript that was just saved
            var savedTranscript = await _db.Transcripts
                .Where(t => t.MeetingId == meetingId)
                .OrderByDescending(t => t.Version)
                .FirstOrDefaultAsync();
            
            _logger.LogInformation("🔍 Query result: savedTranscript is {Status}, Text length: {Length}", 
                savedTranscript == null ? "NULL" : "NOT NULL",
                savedTranscript?.Text?.Length ?? 0);
            
            if (savedTranscript == null || string.IsNullOrWhiteSpace(savedTranscript.Text))
            {
                throw new Exception($"Failed to save transcript for meeting {meetingId}. Transcript is {(savedTranscript == null ? "null" : "empty")}");
            }

            // Manually attach it to the meeting entity
            meeting.Transcript = savedTranscript;
            _logger.LogInformation("🔍 About to call GenerateMinutesAsync with meeting.Transcript.Text length: {Length}", meeting.Transcript.Text.Length);

            await _openai.GenerateMinutesAsync(meeting);

            // Step 3: Complete
            meeting.Status = MeetingStatus.Completed;
            meeting.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            _logger.LogInformation("Successfully processed meeting {MeetingId}", meetingId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process meeting {MeetingId}", meetingId);
            
            var meeting = await _db.Meetings.FindAsync(meetingId);
            if (meeting != null)
            {
                meeting.Status = MeetingStatus.Failed;
                await _db.SaveChangesAsync();
            }
        }
    }
}
