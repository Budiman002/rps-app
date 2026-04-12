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
            .Include(x => x.ChangeRequests)
            .Include(x => x.Members)
                .ThenInclude(x => x.Employee)
            .Include(x => x.Members)
                .ThenInclude(x => x.RoleComposition)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Project dengan ID {request.Id} tidak ditemukan.");

        return MapProjectResponse(project);
    }

    private ProjectResponse MapProjectResponse(RPS.Entities.Project project)
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
            AssignedPmId = _context.Employees.FirstOrDefault(e => e.UserId == project.AssignedPmId)?.Id,
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
                Id = m.Employee.Id,
                FullName = m.Employee.FullName,
                Email = m.Employee.Email,
                JobTitle = m.Employee.JobTitle,
                SeniorityLevel = m.Employee.SeniorityLevel,
                YearsOfExperience = m.Employee.YearsOfExperience,
                RoleCompositionId = m.RoleCompositionId,
                RoleTitle = m.RoleComposition?.RoleTitle ?? string.Empty
            }).ToList(),
            RequestChanges = project.ChangeRequests.Select(cr => new ChangeRequestResponse
            {
                Id = cr.Id,
                ChangeTitle = cr.ChangeTitle,
                ChangeDescription = cr.ChangeDescription,
                RequestType = cr.RequestType.ToString(),
                Status = cr.Status.ToString(),
                CreatedAt = cr.CreatedAt,
                NewStartDate = cr.NewStartDate,
                NewEndDate = cr.NewEndDate,
                NewDurationWeeks = cr.NewDurationWeeks,
                RoleChangesJson = cr.RoleChangesJson,
                MemberChangesJson = cr.MemberChangesJson
            }).ToList()
        };
    }
}
