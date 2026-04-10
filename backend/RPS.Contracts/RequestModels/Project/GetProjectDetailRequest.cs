using MediatR;
using RPS.Contracts.ResponseModels.Project;

namespace RPS.Contracts.RequestModels.Project;

public class GetProjectDetailRequest : IRequest<ProjectResponse>
{
    public Guid Id { get; set; }
}
