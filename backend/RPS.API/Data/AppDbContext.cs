using Microsoft.EntityFrameworkCore;
using RPS.API.Models;

namespace RPS.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectRoleComposition> ProjectRoleCompositions => Set<ProjectRoleComposition>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
    public DbSet<ChangeRequest> ChangeRequests => Set<ChangeRequest>();
    public DbSet<ContractExtendRequest> ContractExtendRequests => Set<ContractExtendRequest>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Role).HasConversion<string>();
            entity.Property(x => x.ContractType).HasConversion<string>();
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.Property(x => x.Priority).HasConversion<string>();
            entity.Property(x => x.Status).HasConversion<string>();

            entity.HasOne(x => x.CreatedByUser)
                .WithMany(x => x.CreatedProjects)
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.AssignedPm)
                .WithMany(x => x.AssignedProjects)
                .HasForeignKey(x => x.AssignedPmId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProjectRoleComposition>(entity =>
        {
            entity.Property(x => x.SeniorityLevel).HasConversion<string>();
            entity.Property(x => x.EmploymentStatus).HasConversion<string>();
        });

        modelBuilder.Entity<ProjectMember>(entity =>
        {
            entity.HasOne(x => x.AssignedByUser)
                .WithMany()
                .HasForeignKey(x => x.AssignedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ChangeRequest>(entity =>
        {
            entity.Property(x => x.RequestType).HasConversion<string>();
            entity.Property(x => x.Status).HasConversion<string>();

            entity.HasOne(x => x.RequestedByUser)
                .WithMany()
                .HasForeignKey(x => x.RequestedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ContractExtendRequest>(entity =>
        {
            entity.Property(x => x.Status).HasConversion<string>();

            entity.HasOne(x => x.Employee)
                .WithMany()
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.RequestedByUser)
                .WithMany()
                .HasForeignKey(x => x.RequestedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasOne(x => x.Recipient)
                .WithMany()
                .HasForeignKey(x => x.RecipientId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
