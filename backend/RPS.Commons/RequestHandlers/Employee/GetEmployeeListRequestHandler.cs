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
        var unavailableEmployeeIds = await _context.ProjectMembers
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
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return employees;
    }
}
