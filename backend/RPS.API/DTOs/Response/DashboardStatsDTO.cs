using System.Text.Json.Serialization;

namespace RPS.API.DTOs.Response;

public class DashboardStatsDTO
{
    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("unassigned")]
    public int Unassigned { get; set; }

    [JsonPropertyName("scheduled")]
    public int Scheduled { get; set; }

    [JsonPropertyName("in_progress")]
    public int InProgress { get; set; }

    [JsonPropertyName("completed")]
    public int Completed { get; set; }
}
