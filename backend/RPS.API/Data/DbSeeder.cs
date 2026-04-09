using Microsoft.EntityFrameworkCore;
using RPS.API.Models;

namespace RPS.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (!await context.Users.AnyAsync())
        {
            var now = DateTime.UtcNow;
            var users = new List<User>
            {
                new()
                {
                    FullName = "Admin GM",
                    Email = "admin.gm@rps.local",
                    Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = UserRole.GM,
                    ContractType = ContractType.Permanent,
                    YearsOfExperience = 12,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new()
                {
                    FullName = "Admin PM",
                    Email = "admin.pm@rps.local",
                    Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = UserRole.PM,
                    ContractType = ContractType.Permanent,
                    YearsOfExperience = 8,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new()
                {
                    FullName = "Admin Marketing",
                    Email = "admin.marketing@rps.local",
                    Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = UserRole.Marketing,
                    ContractType = ContractType.Contract,
                    ContractEndDate = now.AddMonths(12),
                    YearsOfExperience = 6,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new()
                {
                    FullName = "Admin HR",
                    Email = "admin.hr@rps.local",
                    Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                    Role = UserRole.HR,
                    ContractType = ContractType.Permanent,
                    YearsOfExperience = 7,
                    CreatedAt = now,
                    UpdatedAt = now
                }
            };

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();
        }

        if (!await context.Projects.AnyAsync())
        {
            var now = DateTime.UtcNow;
            var gm = await context.Users.FirstAsync(x => x.Role == UserRole.GM);
            var pm = await context.Users.FirstAsync(x => x.Role == UserRole.PM);

            var projects = new List<Project>
            {
                new()
                {
                    Name = "RPS Core Implementation",
                    ClientName = "Internal",
                    Description = "Initial resource planning rollout.",
                    NotesFromMarketing = "Priority initiative",
                    Priority = ProjectPriority.High,
                    Status = ProjectStatus.Unassigned,
                    ExpectedStartDate = now.Date.AddDays(7),
                    EstimatedEndDate = now.Date.AddDays(70),
                    DurationWeeks = 9,
                    CreatedBy = gm.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new()
                {
                    Name = "Client Alpha Onboarding",
                    ClientName = "Alpha Corp",
                    Description = "Onboarding and planning for Alpha Corp.",
                    NotesFromMarketing = "Need fast kickoff",
                    Priority = ProjectPriority.Medium,
                    Status = ProjectStatus.Scheduled,
                    ExpectedStartDate = now.Date.AddDays(3),
                    EstimatedEndDate = now.Date.AddDays(45),
                    DurationWeeks = 6,
                    CreatedBy = gm.Id,
                    AssignedPmId = pm.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new()
                {
                    Name = "Client Beta Expansion",
                    ClientName = "Beta Industries",
                    Description = "Expansion project for Beta team.",
                    NotesFromMarketing = "High visibility",
                    Priority = ProjectPriority.Critical,
                    Status = ProjectStatus.InProgress,
                    ExpectedStartDate = now.Date.AddDays(-14),
                    ActualStartDate = now.Date.AddDays(-10),
                    EstimatedEndDate = now.Date.AddDays(30),
                    DurationWeeks = 8,
                    CreatedBy = gm.Id,
                    AssignedPmId = pm.Id,
                    CreatedAt = now,
                    UpdatedAt = now
                }
            };

            await context.Projects.AddRangeAsync(projects);
            await context.SaveChangesAsync();
        }
    }
}
