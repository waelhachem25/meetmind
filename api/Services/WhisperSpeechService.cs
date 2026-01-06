using System.Diagnostics;

namespace api.Services;

/// <summary>
/// Speech-to-text service using local Whisper AI for transcription
/// </summary>
public class WhisperSpeechService : ISpeechService
{
    private readonly ILogger<WhisperSpeechService> _logger;

    public WhisperSpeechService(ILogger<WhisperSpeechService> logger)
    {
        _logger = logger;
    }

    public async Task<string> TranscribeAudioAsync(Stream audioStream, string fileName)
    {
        _logger.LogInformation("Using local Whisper AI for transcription: {FileName}", fileName);
        return await TranscribeWithLocalWhisper(audioStream, fileName);
    }

    private async Task<string> TranscribeWithLocalWhisper(Stream audioStream, string fileName)
    {
        var tempFile = Path.Combine(Path.GetTempPath(), fileName);
        var scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "transcribe.py");
        
        try
        {
            // Save audio stream to temp file
            _logger.LogInformation("Saving audio to temp file for transcription: {FileName}", fileName);
            using (var fs = File.Create(tempFile))
            {
                await audioStream.CopyToAsync(fs);
            }

            // Call Python speech recognition script (uses Whisper)
            _logger.LogInformation("Starting transcription with Whisper...");
            var startInfo = new ProcessStartInfo
            {
                FileName = "python3.12",
                Arguments = $"\"{scriptPath}\" \"{tempFile}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = System.Diagnostics.Process.Start(startInfo);
            if (process == null)
            {
                throw new Exception("Failed to start transcription process");
            }

            var outputTask = process.StandardOutput.ReadToEndAsync();
            var errorTask = process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync();

            var output = await outputTask;
            var error = await errorTask;

            if (process.ExitCode != 0)
            {
                _logger.LogError("Transcription failed: {Error}", error);
                throw new Exception($"Transcription failed: {error}");
            }

            var transcription = output.Trim();
            _logger.LogInformation("✅ Transcribed {Length} characters from {FileName}", transcription.Length, fileName);
            
            return transcription;
        }
        finally
        {
            // Clean up temp file
            if (File.Exists(tempFile))
            {
                try { File.Delete(tempFile); } catch { }
            }
        }
    }
}