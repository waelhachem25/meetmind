namespace api.Dtos;

public class CreateMeetingDto
{
    public string Title { get; set; } = string.Empty;
    public DateTime DateUtc { get; set; }
    public int DurationMinutes { get; set; }
    public string? Location { get; set; }
    public string? Participants { get; set; }
}
