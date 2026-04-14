using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Project;
using RPS.Entities;
using System.Text.Json;

namespace RPS.Commons.RequestHandlers.Project;

public class UpdateChangeRequestStatusHandler : IRequestHandler<UpdateChangeRequestStatus, bool>
{
    private readonly AppDbContext _context;

    public UpdateChangeRequestStatusHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateChangeRequestStatus request, CancellationToken cancellationToken)
    {
        var changeRequest = await _context.ChangeRequests
            .Include(c => c.Project)
            .ThenInclude(p => p.RoleCompositions)
            .Include(c => c.Project.Members)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (changeRequest == null) return false;

        var statusEnum = Enum.Parse<RequestStatus>(request.Status, true);
        changeRequest.Status = statusEnum;
        changeRequest.UpdatedAt = DateTime.UtcNow;

        if (statusEnum == RequestStatus.Approved)
        {
            // Timeline Changes
            if (changeRequest.NewStartDate.HasValue)
            {
                changeRequest.Project.ExpectedStartDate = changeRequest.NewStartDate.Value;
                if (changeRequest.Project.ActualStartDate.HasValue)
                    changeRequest.Project.ActualStartDate = changeRequest.NewStartDate.Value;
            }
            if (changeRequest.NewEndDate.HasValue)
                changeRequest.Project.EstimatedEndDate = changeRequest.NewEndDate.Value;
            if (changeRequest.NewDurationWeeks.HasValue)
                changeRequest.Project.DurationWeeks = changeRequest.NewDurationWeeks.Value;

            JsonSerializerOptions jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            // Roles Changes
            if (!string.IsNullOrEmpty(changeRequest.RoleChangesJson))
            {
                var roleChanges = JsonSerializer.Deserialize<RoleChangesDto>(changeRequest.RoleChangesJson, jsonOptions);
                if (roleChanges != null)
                {
                    var rolesToRemove = new List<ProjectRoleComposition>();
                    var roleIdsToRemove = new HashSet<Guid>();
                    var rolesToAdd = new List<ProjectRoleComposition>();

                    if (roleChanges.Removed != null)
                    {
                        foreach (var r in roleChanges.Removed)
                        {
                            var allocationType = Enum.TryParse<EmploymentStatus>(r.AllocationType, true, out var at) ? at : EmploymentStatus.Dedicated;

                            var existing = changeRequest.Project.RoleCompositions.FirstOrDefault(rc =>
                                rc.RoleTitle == r.Role &&
                                rc.SeniorityLevel.ToString().Equals(r.Seniority, StringComparison.OrdinalIgnoreCase) &&
                                rc.EmploymentStatus == allocationType);

                            if (existing != null)
                            {
                                existing.Quantity -= r.Count;
                                if (existing.Quantity <= 0)
                                {
                                    if (roleIdsToRemove.Add(existing.Id))
                                    {
                                        rolesToRemove.Add(existing);
                                    }
                                }
                            }
                        }

                        if (rolesToRemove.Count > 0)
                        {
                            _context.ProjectRoleCompositions.RemoveRange(rolesToRemove);
                        }
                    }

                    if (roleChanges.Added != null)
                    {
                        foreach (var a in roleChanges.Added)
                        {
                            var seniority = Enum.Parse<SeniorityLevel>(a.Seniority, true);
                            var allocationType = Enum.TryParse<EmploymentStatus>(a.AllocationType, true, out var at) ? at : EmploymentStatus.Dedicated;

                            var existing = changeRequest.Project.RoleCompositions.FirstOrDefault(rc =>
                                rc.RoleTitle == a.Role &&
                                rc.SeniorityLevel == seniority &&
                                rc.EmploymentStatus == allocationType);

                            if (existing != null)
                            {
                                existing.Quantity += a.Count;
                            }
                            else
                            {
                                var newRc = new ProjectRoleComposition
                                {
                                    Id = Guid.NewGuid(),
                                    ProjectId = changeRequest.Project.Id,
                                    RoleTitle = a.Role,
                                    SeniorityLevel = seniority,
                                    EmploymentStatus = allocationType,
                                    Quantity = a.Count,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                };
                                rolesToAdd.Add(newRc);
                                changeRequest.Project.RoleCompositions.Add(newRc);
                            }
                        }

                        if (rolesToAdd.Count > 0)
                        {
                            _context.ProjectRoleCompositions.AddRange(rolesToAdd);
                        }
                    }
                }
            }

            // Member Changes
            if (!string.IsNullOrEmpty(changeRequest.MemberChangesJson))
            {
                var memberChanges = JsonSerializer.Deserialize<MemberChangesDto>(changeRequest.MemberChangesJson, jsonOptions);
                if (memberChanges != null)
                {
                    var membersToRemove = new List<ProjectMember>();
                    var memberIdsToRemove = new HashSet<Guid>();
                    var membersToAdd = new List<ProjectMember>();
                    var roleCompositionsToAdd = new List<ProjectRoleComposition>();

                    if (memberChanges.Removed != null)
                    {
                        foreach (var m in memberChanges.Removed)
                        {
                            var existing = changeRequest.Project.Members.FirstOrDefault(pm => pm.EmployeeId == m.EmployeeId);
                            if (existing != null)
                            {
                                if (memberIdsToRemove.Add(existing.Id))
                                {
                                    membersToRemove.Add(existing);
                                }
                            }
                        }

                        if (membersToRemove.Count > 0)
                        {
                            _context.ProjectMembers.RemoveRange(membersToRemove);
                        }
                    }

                    if (memberChanges.Added != null)
                    {
                        foreach (var a in memberChanges.Added)
                        {
                            var seniority = Enum.Parse<SeniorityLevel>(a.Seniority, true);
                            var allocationType = Enum.TryParse<EmploymentStatus>(a.AllocationType, true, out var at) ? at : EmploymentStatus.Dedicated;

                            // We must find the role composition in the DB/local context
                            var roleComp = changeRequest.Project.RoleCompositions.FirstOrDefault(rc =>
                                rc.RoleTitle == a.Role &&
                                rc.SeniorityLevel == seniority &&
                                rc.EmploymentStatus == allocationType);

                            if (roleComp == null)
                            {
                                // Automatically generate missing role to fulfill FK constraint!
                                roleComp = new ProjectRoleComposition
                                {
                                    Id = Guid.NewGuid(),
                                    ProjectId = changeRequest.Project.Id,
                                    RoleTitle = a.Role,
                                    SeniorityLevel = seniority,
                                    EmploymentStatus = allocationType,
                                    Quantity = 1,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                };
                                roleCompositionsToAdd.Add(roleComp);
                                changeRequest.Project.RoleCompositions.Add(roleComp);
                            }

                            if (!changeRequest.Project.Members.Any(pm => pm.EmployeeId == a.EmployeeId))
                            {
                                var newPm = new ProjectMember
                                {
                                    Id = Guid.NewGuid(),
                                    ProjectId = changeRequest.Project.Id,
                                    EmployeeId = a.EmployeeId,
                                    RoleCompositionId = roleComp.Id,
                                    RoleComposition = roleComp,
                                    // A quick fallback to AssignBy
                                    AssignedBy = changeRequest.RequestedBy,
                                    AssignedAt = DateTime.UtcNow
                                };
                                membersToAdd.Add(newPm);
                                changeRequest.Project.Members.Add(newPm);
                            }
                        }

                        if (roleCompositionsToAdd.Count > 0)
                        {
                            _context.ProjectRoleCompositions.AddRange(roleCompositionsToAdd);
                        }

                        if (membersToAdd.Count > 0)
                        {
                            _context.ProjectMembers.AddRange(membersToAdd);
                        }
                    }
                }
            }

            changeRequest.Project.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private class RoleChangesDto
    {
        public List<RoleDto>? Added { get; set; }
        public List<RoleDto>? Removed { get; set; }
    }

    private class RoleDto
    {
        public string Role { get; set; } = string.Empty;
        public string Seniority { get; set; } = string.Empty;
        public string AllocationType { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    private class MemberChangesDto
    {
        public List<MemberDto>? Added { get; set; }
        public List<MemberDto>? Removed { get; set; }
    }

    private class MemberDto
    {
        public Guid EmployeeId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Seniority { get; set; } = string.Empty;
        public string AllocationType { get; set; } = string.Empty;
    }
}
