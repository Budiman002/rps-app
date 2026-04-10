using MediatR;
using RPS.Contracts.ResponseModels.Dashboard;

namespace RPS.Contracts.RequestModels.Dashboard;

public class GetDashboardStatsRequest : IRequest<DashboardStatsResponse>
{
    public string UserRole { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}
