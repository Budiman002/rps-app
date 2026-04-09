using System.Text.Json.Serialization;

namespace RPS.API.DTOs.Response;

public class RoleCompositionResponseDTO
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("role_title")]
    public string RoleTitle { get; set; } = string.Empty;

    [JsonPropertyName("seniority_level")]
    public string SeniorityLevel { get; set; } = string.Empty;

    [JsonPropertyName("employment_status")]
    public string EmploymentStatus { get; set; } = string.Empty;

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; }
}
