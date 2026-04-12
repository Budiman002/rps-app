namespace RPS.Contracts.ResponseModels.Employee;

public class EmployeeResponse
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string SeniorityLevel { get; set; } = string.Empty;
    public string ContractType { get; set; } = string.Empty;
    public DateTime? ContractEndDate { get; set; }
    public int YearsOfExperience { get; set; }
    public bool IsUnavailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ContractExtensionRequestResponse? ExtensionRequest { get; set; }
}
