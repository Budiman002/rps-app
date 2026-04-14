using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Dashboard;
using RPS.Contracts.ResponseModels.Dashboard;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Dashboard;

public class GetDashboardStatsRequestHandler : IRequestHandler<GetDashboardStatsRequest, DashboardStatsResponse>
{
    private readonly AppDbContext _context;

    public GetDashboardStatsRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsResponse> Handle(GetDashboardStatsRequest request, CancellationToken cancellationToken)
    {
        var query = _context.Projects.AsQueryable();

        if (request.UserRole.Equals(UserRole.PM.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x => x.AssignedPmId == request.UserId);
        }

        var grouped = await query
            .GroupBy(x => x.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        return new DashboardStatsResponse
        {
            Total = grouped.Sum(g => g.Count),
            Unassigned = grouped.FirstOrDefault(g => g.Status == ProjectStatus.Unassigned)?.Count ?? 0,
            Scheduled = grouped.FirstOrDefault(g => g.Status == ProjectStatus.Scheduled)?.Count ?? 0,
            InProgress = grouped.FirstOrDefault(g => g.Status == ProjectStatus.InProgress)?.Count ?? 0,
            Completed = grouped.FirstOrDefault(g => g.Status == ProjectStatus.Complete)?.Count ?? 0
        };
    }
}
