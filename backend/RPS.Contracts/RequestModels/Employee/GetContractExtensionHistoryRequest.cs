using MediatR;
using RPS.Contracts.ResponseModels.Employee;

namespace RPS.Contracts.RequestModels.Employee;

public class GetContractExtensionHistoryRequest : IRequest<List<ContractExtensionRequestResponse>>
{
    public Guid EmployeeId { get; set; }
}