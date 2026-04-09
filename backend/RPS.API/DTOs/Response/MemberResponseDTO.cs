using System.Text.Json.Serialization;

namespace RPS.API.DTOs.Response;

public class MemberResponseDTO
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;

    [JsonPropertyName("years_of_experience")]
    public int YearsOfExperience { get; set; }
}
