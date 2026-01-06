using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.Dtos;
using api.Entities;
using api.Services;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;
    private readonly ISubscriptionService _subscriptionService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AppDbContext db, 
        IAuthService authService, 
        IEmailService emailService,
        ISubscriptionService subscriptionService,
        ILogger<AuthController> logger)
    {
        _db = db;
        _authService = authService;
        _emailService = emailService;
        _subscriptionService = subscriptionService;
        _logger = logger;
    }

    [HttpPost("send-verification-code")]
    public async Task<IActionResult> SendVerificationCode([FromBody] SendVerificationCodeDto dto)
    {
        try
        {
            // Validate email format
            if (!new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(dto.Email))
            {
                return BadRequest(new { message = "Invalid email format" });
            }

            // Check if email domain is valid
            if (!await _emailService.IsValidEmailDomainAsync(dto.Email))
            {
                return BadRequest(new { message = "Email domain does not exist or cannot receive emails" });
            }

            // Check if email is already registered
            var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already registered" });
            }

            // Delete any existing verification codes for this email
            var existingVerifications = _db.EmailVerifications.Where(v => v.Email == dto.Email);
            _db.EmailVerifications.RemoveRange(existingVerifications);

            // Generate 6-digit code
            var code = new Random().Next(100000, 999999).ToString();

            // Save verification code
            var verification = new EmailVerification
            {
                Email = dto.Email,
                Code = code,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                IsVerified = false,
                AttemptCount = 0
            };

            _db.EmailVerifications.Add(verification);
            await _db.SaveChangesAsync();

            // Send email
            var emailSent = await _emailService.SendVerificationCodeAsync(dto.Email, code);

            if (!emailSent)
            {
                _logger.LogWarning("Failed to send verification email to {Email}", dto.Email);
                // Don't return error - code is still valid, user can try again
            }

            _logger.LogInformation("Verification code sent to {Email}", dto.Email);

            return Ok(new { message = "Verification code sent to your email" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending verification code");
            return StatusCode(500, new { message = "An error occurred while sending verification code" });
        }
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCodeDto dto)
    {
        try
        {
            var verification = await _db.EmailVerifications
                .Where(v => v.Email == dto.Email && !v.IsVerified)
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefaultAsync();

            if (verification == null)
            {
                return BadRequest(new { message = "No verification code found for this email" });
            }

            if (verification.ExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Verification code has expired. Please request a new one." });
            }

            if (verification.AttemptCount >= 5)
            {
                return BadRequest(new { message = "Too many failed attempts. Please request a new code." });
            }

            // Increment attempt count
            verification.AttemptCount++;

            if (verification.Code != dto.Code)
            {
                await _db.SaveChangesAsync();
                return BadRequest(new { message = $"Invalid verification code. {5 - verification.AttemptCount} attempts remaining." });
            }

            // Mark as verified
            verification.IsVerified = true;
            await _db.SaveChangesAsync();

            _logger.LogInformation("Email verified successfully: {Email}", dto.Email);

            return Ok(new { message = "Email verified successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying email");
            return StatusCode(500, new { message = "An error occurred while verifying email" });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        try
        {
            // Check if email was verified
            var verification = await _db.EmailVerifications
                .Where(v => v.Email == dto.Email && v.IsVerified && v.Code == dto.VerificationCode)
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefaultAsync();

            if (verification == null)
            {
                return BadRequest(new { message = "Email not verified. Please verify your email first." });
            }

            // Check if verification is still valid (within 30 minutes)
            if (verification.CreatedAt.AddMinutes(30) < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Verification expired. Please request a new verification code." });
            }

            // Check if user already exists
            var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already registered" });
            }

            // Create new user
            var user = new User
            {
                Email = dto.Email,
                FullName = dto.FullName,
                PasswordHash = _authService.HashPassword(dto.Password),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // Create free subscription for the new user
            await _subscriptionService.CreateFreeSubscriptionAsync(user.Id);

            _logger.LogInformation("User registered successfully: {Email}", user.Email);

            // Generate token
            var token = _authService.GenerateJwtToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration");
            return StatusCode(500, new { message = "An error occurred during registration" });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        try
        {
            // Find user by email
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Verify password
            if (!_authService.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Account is disabled" });
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            _logger.LogInformation("User logged in: {Email}", user.Email);

            // Generate token
            var token = _authService.GenerateJwtToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user login");
            return StatusCode(500, new { message = "An error occurred during login" });
        }
    }
}
