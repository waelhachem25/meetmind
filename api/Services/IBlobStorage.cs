namespace api.Services;

public interface IBlobStorage
{
    Task UploadAsync(string containerName, string blobName, Stream content, string contentType);
    Task<Stream> DownloadAsync(string containerName, string blobName);
    Task DeleteAsync(string containerName, string blobName);
}