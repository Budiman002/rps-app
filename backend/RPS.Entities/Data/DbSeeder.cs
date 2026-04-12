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
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword("Admin123!");
            var employees = new List<Employee>
            {
                new() { FullName = "Sarah Johnson", Email = "sarah.johnson@company.com", JobTitle = "Project Manager", SeniorityLevel = "Senior", ContractType = "Permanent", YearsOfExperience = 6, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Michael Chen", Email = "michael.chen@company.com", JobTitle = "UI/UX Designer", SeniorityLevel = "Senior", ContractType = "Permanent", YearsOfExperience = 7, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Emily Rodriguez", Email = "emily.rodriguez@company.com", JobTitle = "Frontend Developer", SeniorityLevel = "Senior", ContractType = "Permanent", YearsOfExperience = 5, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "David Kim", Email = "david.kim@company.com", JobTitle = "Frontend Developer", SeniorityLevel = "Senior", ContractType = "Contract", ContractEndDate = new DateTime(2026, 6, 30), YearsOfExperience = 4, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Jessica Martinez", Email = "jessica.martinez@company.com", JobTitle = "Backend Developer", SeniorityLevel = "Junior", ContractType = "Permanent", YearsOfExperience = 2, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Robert Taylor", Email = "robert.taylor@company.com", JobTitle = "Project Manager", SeniorityLevel = "Senior", ContractType = "Permanent", YearsOfExperience = 8, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Amanda Lee", Email = "amanda.lee@company.com", JobTitle = "UI/UX Designer", SeniorityLevel = "Senior", ContractType = "Permanent", YearsOfExperience = 6, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Christopher Brown", Email = "christopher.brown@company.com", JobTitle = "Mobile Developer", SeniorityLevel = "Senior", ContractType = "Permanent", YearsOfExperience = 7, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Jennifer Wilson", Email = "jennifer.wilson@company.com", JobTitle = "Mobile Developer", SeniorityLevel = "Senior", ContractType = "Contract", ContractEndDate = new DateTime(2026, 8, 31), YearsOfExperience = 5, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Daniel Garcia", Email = "daniel.garcia@company.com", JobTitle = "Backend Developer", SeniorityLevel = "Senior", ContractType = "Permanent", YearsOfExperience = 6, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Lisa Anderson", Email = "lisa.anderson@company.com", JobTitle = "QA Engineer", SeniorityLevel = "Junior", ContractType = "Permanent", YearsOfExperience = 2, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "James Thompson", Email = "james.thompson@company.com", JobTitle = "Data Engineer", SeniorityLevel = "Senior", ContractType = "Permanent", YearsOfExperience = 7, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Karen White", Email = "karen.white@company.com", JobTitle = "Data Engineer", SeniorityLevel = "Senior", ContractType = "Permanent", YearsOfExperience = 5, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Thomas Miller", Email = "thomas.miller@company.com", JobTitle = "Frontend Developer", SeniorityLevel = "Senior", ContractType = "Permanent", YearsOfExperience = 4, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Nancy Davis", Email = "nancy.davis@company.com", JobTitle = "Backend Developer", SeniorityLevel = "Senior", ContractType = "Contract", ContractEndDate = new DateTime(2026, 12, 31), YearsOfExperience = 5, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Paul Martinez", Email = "paul.martinez@company.com", JobTitle = "Frontend Developer", SeniorityLevel = "Junior", ContractType = "Permanent", YearsOfExperience = 2, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Sandra Moore", Email = "sandra.moore@company.com", JobTitle = "Backend Developer", SeniorityLevel = "Junior", ContractType = "Permanent", YearsOfExperience = 2, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Kevin Johnson", Email = "kevin.johnson@company.com", JobTitle = "QA Engineer", SeniorityLevel = "Junior", ContractType = "Permanent", YearsOfExperience = 1, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Alex Thompson", Email = "alex.thompson@company.com", JobTitle = "Project Manager", SeniorityLevel = "Junior", ContractType = "Permanent", YearsOfExperience = 2, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Jordan Smith", Email = "jordan.smith@company.com", JobTitle = "Project Manager", SeniorityLevel = "Junior", ContractType = "Permanent", YearsOfExperience = 1, CreatedAt = now, UpdatedAt = now },
                new() { FullName = "Rachel Brown", Email = "rachel.brown@company.com", JobTitle = "Data Engineer", SeniorityLevel = "Junior", ContractType = "Permanent", YearsOfExperience = 1, CreatedAt = now, UpdatedAt = now }
            };

            // Step: For every employee who is a PM, create a User account and link it
            foreach (var emp in employees.Where(e => e.JobTitle == "Project Manager"))
            {
                var newUser = new User
                {
                    FullName = emp.FullName,
                    Email = emp.Email,
                    Password = hashedPassword,
                    Role = UserRole.PM,
                    ContractType = emp.ContractType == "Permanent" ? ContractType.Permanent : ContractType.Contract,
                    ContractEndDate = emp.ContractEndDate,
                    YearsOfExperience = emp.YearsOfExperience,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                _context.Users.Add(newUser);
                // The link will be established after Users are saved and IDs are generated, or via navigation
                emp.User = newUser;
            }

            await _context.Employees.AddRangeAsync(employees);
            await _context.SaveChangesAsync();
        }

        if (!await _context.Projects.AnyAsync())
        {
            var now = DateTime.UtcNow;
            var gm = await _context.Users.FirstAsync(x => x.Role == UserRole.GM);
            
            // Get PMs and other specialists
            var sarahPm = await _context.Employees.FirstAsync(e => e.FullName == "Sarah Johnson");
            var robertPm = await _context.Employees.FirstAsync(e => e.FullName == "Robert Taylor");
            var emilyDev = await _context.Employees.FirstAsync(e => e.FullName == "Emily Rodriguez");
            var jessicaDev = await _context.Employees.FirstAsync(e => e.FullName == "Jessica Martinez");
            var lisaQa = await _context.Employees.FirstAsync(e => e.FullName == "Lisa Anderson");
            var kevinQa = await _context.Employees.FirstAsync(e => e.FullName == "Kevin Johnson");
            var michaelUi = await _context.Employees.FirstAsync(e => e.FullName == "Michael Chen");

            var unassignedProj = new Project
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
            };

            var scheduledProj = new Project
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
                AssignedPmId = sarahPm.UserId, // Linked to Sarah Johnson
                CreatedAt = now,
                UpdatedAt = now
            };

            var inProgressProj = new Project
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
                AssignedPmId = robertPm.UserId, // Linked to Robert Taylor
                CreatedAt = now,
                UpdatedAt = now
            };

            await _context.Projects.AddRangeAsync(unassignedProj, scheduledProj, inProgressProj);
            await _context.SaveChangesAsync();

            // --- ROLE COMPOSITIONS ---
            var roles = new List<ProjectRoleComposition>
            {
                // Unassigned Proj Roles (Just Requirements)
                new() { ProjectId = unassignedProj.Id, RoleTitle = "Project Manager", SeniorityLevel = SeniorityLevel.Senior, EmploymentStatus = EmploymentStatus.Dedicated, Quantity = 1, CreatedAt = now, UpdatedAt = now },
                new() { ProjectId = unassignedProj.Id, RoleTitle = "Backend Developer", SeniorityLevel = SeniorityLevel.Senior, EmploymentStatus = EmploymentStatus.Dedicated, Quantity = 2, CreatedAt = now, UpdatedAt = now },
                new() { ProjectId = unassignedProj.Id, RoleTitle = "QA Engineer", SeniorityLevel = SeniorityLevel.Junior, EmploymentStatus = EmploymentStatus.Parallel, Quantity = 1, CreatedAt = now, UpdatedAt = now },

                // Scheduled Proj Roles
                new() { ProjectId = scheduledProj.Id, RoleTitle = "Project Manager", SeniorityLevel = SeniorityLevel.Senior, EmploymentStatus = EmploymentStatus.Dedicated, Quantity = 1, CreatedAt = now, UpdatedAt = now },
                new() { ProjectId = scheduledProj.Id, RoleTitle = "Frontend Developer", SeniorityLevel = SeniorityLevel.Senior, EmploymentStatus = EmploymentStatus.Dedicated, Quantity = 1, CreatedAt = now, UpdatedAt = now },
                new() { ProjectId = scheduledProj.Id, RoleTitle = "UI/UX Designer", SeniorityLevel = SeniorityLevel.Senior, EmploymentStatus = EmploymentStatus.Dedicated, Quantity = 1, CreatedAt = now, UpdatedAt = now },
                new() { ProjectId = scheduledProj.Id, RoleTitle = "QA Engineer", SeniorityLevel = SeniorityLevel.Junior, EmploymentStatus = EmploymentStatus.Parallel, Quantity = 1, CreatedAt = now, UpdatedAt = now },

                // InProgress Proj Roles
                new() { ProjectId = inProgressProj.Id, RoleTitle = "Project Manager", SeniorityLevel = SeniorityLevel.Senior, EmploymentStatus = EmploymentStatus.Dedicated, Quantity = 1, CreatedAt = now, UpdatedAt = now },
                new() { ProjectId = inProgressProj.Id, RoleTitle = "Backend Developer", SeniorityLevel = SeniorityLevel.Junior, EmploymentStatus = EmploymentStatus.Dedicated, Quantity = 1, CreatedAt = now, UpdatedAt = now },
                new() { ProjectId = inProgressProj.Id, RoleTitle = "Frontend Developer", SeniorityLevel = SeniorityLevel.Senior, EmploymentStatus = EmploymentStatus.Dedicated, Quantity = 1, CreatedAt = now, UpdatedAt = now },
                new() { ProjectId = inProgressProj.Id, RoleTitle = "QA Engineer", SeniorityLevel = SeniorityLevel.Junior, EmploymentStatus = EmploymentStatus.Parallel, Quantity = 1, CreatedAt = now, UpdatedAt = now }
            };

            await _context.ProjectRoleCompositions.AddRangeAsync(roles);
            await _context.SaveChangesAsync();

            // --- PROJECT MEMBERS (Assignments) ---
            var members = new List<ProjectMember>
            {
                // Scheduled Assignments
                new() { ProjectId = scheduledProj.Id, EmployeeId = sarahPm.Id, RoleCompositionId = roles.First(r => r.ProjectId == scheduledProj.Id && r.RoleTitle == "Project Manager").Id, AssignedBy = gm.Id, AssignedAt = now },
                new() { ProjectId = scheduledProj.Id, EmployeeId = emilyDev.Id, RoleCompositionId = roles.First(r => r.ProjectId == scheduledProj.Id && r.RoleTitle == "Frontend Developer").Id, AssignedBy = gm.Id, AssignedAt = now },
                new() { ProjectId = scheduledProj.Id, EmployeeId = michaelUi.Id, RoleCompositionId = roles.First(r => r.ProjectId == scheduledProj.Id && r.RoleTitle == "UI/UX Designer").Id, AssignedBy = gm.Id, AssignedAt = now },
                new() { ProjectId = scheduledProj.Id, EmployeeId = lisaQa.Id, RoleCompositionId = roles.First(r => r.ProjectId == scheduledProj.Id && r.RoleTitle == "QA Engineer").Id, AssignedBy = gm.Id, AssignedAt = now },

                // InProgress Assignments
                new() { ProjectId = inProgressProj.Id, EmployeeId = robertPm.Id, RoleCompositionId = roles.First(r => r.ProjectId == inProgressProj.Id && r.RoleTitle == "Project Manager").Id, AssignedBy = gm.Id, AssignedAt = now },
                new() { ProjectId = inProgressProj.Id, EmployeeId = jessicaDev.Id, RoleCompositionId = roles.First(r => r.ProjectId == inProgressProj.Id && r.RoleTitle == "Backend Developer").Id, AssignedBy = gm.Id, AssignedAt = now },
                new() { ProjectId = inProgressProj.Id, EmployeeId = emilyDev.Id, RoleCompositionId = roles.First(r => r.ProjectId == inProgressProj.Id && r.RoleTitle == "Frontend Developer").Id, AssignedBy = gm.Id, AssignedAt = now },
                new() { ProjectId = inProgressProj.Id, EmployeeId = lisaQa.Id, RoleCompositionId = roles.First(r => r.ProjectId == inProgressProj.Id && r.RoleTitle == "QA Engineer").Id, AssignedBy = gm.Id, AssignedAt = now }
            };

            await _context.ProjectMembers.AddRangeAsync(members);
            await _context.SaveChangesAsync();
        }
    }
}
