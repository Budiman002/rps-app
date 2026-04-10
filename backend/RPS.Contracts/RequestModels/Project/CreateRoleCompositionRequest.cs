namespace RPS.Contracts.RequestModels.Project;

public class CreateRoleCompositionRequest
{
    public string RoleTitle { get; set; } = string.Empty;
    public string SeniorityLevel { get; set; } = string.Empty;
    public string EmploymentStatus { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
