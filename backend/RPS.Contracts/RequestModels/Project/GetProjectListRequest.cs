using MediatR;
using RPS.Contracts.ResponseModels.Project;

namespace RPS.Contracts.RequestModels.Project;

public class GetProjectListRequest : IRequest<List<ProjectResponse>>
{
    public string UserRole { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}
