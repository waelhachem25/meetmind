using System.Text.Json.Serialization;

namespace api.Entities;

public class Transcript
{
    public int Id { get; set; }
    public int MeetingId { get; set; }
    public int Version { get; set; } = 1;
    public string Text { get; set; } = string.Empty;
    public bool IsEdited { get; set; } = false;
    public DateTime? EditedAt { get; set; }
    
    [JsonIgnore]
    public Meeting Meeting { get; set; } = null!;
}