using System.Text.Json.Serialization;

namespace api.Entities;

public enum MeetingStatus
{
    Uploaded,
    Transcribing,
    Summarizing,
    Completed,
    Failed
}

public class Meeting
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime DateUtc { get; set; }
    public int DurationMinutes { get; set; }
    public string? Location { get; set; }
    public string? Participants { get; set; }
    public MeetingStatus Status { get; set; } = MeetingStatus.Uploaded;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime MeetingDate => DateUtc;
    
    [JsonIgnore]
    public User User { get; set; } = null!;
    
    [JsonIgnore]
    public Transcript? Transcript { get; set; }
    
    [JsonIgnore]
    public Minutes? Minutes { get; set; }
    
    [JsonIgnore]
    public List<AudioAsset> AudioAssets { get; set; } = new();
}