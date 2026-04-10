namespace RPS.Contracts.ResponseModels.Project;

public class RoleCompositionResponse
{
    public Guid Id { get; set; }
    public string RoleTitle { get; set; } = string.Empty;
    public string SeniorityLevel { get; set; } = string.Empty;
    public string EmploymentStatus { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
