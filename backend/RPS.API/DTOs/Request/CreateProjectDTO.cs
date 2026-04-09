using System.Text.Json.Serialization;

namespace RPS.API.DTOs.Request;

public class CreateProjectDTO
{
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

    [JsonPropertyName("expected_start_date")]
    public DateTime ExpectedStartDate { get; set; }

    [JsonPropertyName("duration_weeks")]
    public int DurationWeeks { get; set; }

    [JsonPropertyName("role_compositions")]
    public List<CreateRoleCompositionDTO> RoleCompositions { get; set; } = new();
}
