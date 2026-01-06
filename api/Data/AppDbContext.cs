using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using api.Entities;

namespace api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Meeting> Meetings { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Transcript> Transcripts { get; set; } = null!;
    public DbSet<Minutes> Minutes { get; set; } = null!;
    public DbSet<AudioAsset> AudioAssets { get; set; } = null!;
    public DbSet<ActionItem> ActionItems { get; set; } = null!;
    public DbSet<EmailVerification> EmailVerifications { get; set; } = null!;
    public DbSet<Subscription> Subscriptions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder m)
    {
        base.OnModelCreating(m);

        var stringListComparer = new ValueComparer<List<string>>(
            (c1, c2) => c1!.SequenceEqual(c2!),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToList());

        m.Entity<Meeting>(e =>
        {
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.User).WithMany(u => u.Meetings).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Transcript).WithOne(t => t.Meeting).HasForeignKey<Transcript>(t => t.MeetingId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Minutes).WithOne(min => min.Meeting).HasForeignKey<Minutes>(min => min.MeetingId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.AudioAssets).WithOne().HasForeignKey(a => a.MeetingId).OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.Title).IsRequired().HasMaxLength(500);
            e.HasKey(x => x.Id);
        });

        m.Entity<User>(e =>
        {
            e.Property(x => x.Email).IsRequired().HasMaxLength(255);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.FullName).IsRequired().HasMaxLength(255);
            e.Property(x => x.PasswordHash).IsRequired();
            e.HasKey(x => x.Id);
        });

        m.Entity<Minutes>(e =>
        {
            e.Property(x => x.Agenda)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new())
                .Metadata.SetValueComparer(stringListComparer);
            
            e.Property(x => x.KeyPoints)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new())
                .Metadata.SetValueComparer(stringListComparer);
            
            e.Property(x => x.Decisions)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new())
                .Metadata.SetValueComparer(stringListComparer);
            
            e.HasMany(x => x.ActionItems).WithOne(a => a.Minutes).HasForeignKey(a => a.MinutesId).OnDelete(DeleteBehavior.Cascade);
            e.HasKey(x => x.Id);
        });

        m.Entity<ActionItem>(e =>
        {
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.Description).IsRequired().HasMaxLength(1000);
            e.HasKey(x => x.Id);
        });

        m.Entity<Transcript>(e =>
        {
            e.Property(x => x.Text).IsRequired();
            e.HasKey(x => x.Id);
        });

        m.Entity<AudioAsset>(e =>
        {
            e.Property(x => x.BlobName).IsRequired();
            e.Property(x => x.Container).IsRequired();
            e.HasKey(x => x.Id);
        });

        m.Entity<EmailVerification>(e =>
        {
            e.Property(x => x.Email).IsRequired().HasMaxLength(255);
            e.Property(x => x.Code).IsRequired().HasMaxLength(10);
            e.HasIndex(x => x.Email);
            e.HasKey(x => x.Id);
        });

        m.Entity<Subscription>(e =>
        {
            e.Property(x => x.Plan).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.User).WithOne(u => u.Subscription).HasForeignKey<Subscription>(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.StripeCustomerId);
            e.HasIndex(x => x.StripeSubscriptionId);
            e.HasKey(x => x.Id);
        });
    }
}
