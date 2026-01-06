using System.ComponentModel.DataAnnotations;

namespace api.Dtos;

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MinLength(2)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public string VerificationCode { get; set; } = string.Empty;
}
