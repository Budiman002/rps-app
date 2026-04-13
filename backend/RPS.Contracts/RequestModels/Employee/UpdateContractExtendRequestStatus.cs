using MediatR;

namespace RPS.Contracts.RequestModels.Employee;

public class UpdateContractExtendRequestStatus : IRequest<bool>
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
}