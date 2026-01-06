using Azure.Storage.Blobs;

namespace api.Services;

public class BlobStorage : IBlobStorage
{
    private readonly BlobServiceClient _client;

    public BlobStorage(BlobServiceClient client)
    {
        _client = client;
    }

    public async Task UploadAsync(string containerName, string blobName, Stream content, string contentType)
    {
        var container = _client.GetBlobContainerClient(containerName);
        await container.CreateIfNotExistsAsync();
        var blob = container.GetBlobClient(blobName);
        await blob.UploadAsync(content, overwrite: true);
    }

    public async Task<Stream> DownloadAsync(string containerName, string blobName)
    {
        var blob = _client.GetBlobContainerClient(containerName).GetBlobClient(blobName);
        var response = await blob.DownloadAsync();
        return response.Value.Content;
    }

    public async Task DeleteAsync(string containerName, string blobName)
    {
        var blob = _client.GetBlobContainerClient(containerName).GetBlobClient(blobName);
        await blob.DeleteIfExistsAsync();
    }
}