namespace api.Entities;

public class AudioAsset
{
    public int Id { get; set; }
    public int MeetingId { get; set; }
    public string BlobName { get; set; } = string.Empty;
    public string Container { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
