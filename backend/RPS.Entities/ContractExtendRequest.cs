namespace RPS.Entities;

public class ContractExtendRequest
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid RequestedBy { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime RequestedEndDate { get; set; }
    public RequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User Employee { get; set; } = null!;
    public User RequestedByUser { get; set; } = null!;
}
