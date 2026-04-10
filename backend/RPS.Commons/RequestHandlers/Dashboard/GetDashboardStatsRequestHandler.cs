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

        return new DashboardStatsResponse
        {
            Total = await query.CountAsync(cancellationToken),
            Unassigned = await query.CountAsync(x => x.Status == ProjectStatus.Unassigned, cancellationToken),
            Scheduled = await query.CountAsync(x => x.Status == ProjectStatus.Scheduled, cancellationToken),
            InProgress = await query.CountAsync(x => x.Status == ProjectStatus.InProgress, cancellationToken),
            Completed = await query.CountAsync(x => x.Status == ProjectStatus.Complete, cancellationToken)
        };
    }
}
