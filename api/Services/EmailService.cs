using DnsClient;
using MailKit.Net.Smtp;
using MimeKit;

namespace api.Services;

public class EmailService : IEmailService
{
    private readonly ILookupClient _dnsClient;
    private readonly ILogger<EmailService> _logger;
    private readonly string? _smtpHost;
    private readonly int _smtpPort;
    private readonly string? _smtpUsername;
    private readonly string? _smtpPassword;
    private readonly string? _senderEmail;
    private readonly string? _senderName;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _logger = logger;
        _dnsClient = new LookupClient();
        
        _smtpHost = config["Email:SmtpHost"];
        _smtpPort = int.TryParse(config["Email:SmtpPort"], out var port) ? port : 587;
        _smtpUsername = config["Email:Username"];
        _smtpPassword = config["Email:Password"];
        _senderEmail = config["Email:SenderEmail"];
        _senderName = config["Email:SenderName"] ?? "MeetMind";
        
        if (string.IsNullOrEmpty(_smtpHost) || string.IsNullOrEmpty(_smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
        {
            _logger.LogWarning("SMTP not configured. Email sending will be simulated (check console for codes).");
        }
        else
        {
            _logger.LogInformation("Email service initialized with SMTP: {Host}:{Port}", _smtpHost, _smtpPort);
        }
    }

    public async Task<bool> IsValidEmailDomainAsync(string email)
    {
        try
        {
            var domain = email.Split('@').LastOrDefault();
            if (string.IsNullOrEmpty(domain))
                return false;

            // Check if domain has MX records (mail exchange records)
            var result = await _dnsClient.QueryAsync(domain, QueryType.MX);
            return result.Answers.MxRecords().Any();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to validate email domain for {Email}", email);
            // If DNS check fails, allow common domains
            var commonDomains = new[] { "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com" };
            var domain = email.Split('@').LastOrDefault()?.ToLower();
            return commonDomains.Contains(domain);
        }
    }

    public async Task<bool> SendVerificationCodeAsync(string email, string code)
    {
        try
        {
            if (string.IsNullOrEmpty(_smtpHost) || string.IsNullOrEmpty(_smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
            {
                // Simulate email sending in development
                _logger.LogInformation("📧 SIMULATED EMAIL - Verification code for {Email}: {Code}", email, code);
                await Task.Delay(100); // Simulate network delay
                return true;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_senderName, _senderEmail ?? _smtpUsername));
            message.To.Add(new MailboxAddress("", email));
            message.Subject = $"Your MeetMind Verification Code: {code}";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <html>
                        <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                            <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;'>
                                <h1 style='color: white; margin: 0; font-size: 32px;'>🎯 MeetMind</h1>
                            </div>
                            <div style='padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;'>
                                <h2 style='color: #333;'>Verify Your Email</h2>
                                <p style='color: #666; font-size: 16px;'>Enter this verification code to complete your registration:</p>
                                <div style='background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;'>
                                    <h1 style='color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: monospace;'>{code}</h1>
                                </div>
                                <p style='color: #999; font-size: 14px;'>This code will expire in 10 minutes.</p>
                                <p style='color: #999; font-size: 14px;'>If you didn't request this code, please ignore this email.</p>
                            </div>
                            <div style='text-align: center; padding: 20px; color: #999; font-size: 12px;'>
                                <p>© 2025 MeetMind. All rights reserved.</p>
                            </div>
                        </body>
                    </html>
                ",
                TextBody = $@"
MeetMind - Email Verification

Your verification code is: {code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

© 2025 MeetMind
                "
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_smtpHost, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtpUsername, _smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("✅ Verification email sent successfully to {Email}", email);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send verification email to {Email}", email);
            // Still return true in dev mode so user can continue (code is logged)
            if (string.IsNullOrEmpty(_smtpHost))
            {
                _logger.LogInformation("📧 SIMULATED EMAIL - Verification code for {Email}: {Code}", email, code);
                return true;
            }
            return false;
        }
    }
}
