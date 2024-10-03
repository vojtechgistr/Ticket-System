using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace API.Services;

public interface IFileUploadService
{
    public Task<string> UploadImageAsync(IFormFile file);
    public void DeleteImageIfExists(string fileName);
}

public class FileUploadService : IFileUploadService
{
    private readonly BlobContainerClient blobContainerClient;

    public FileUploadService(IConfiguration configuration)
    {
        BlobServiceClient blobServiceClient = new(configuration["ConnectionStrings:AzureBlobStorage"]);
        blobContainerClient = blobServiceClient.GetBlobContainerClient("avatars");
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        var validExtensions = new List<string>() { "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp" };
        if (!validExtensions.Contains(file.ContentType))
        {
            throw new ArgumentException($"Extension is not valid ({string.Join(',', validExtensions)})");
        }

        long size = file.Length;
        const int maxSizeInMB = 8;
        if (size > (maxSizeInMB * 1024 * 1024))
        {
            throw new ArgumentException($"Maximum size can be {maxSizeInMB}MB.");
        }

        string fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);

        BlobClient blob = blobContainerClient.GetBlobClient(fileName);
        var response = await blob.UploadAsync(file.OpenReadStream(), new BlobHttpHeaders()
        {
            ContentType = file.ContentType,
        });

        if (response.GetRawResponse().Status == 201)
        {
            return blob.Uri.ToString();
        }

        throw new Exception($"Error uploading to blob with name {file.FileName}. Status code: {response.GetRawResponse().Status}");
    }

    public void DeleteImageIfExists(string fileUrl)
    {
        string fileName = Path.GetFileName(fileUrl);
        BlobClient blob = blobContainerClient.GetBlobClient(fileName);
        blob.DeleteIfExists();
    }
}