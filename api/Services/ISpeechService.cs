namespace api.Services;

public interface ISpeechService
{
    Task<string> TranscribeAudioAsync(Stream audioStream, string fileName);
}