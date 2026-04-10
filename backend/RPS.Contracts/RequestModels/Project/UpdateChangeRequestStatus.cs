using MediatR;

namespace RPS.Contracts.RequestModels.Project;

public class UpdateChangeRequestStatus : IRequest<bool>
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
}
