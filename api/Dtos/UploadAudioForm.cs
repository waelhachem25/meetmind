using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Dtos;

public class UploadAudioForm
{
    [FromForm(Name = "file")]
    public IFormFile File { get; set; } = default!;
}
