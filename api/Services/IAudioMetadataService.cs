namespace api.Services;

public interface IAudioMetadataService
{
    Task<int> GetDurationInMinutesAsync(Stream audioStream, string fileName);
}
