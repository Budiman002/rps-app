using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Project;
using RPS.Contracts.ResponseModels.Project;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Project;

public class CreateProjectRequestHandler : IRequestHandler<CreateProjectRequest, ProjectResponse>
{
    private readonly AppDbContext _context;

    public CreateProjectRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ProjectResponse> Handle(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<ProjectPriority>(request.Priority, true, out var priority))
        {
            throw new Exception("Priority tidak valid");
        }

        var estimatedEndDate = request.ExpectedStartDate.AddDays(request.DurationWeeks * 7);
        var now = DateTime.UtcNow;

        var project = new RPS.Entities.Project
        {
            Name = request.Name,
            ClientName = request.ClientName,
            Description = request.Description,
            NotesFromMarketing = request.NotesFromMarketing,
            Priority = priority,
            Status = ProjectStatus.Unassigned,
            ExpectedStartDate = request.ExpectedStartDate,
            EstimatedEndDate = estimatedEndDate,
            DurationWeeks = request.DurationWeeks,
            CreatedBy = request.CreatedBy,
            CreatedAt = now,
            UpdatedAt = now,
            RoleCompositions = request.RoleCompositions.Select(rc => new ProjectRoleComposition
            {
                RoleTitle = rc.RoleTitle,
                SeniorityLevel = ParseEnum<SeniorityLevel>(rc.SeniorityLevel, "SeniorityLevel"),
                EmploymentStatus = ParseEnum<EmploymentStatus>(rc.EmploymentStatus, "EmploymentStatus"),
                Quantity = rc.Quantity,
                CreatedAt = now,
                UpdatedAt = now
            }).ToList()
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync(cancellationToken);

        var savedProject = await _context.Projects
            .Include(x => x.RoleCompositions)
            .FirstAsync(x => x.Id == project.Id, cancellationToken);

        // Ini seharusnya bisa langsung pakai "project" aja?
        return MapProjectResponse(savedProject);
    }

    private static TEnum ParseEnum<TEnum>(string value, string fieldName) where TEnum : struct
    {
        if (Enum.TryParse<TEnum>(value, true, out var parsedValue))
        {
            return parsedValue;
        }

        throw new Exception($"{fieldName} tidak valid");
    }

    private static ProjectResponse MapProjectResponse(RPS.Entities.Project project)
    {
        return new ProjectResponse
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
            RoleCompositions = project.RoleCompositions.Select(rc => new RoleCompositionResponse
            {
                Id = rc.Id,
                RoleTitle = rc.RoleTitle,
                SeniorityLevel = rc.SeniorityLevel.ToString(),
                EmploymentStatus = rc.EmploymentStatus.ToString(),
                Quantity = rc.Quantity
            }).ToList(),
            Members = []
        };
    }
}
