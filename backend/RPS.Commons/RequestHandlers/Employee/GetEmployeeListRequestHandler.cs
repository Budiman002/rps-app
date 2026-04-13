using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Employee;
using RPS.Contracts.ResponseModels.Employee;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Employee;

public class GetEmployeeListRequestHandler : IRequestHandler<GetEmployeeListRequest, List<EmployeeResponse>>
{
    private readonly AppDbContext _context;

    public GetEmployeeListRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<EmployeeResponse>> Handle(GetEmployeeListRequest request, CancellationToken cancellationToken)
    {
        // Auto-reject pending requests that have expired (older than 2 days)
        var twoDAysAgo = DateTime.UtcNow.AddDays(-2);
        var expiredRequests = await _context.ContractExtendRequests
            .Where(er => er.Status == RequestStatus.Pending && er.CreatedAt <= twoDAysAgo)
            .ToListAsync(cancellationToken);

        if (expiredRequests.Any())
        {
            foreach (var expired in expiredRequests)
            {
                expired.Status = RequestStatus.Rejected;
                expired.UpdatedAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync(cancellationToken);
        }

        var unavailableEmployeeIds = await _context.ProjectMembers
            .Include(pm => pm.RoleComposition)
            .Include(pm => pm.Project)
            .Where(pm => pm.RoleComposition.EmploymentStatus == EmploymentStatus.Dedicated &&
                        (pm.Project.Status == ProjectStatus.Scheduled || pm.Project.Status == ProjectStatus.InProgress))
            .Select(pm => pm.EmployeeId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var employees = await _context.Employees
            .OrderBy(x => x.FullName)
            .Select(x => new EmployeeResponse
            {
                Id = x.Id,
                FullName = x.FullName,
                Email = x.Email,
                JobTitle = x.JobTitle,
                SeniorityLevel = x.SeniorityLevel,
                ContractType = x.ContractType,
                ContractEndDate = x.ContractEndDate,
                YearsOfExperience = x.YearsOfExperience,
                IsUnavailable = unavailableEmployeeIds.Contains(x.Id),
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
                CurrentProjects = _context.ProjectMembers
                    .Include(pm => pm.Project)
                    .Where(pm => pm.EmployeeId == x.Id &&
                                (pm.Project.Status == ProjectStatus.Scheduled || pm.Project.Status == ProjectStatus.InProgress))
                    .Select(pm => pm.Project.Name)
                    .ToList(),
                ExtensionRequest = _context.ContractExtendRequests
                    .Where(er => er.EmployeeId == x.Id && er.Status == RequestStatus.Pending)
                    .OrderByDescending(er => er.CreatedAt)
                    .Select(er => new ContractExtensionRequestResponse
                    {
                        Id = er.Id,
                        EmployeeId = er.EmployeeId,
                        RequestedBy = er.RequestedBy,
                        RequestedDate = er.CreatedAt,
                        ProposedEndDate = er.RequestedEndDate,
                        Reason = er.Reason,
                        Status = er.Status.ToString().ToLowerInvariant(),
                        ExpiresAt = er.CreatedAt.AddDays(2)  // 2-day grace period for HR decision
                    })
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return employees;
    }
}
