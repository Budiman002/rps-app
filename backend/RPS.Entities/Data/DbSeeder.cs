using Microsoft.EntityFrameworkCore;

namespace RPS.Entities;

public class DbSeeder
{
    private readonly AppDbContext _context;

    public DbSeeder(AppDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        await _context.Database.MigrateAsync();

        if (!await _context.Users.AnyAsync())
        {
            var now = DateTime.UtcNow;
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword("Admin123!");
            var users = new List<User>
            {
                new()
                {
                    FullName = "Admin GM",
                    Email = "gm@rps.com",
                    Password = hashedPassword,
                    Role = UserRole.GM,
                    ContractType = ContractType.Permanent,
                    YearsOfExperience = 12,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new()
                {
                    FullName = "Admin PM",
                    Email = "pm@rps.com",
                    Password = hashedPassword,
                    Role = UserRole.PM,
                    ContractType = ContractType.Permanent,
                    YearsOfExperience = 8,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new()
                {
                    FullName = "Admin Marketing",
                    Email = "marketing@rps.com",
                    Password = hashedPassword,
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
                    Email = "hr@rps.com",
                    Password = hashedPassword,
                    Role = UserRole.HR,
                    ContractType = ContractType.Permanent,
                    YearsOfExperience = 7,
                    CreatedAt = now,
                    UpdatedAt = now
                }
            };

            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();
        }

        if (!await _context.Employees.AnyAsync())
        {
            var now = DateTime.UtcNow;
            var employees = new List<Employee>
            {
                new() { FullName = "Sarah Johnson", Email = "sarah.johnson@company.com", JobTitle = "Project Manager", SeniorityLevel = "Senior", ContractType = "permanent", YearsOfExperience = 6, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Michael Chen", Email = "michael.chen@company.com", JobTitle = "UI/UX Designer", SeniorityLevel = "Senior", ContractType = "permanent", YearsOfExperience = 7, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Emily Rodriguez", Email = "emily.rodriguez@company.com", JobTitle = "Frontend Developer", SeniorityLevel = "Senior", ContractType = "permanent", YearsOfExperience = 5, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "David Kim", Email = "david.kim@company.com", JobTitle = "Frontend Developer", SeniorityLevel = "Senior", ContractType = "contract", ContractEndDate = new DateTime(2026, 6, 30), YearsOfExperience = 4, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Jessica Martinez", Email = "jessica.martinez@company.com", JobTitle = "Backend Developer", SeniorityLevel = "Junior", ContractType = "permanent", YearsOfExperience = 2, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Robert Taylor", Email = "robert.taylor@company.com", JobTitle = "Project Manager", SeniorityLevel = "Senior", ContractType = "permanent", YearsOfExperience = 8, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Amanda Lee", Email = "amanda.lee@company.com", JobTitle = "UI/UX Designer", SeniorityLevel = "Senior", ContractType = "permanent", YearsOfExperience = 6, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Christopher Brown", Email = "christopher.brown@company.com", JobTitle = "Mobile Developer", SeniorityLevel = "Senior", ContractType = "permanent", YearsOfExperience = 7, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Jennifer Wilson", Email = "jennifer.wilson@company.com", JobTitle = "Mobile Developer", SeniorityLevel = "Senior", ContractType = "contract", ContractEndDate = new DateTime(2026, 8, 31), YearsOfExperience = 5, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Daniel Garcia", Email = "daniel.garcia@company.com", JobTitle = "Backend Developer", SeniorityLevel = "Senior", ContractType = "permanent", YearsOfExperience = 6, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Lisa Anderson", Email = "lisa.anderson@company.com", JobTitle = "QA Engineer", SeniorityLevel = "Junior", ContractType = "permanent", YearsOfExperience = 2, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "James Thompson", Email = "james.thompson@company.com", JobTitle = "Data Engineer", SeniorityLevel = "Senior", ContractType = "permanent", YearsOfExperience = 7, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Karen White", Email = "karen.white@company.com", JobTitle = "Data Engineer", SeniorityLevel = "Senior", ContractType = "permanent", YearsOfExperience = 5, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Thomas Miller", Email = "thomas.miller@company.com", JobTitle = "Frontend Developer", SeniorityLevel = "Senior", ContractType = "permanent", YearsOfExperience = 4, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Nancy Davis", Email = "nancy.davis@company.com", JobTitle = "Backend Developer", SeniorityLevel = "Senior", ContractType = "contract", ContractEndDate = new DateTime(2026, 12, 31), YearsOfExperience = 5, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Paul Martinez", Email = "paul.martinez@company.com", JobTitle = "Frontend Developer", SeniorityLevel = "Junior", ContractType = "permanent", YearsOfExperience = 2, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Sandra Moore", Email = "sandra.moore@company.com", JobTitle = "Backend Developer", SeniorityLevel = "Junior", ContractType = "permanent", YearsOfExperience = 2, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Kevin Johnson", Email = "kevin.johnson@company.com", JobTitle = "QA Engineer", SeniorityLevel = "Junior", ContractType = "permanent", YearsOfExperience = 1, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Alex Thompson", Email = "alex.thompson@company.com", JobTitle = "Project Manager", SeniorityLevel = "Junior", ContractType = "permanent", YearsOfExperience = 2, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Jordan Smith", Email = "jordan.smith@company.com", JobTitle = "Project Manager", SeniorityLevel = "Junior", ContractType = "permanent", YearsOfExperience = 1, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Rachel Brown", Email = "rachel.brown@company.com", JobTitle = "Data Engineer", SeniorityLevel = "Junior", ContractType = "permanent", YearsOfExperience = 1, CreatedAt = now, UpdatedAt = now }
            };

            await _context.Employees.AddRangeAsync(employees);
            await _context.SaveChangesAsync();
        }

        if (!await _context.Projects.AnyAsync())
        {
            var now = DateTime.UtcNow;
            var gm = await _context.Users.FirstAsync(x => x.Role == UserRole.GM);
            var pm = await _context.Users.FirstAsync(x => x.Role == UserRole.PM);

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

            await _context.Projects.AddRangeAsync(projects);
            await _context.SaveChangesAsync();
        }
    }
}
