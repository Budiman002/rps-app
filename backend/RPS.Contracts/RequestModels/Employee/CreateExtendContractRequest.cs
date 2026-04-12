using MediatR;
using RPS.Contracts.ResponseModels.Employee;

namespace RPS.Contracts.RequestModels.Employee;

public class CreateExtendContractRequest : IRequest<CreateExtendContractResponse>
{
    public Guid EmployeeId { get; set; }
    public DateTime RequestedEndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Guid RequestedBy { get; set; }
}
