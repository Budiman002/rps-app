using Microsoft.EntityFrameworkCore;
using RPS.API.Data;
using RPS.API.DTOs.Response;
using RPS.API.Models;

namespace RPS.API.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext context;

    public DashboardService(AppDbContext context)
    {
        this.context = context;
    }

    public async Task<DashboardStatsDTO> GetStatsAsync(string userRole, Guid userId)
    {
        var query = context.Projects.AsQueryable();

        if (userRole.Equals(UserRole.PM.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x => x.AssignedPmId == userId);
        }

        var total = await query.CountAsync();
        var unassigned = await query.CountAsync(x => x.Status == ProjectStatus.Unassigned);
        var scheduled = await query.CountAsync(x => x.Status == ProjectStatus.Scheduled);
        var inProgress = await query.CountAsync(x => x.Status == ProjectStatus.InProgress);
        var completed = await query.CountAsync(x => x.Status == ProjectStatus.Complete);

        return new DashboardStatsDTO
        {
            Total = total,
            Unassigned = unassigned,
            Scheduled = scheduled,
            InProgress = inProgress,
            Completed = completed
        };
    }
}
