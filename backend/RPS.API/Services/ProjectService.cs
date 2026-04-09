using Microsoft.EntityFrameworkCore;
using RPS.API.Data;
using RPS.API.DTOs.Request;
using RPS.API.DTOs.Response;
using RPS.API.Models;

namespace RPS.API.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext context;

    public ProjectService(AppDbContext context)
    {
        this.context = context;
    }

    public async Task<ProjectResponseDTO> CreateAsync(CreateProjectDTO dto, Guid createdBy)
    {
        _ = await context.Users.FirstOrDefaultAsync(x => x.Id == createdBy)
            ?? throw new Exception("User tidak ditemukan");

        if (!Enum.TryParse<ProjectPriority>(dto.Priority, true, out var priority))
        {
            throw new Exception("Priority tidak valid");
        }

        var now = DateTime.UtcNow;
        var estimatedEndDate = dto.ExpectedStartDate.AddDays(dto.DurationWeeks * 7);

        var project = new Project
        {
            Name = dto.Name?.Trim() ?? string.Empty,
            ClientName = dto.ClientName?.Trim() ?? string.Empty,
            Description = dto.Description?.Trim() ?? string.Empty,
            NotesFromMarketing = dto.NotesFromMarketing?.Trim() ?? string.Empty,
            Priority = priority,
            Status = ProjectStatus.Unassigned,
            ExpectedStartDate = dto.ExpectedStartDate,
            ActualStartDate = null,
            EstimatedEndDate = estimatedEndDate,
            DurationWeeks = dto.DurationWeeks,
            CreatedBy = createdBy,
            AssignedPmId = null,
            CreatedAt = now,
            UpdatedAt = now,
            RoleCompositions = (dto.RoleCompositions ?? new List<CreateRoleCompositionDTO>()).Select(rc =>
            {
                if (!Enum.TryParse<SeniorityLevel>(rc.SeniorityLevel, true, out var seniorityLevel))
                {
                    throw new Exception("Seniority level tidak valid");
                }

                if (!Enum.TryParse<EmploymentStatus>(rc.EmploymentStatus, true, out var employmentStatus))
                {
                    throw new Exception("Employment status tidak valid");
                }

                return new ProjectRoleComposition
                {
                    RoleTitle = rc.RoleTitle?.Trim() ?? string.Empty,
                    SeniorityLevel = seniorityLevel,
                    EmploymentStatus = employmentStatus,
                    Quantity = rc.Quantity,
                    CreatedAt = now,
                    UpdatedAt = now
                };
            }).ToList()
        };

        await context.Projects.AddAsync(project);
        await context.SaveChangesAsync();

        var savedProject = await context.Projects
            .Include(x => x.RoleCompositions)
            .Include(x => x.Members)
                .ThenInclude(x => x.User)
            .FirstAsync(x => x.Id == project.Id);

        return MapProject(savedProject);
    }

    public async Task<List<ProjectResponseDTO>> GetAllAsync(string userRole, Guid userId)
    {
        var query = context.Projects
            .Include(x => x.RoleCompositions)
            .Include(x => x.Members)
                .ThenInclude(x => x.User)
            .AsQueryable();

        if (userRole.Equals(UserRole.PM.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x => x.AssignedPmId == userId);
        }

        var projects = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return projects.Select(MapProject).ToList();
    }

    public async Task<ProjectResponseDTO> GetByIdAsync(Guid id)
    {
        var project = await context.Projects
            .Include(x => x.RoleCompositions)
            .Include(x => x.Members)
                .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new Exception("Project tidak ditemukan");

        return MapProject(project);
    }

    private static ProjectResponseDTO MapProject(Project project)
    {
        return new ProjectResponseDTO
        {
            Id = project.Id,
            Name = project.Name,
            ClientName = project.ClientName,
            Description = project.Description,
            NotesFromMarketing = project.NotesFromMarketing,
            Priority = project.Priority.ToString(),
            Status = project.Status.ToString(),
            ExpectedStartDate = project.ExpectedStartDate,
            EstimatedEndDate = project.EstimatedEndDate,
            ActualStartDate = project.ActualStartDate,
            DurationWeeks = project.DurationWeeks,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            RoleCompositions = project.RoleCompositions.Select(rc => new RoleCompositionResponseDTO
            {
                Id = rc.Id,
                RoleTitle = rc.RoleTitle,
                SeniorityLevel = rc.SeniorityLevel.ToString(),
                EmploymentStatus = rc.EmploymentStatus.ToString(),
                Quantity = rc.Quantity
            }).ToList(),
            Members = project.Members.Select(member => new MemberResponseDTO
            {
                Id = member.User.Id,
                FullName = member.User.FullName,
                Email = member.User.Email,
                Role = member.User.Role.ToString(),
                YearsOfExperience = member.User.YearsOfExperience
            }).ToList()
        };
    }
}
