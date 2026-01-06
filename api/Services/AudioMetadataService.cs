using System.Diagnostics;

namespace api.Services;

public class AudioMetadataService : IAudioMetadataService
{
    private readonly ILogger<AudioMetadataService> _logger;

    public AudioMetadataService(ILogger<AudioMetadataService> logger)
    {
        _logger = logger;
    }

    public async Task<int> GetDurationInMinutesAsync(Stream audioStream, string fileName)
    {
        var tempFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{Path.GetExtension(fileName)}");
        
        try
        {
            // First, save the Azure Blob stream to a temp file
            // We can't use Position on Azure streams, so we write the entire stream to disk
            _logger.LogInformation("Writing audio stream to temp file for duration analysis: {TempFile}", tempFile);
            
            using (var fileStream = new FileStream(tempFile, FileMode.Create, FileAccess.Write, FileShare.None, 4096, FileOptions.Asynchronous))
            {
                await audioStream.CopyToAsync(fileStream);
                await fileStream.FlushAsync();
            }
            
            _logger.LogInformation("Audio file written, analyzing duration with ffprobe...");
            
            // Now use ffprobe to get the duration from the temp file
            var startInfo = new ProcessStartInfo
            {
                FileName = "ffprobe",
                Arguments = $"-v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"{tempFile}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (var process = Process.Start(startInfo))
            {
                if (process == null)
                {
                    _logger.LogWarning("Failed to start ffprobe process");
                    return 60; // Default fallback
                }

                var output = await process.StandardOutput.ReadToEndAsync();
                var errorOutput = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();

                if (process.ExitCode == 0 && double.TryParse(output.Trim(), out var durationSeconds))
                {
                    var durationMinutes = (int)Math.Ceiling(durationSeconds / 60.0);
                    _logger.LogInformation("✅ Audio duration extracted: {Duration} minutes ({Seconds} seconds)", durationMinutes, durationSeconds);
                    return durationMinutes;
                }
                else
                {
                    _logger.LogWarning("ffprobe failed with exit code {ExitCode}. Output: {Output}, Error: {Error}", 
                        process.ExitCode, output, errorOutput);
                    return 60; // Default fallback
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting audio duration from {FileName}, using default 60 minutes", fileName);
            return 60; // Default fallback
        }
        finally
        {
            // Clean up temp file
            try
            {
                if (File.Exists(tempFile))
                {
                    File.Delete(tempFile);
                    _logger.LogInformation("Temp file deleted: {TempFile}", tempFile);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete temp file: {TempFile}", tempFile);
            }
        }
    }
}
