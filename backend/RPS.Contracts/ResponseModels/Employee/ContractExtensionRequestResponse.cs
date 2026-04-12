namespace RPS.Contracts.ResponseModels.Employee;

public class ContractExtensionRequestResponse
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid RequestedBy { get; set; }
    public DateTime RequestedDate { get; set; }
    public DateTime ProposedEndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
