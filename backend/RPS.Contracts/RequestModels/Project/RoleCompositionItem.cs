namespace RPS.Contracts.RequestModels.Project;

public class RoleCompositionItem
{
    public Guid? Id { get; set; }
    public string RoleTitle { get; set; } = string.Empty;
    public string SeniorityLevel { get; set; } = string.Empty;
    public string EmploymentStatus { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
