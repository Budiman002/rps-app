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
        if (request.UpdatedBy == Guid.Empty)
        {
            throw new ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(nameof(request.UpdatedBy), "User ID dari token tidak valid atau tidak ditemukan.")
            });
        }

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

        if (!string.IsNullOrEmpty(request.NewStatus))
            project.Status = Enum.Parse<ProjectStatus>(request.NewStatus, true);

        project.UpdatedAt = DateTime.UtcNow;

        // ---- 2. ROLES SYNC ----------------------------------------------
        Console.WriteLine($"Syncing Roles: {request.Roles.Count} incoming");

        var existingRoles = project.RoleCompositions.ToList();
        var incomingRoleIds = request.Roles
            .Where(r => r.Id.HasValue && r.Id != Guid.Empty)
            .Select(r => r.Id!.Value)
            .ToHashSet();

        // Remove rows in DB not present in the incoming list
        var rolesToRemove = existingRoles
            .Where(r => !incomingRoleIds.Contains(r.Id))
            .ToList();
        
        if (rolesToRemove.Any())
        {
            Console.WriteLine($"Removing {rolesToRemove.Count} roles");
            _context.ProjectRoleCompositions.RemoveRange(rolesToRemove);
        }

        foreach (var incoming in request.Roles)
        {
            var existing = (incoming.Id.HasValue && incoming.Id != Guid.Empty)
                ? existingRoles.FirstOrDefault(r => r.Id == incoming.Id.Value)
                : null;

            if (existing != null)
            {
                existing.RoleTitle = incoming.RoleTitle;
                existing.SeniorityLevel = Enum.Parse<SeniorityLevel>(incoming.SeniorityLevel, true);
                existing.EmploymentStatus = Enum.Parse<EmploymentStatus>(incoming.EmploymentStatus, true);
                existing.Quantity = incoming.Quantity;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newRole = new ProjectRoleComposition
                {
                    ProjectId = project.Id,
                    RoleTitle = incoming.RoleTitle,
                    SeniorityLevel = Enum.Parse<SeniorityLevel>(incoming.SeniorityLevel, true),
                    EmploymentStatus = Enum.Parse<EmploymentStatus>(incoming.EmploymentStatus, true),
                    Quantity = incoming.Quantity,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Use provided ID if available (for member linking in the same request)
                if (incoming.Id.HasValue && incoming.Id != Guid.Empty)
                {
                    newRole.Id = incoming.Id.Value;
                }

                _context.ProjectRoleCompositions.Add(newRole);
            }
        }

        // ---- 3. MEMBERS SYNC --------------------------------------------
        Console.WriteLine($"Syncing Members: {request.Members.Count} incoming");

        var existingMembers = project.Members.ToList();
        var incomingMemberKeys = request.Members
            .Where(m => m.RoleCompositionId != Guid.Empty && m.EmployeeId != Guid.Empty)
            .Select(m => (m.EmployeeId, m.RoleCompositionId))
            .ToHashSet();

        var membersToRemove = existingMembers
            .Where(m => !incomingMemberKeys.Contains((m.EmployeeId, m.RoleCompositionId)))
            .ToList();

        if (membersToRemove.Any())
        {
            Console.WriteLine($"Removing {membersToRemove.Count} members");
            _context.ProjectMembers.RemoveRange(membersToRemove);
        }

        var existingMemberKeys = existingMembers
            .Select(m => (m.EmployeeId, m.RoleCompositionId))
            .ToHashSet();

        foreach (var incoming in request.Members.Where(
            m => !existingMemberKeys.Contains((m.EmployeeId, m.RoleCompositionId))))
        {
            _context.ProjectMembers.Add(new ProjectMember
            {
                ProjectId = project.Id,
                EmployeeId = incoming.EmployeeId,
                RoleCompositionId = incoming.RoleCompositionId,
                AssignedBy = request.UpdatedBy,
                AssignedAt = DateTime.UtcNow
            });
        }

        // ---- 4. NOTIFICATIONS -------------------------------------------
        if (project.AssignedPmId.HasValue && project.AssignedPmId != request.UpdatedBy)
        {
            var updaterName = await _context.Users
                .Where(u => u.Id == request.UpdatedBy)
                .Select(u => u.FullName)
                .FirstOrDefaultAsync(cancellationToken) ?? "General Manager";

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                RecipientId = project.AssignedPmId.Value,
                Type = "ProjectUpdate",
                Title = $"Project Updated: {project.Name}",
                Message = $"{updaterName} has updated the details for project {project.Name}.",
                ReferenceId = project.Id,
                ReferenceType = "Project",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
        }

        await _context.SaveChangesAsync(cancellationToken);
        Console.WriteLine("Update saved successfully");
        return Unit.Value;
    }
}
