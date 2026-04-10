namespace RPS.Contracts.ResponseModels.Project;

public class MemberResponse
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string SeniorityLevel { get; set; } = string.Empty;
    public int YearsOfExperience { get; set; }
}
