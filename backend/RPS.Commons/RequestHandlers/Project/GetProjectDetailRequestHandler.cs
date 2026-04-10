using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Project;
using RPS.Contracts.ResponseModels.Project;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Project;

public class GetProjectDetailRequestHandler : IRequestHandler<GetProjectDetailRequest, ProjectResponse>
{
    private readonly AppDbContext _context;

    public GetProjectDetailRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ProjectResponse> Handle(GetProjectDetailRequest request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(x => x.RoleCompositions)
            .Include(x => x.Members)
            .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (project is null)
        {
            throw new Exception("Project tidak ditemukan");
        }

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
