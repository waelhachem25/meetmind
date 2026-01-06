using System.Text.Json.Serialization;

namespace api.Entities;

public class Minutes
{
    public int Id { get; set; }
    public int MeetingId { get; set; }
    public int Version { get; set; } = 1;
    public List<string> Agenda { get; set; } = new();
    public List<string> KeyPoints { get; set; } = new();
    public List<string> Decisions { get; set; } = new();
    
    public List<ActionItem> ActionItems { get; set; } = new();
    
    [JsonIgnore]
    public Meeting Meeting { get; set; } = null!;
}