using System.Text.Json.Serialization;

namespace api.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // User, Admin
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;

    [JsonIgnore]
    public List<Meeting> Meetings { get; set; } = new();
    
    [JsonIgnore]
    public Subscription? Subscription { get; set; }
}
