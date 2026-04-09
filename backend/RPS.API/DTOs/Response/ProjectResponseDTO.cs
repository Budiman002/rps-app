using System.Text.Json.Serialization;

namespace RPS.API.DTOs.Response;

public class ProjectResponseDTO
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("client_name")]
    public string ClientName { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("notes_from_marketing")]
    public string NotesFromMarketing { get; set; } = string.Empty;

    [JsonPropertyName("priority")]
    public string Priority { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("expected_start_date")]
    public DateTime ExpectedStartDate { get; set; }

    [JsonPropertyName("estimated_end_date")]
    public DateTime EstimatedEndDate { get; set; }

    [JsonPropertyName("actual_start_date")]
    public DateTime? ActualStartDate { get; set; }

    [JsonPropertyName("duration_weeks")]
    public int DurationWeeks { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [JsonPropertyName("role_compositions")]
    public List<RoleCompositionResponseDTO> RoleCompositions { get; set; } = new();

    [JsonPropertyName("members")]
    public List<MemberResponseDTO> Members { get; set; } = new();
}
