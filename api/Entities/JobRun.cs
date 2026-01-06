namespace api.Entities;

public enum JobKind { Transcribe = 0, Summarize = 1, Regenerate = 2 }
public enum JobResult { Pending = 0, Success = 1, Failed = 2 }

public class JobRun
{
    public int Id { get; set; }
    public int MeetingId { get; set; }
    public Meeting Meeting { get; set; } = null!;
    public JobKind Kind { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; }
    public JobResult Result { get; set; } = JobResult.Pending;
    public string? ErrorMessage { get; set; }
}
