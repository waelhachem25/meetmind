namespace api.Services;

public interface IEmailService
{
    Task<bool> SendVerificationCodeAsync(string email, string code);
    Task<bool> IsValidEmailDomainAsync(string email);
}
