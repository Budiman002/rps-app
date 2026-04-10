using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Project;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Project;

public class UpdateProjectRequestHandler : IRequestHandler<UpdateProjectRequest, Unit>
{
    private readonly AppDbContext _context;

    public UpdateProjectRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateProjectRequest request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.RoleCompositions)
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken)
            ?? throw new KeyNotFoundException($"Project dengan ID {request.ProjectId} tidak ditemukan.");

        // ---- 1. TIMELINE ------------------------------------------------

        // Strictly block start date changes when project is In Progress
        if (request.NewStartDate.HasValue && project.Status == ProjectStatus.InProgress)
        {
            throw new ValidationException(
            [
                new FluentValidation.Results.ValidationFailure(
                    nameof(request.NewStartDate),
                    "Start date tidak bisa diubah ketika project sedang In Progress.")
            ]);
        }

        if (request.NewStartDate.HasValue)
            project.ExpectedStartDate = request.NewStartDate.Value;

        // Auto-calculate: if both provided, end date takes priority
        if (request.NewEndDate.HasValue && request.NewDurationWeeks.HasValue)
        {
            project.EstimatedEndDate = request.NewEndDate.Value;
            project.DurationWeeks = (int)Math.Round(
                (project.EstimatedEndDate - project.ExpectedStartDate).TotalDays / 7.0);
        }
        else if (request.NewEndDate.HasValue)
        {
            project.EstimatedEndDate = request.NewEndDate.Value;
            project.DurationWeeks = (int)Math.Round(
                (project.EstimatedEndDate - project.ExpectedStartDate).TotalDays / 7.0);
        }
        else if (request.NewDurationWeeks.HasValue)
        {
            project.DurationWeeks = request.NewDurationWeeks.Value;
            project.EstimatedEndDate = project.ExpectedStartDate.AddDays(project.DurationWeeks * 7);
        }
        else if (request.NewStartDate.HasValue)
        {
            // Start date shifted only — keep duration, recalculate end date
            project.EstimatedEndDate = project.ExpectedStartDate.AddDays(project.DurationWeeks * 7);
        }

        project.UpdatedAt = DateTime.UtcNow;

        // ---- 2. ROLES SYNC ----------------------------------------------

        var existingRoles = project.RoleCompositions.ToList();
        var incomingRoleIds = request.Roles
            .Where(r => r.Id.HasValue && r.Id != Guid.Empty)
            .Select(r => r.Id!.Value)
            .ToHashSet();

        // Remove rows in DB not present in the incoming list
        var rolesToRemove = existingRoles
            .Where(r => !incomingRoleIds.Contains(r.Id))
            .ToList();
        _context.ProjectRoleCompositions.RemoveRange(rolesToRemove);

        foreach (var incoming in request.Roles)
        {
            if (incoming.Id.HasValue && incoming.Id != Guid.Empty)
            {
                var existing = existingRoles.FirstOrDefault(r => r.Id == incoming.Id.Value);
                if (existing != null)
                {
                    existing.RoleTitle = incoming.RoleTitle;
                    existing.SeniorityLevel = Enum.Parse<SeniorityLevel>(incoming.SeniorityLevel);
                    existing.EmploymentStatus = Enum.Parse<EmploymentStatus>(incoming.EmploymentStatus);
                    existing.Quantity = incoming.Quantity;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
            }
            else
            {
                _context.ProjectRoleCompositions.Add(new ProjectRoleComposition
                {
                    ProjectId = project.Id,
                    RoleTitle = incoming.RoleTitle,
                    SeniorityLevel = Enum.Parse<SeniorityLevel>(incoming.SeniorityLevel),
                    EmploymentStatus = Enum.Parse<EmploymentStatus>(incoming.EmploymentStatus),
                    Quantity = incoming.Quantity,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        // ---- 3. MEMBERS SYNC --------------------------------------------

        var existingMembers = project.Members.ToList();
        var incomingMemberKeys = request.Members
            .Select(m => (m.UserId, m.RoleCompositionId))
            .ToHashSet();

        var membersToRemove = existingMembers
            .Where(m => !incomingMemberKeys.Contains((m.UserId, m.RoleCompositionId)))
            .ToList();
        _context.ProjectMembers.RemoveRange(membersToRemove);

        var existingMemberKeys = existingMembers
            .Select(m => (m.UserId, m.RoleCompositionId))
            .ToHashSet();

        foreach (var incoming in request.Members.Where(
            m => !existingMemberKeys.Contains((m.UserId, m.RoleCompositionId))))
        {
            _context.ProjectMembers.Add(new ProjectMember
            {
                ProjectId = project.Id,
                UserId = incoming.UserId,
                RoleCompositionId = incoming.RoleCompositionId,
                AssignedBy = request.UpdatedBy,
                AssignedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
