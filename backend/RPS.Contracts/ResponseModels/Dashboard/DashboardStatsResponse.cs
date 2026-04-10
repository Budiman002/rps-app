namespace RPS.Contracts.ResponseModels.Dashboard;

public class DashboardStatsResponse
{
    public int Total { get; set; }
    public int Unassigned { get; set; }
    public int Scheduled { get; set; }
    public int InProgress { get; set; }
    public int Completed { get; set; }
}
