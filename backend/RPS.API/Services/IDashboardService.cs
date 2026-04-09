using RPS.API.DTOs.Response;

namespace RPS.API.Services;

public interface IDashboardService
{
    Task<DashboardStatsDTO> GetStatsAsync(string userRole, Guid userId);
}
