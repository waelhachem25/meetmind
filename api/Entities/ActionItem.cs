using System.Text.Json.Serialization;

namespace api.Entities;



public class ActionItem
{
    public int Id { get; set; }
    public int MinutesId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public DateTime? DueDate { get; set; }
    public ActionItemStatus Status { get; set; } = ActionItemStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    [JsonIgnore]
    public Minutes Minutes { get; set; } = null!;

    

    public string? LastModifiedBy { get; set; }
    public DateTime? LastModifiedAt { get; set; }
}

public enum ActionItemStatus
{
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}
