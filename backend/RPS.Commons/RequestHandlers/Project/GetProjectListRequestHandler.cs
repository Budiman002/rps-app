using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Project;
using RPS.Contracts.ResponseModels.Project;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Project;

public class GetProjectListRequestHandler : IRequestHandler<GetProjectListRequest, List<ProjectResponse>>
{
    private readonly AppDbContext _context;

    public GetProjectListRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectResponse>> Handle(GetProjectListRequest request, CancellationToken cancellationToken)
    {
        var query = _context.Projects
            .Include(x => x.RoleCompositions)
            .Include(x => x.Members)
            .ThenInclude(x => x.User)
            .AsQueryable();

        if (request.UserRole.Equals(UserRole.PM.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x => x.AssignedPmId == request.UserId);
        }

        var projects = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return projects.Select(MapProjectResponse).ToList();
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
            Members = project.Members.Select(m => new MemberResponse
            {
                Id = m.User.Id,
                FullName = m.User.FullName,
                Email = m.User.Email,
                Role = m.User.Role.ToString(),
                YearsOfExperience = m.User.YearsOfExperience
            }).ToList()
        };
    }
}
