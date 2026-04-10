using MediatR;
using RPS.Contracts.ResponseModels.Project;

namespace RPS.Contracts.RequestModels.Project;

public class CreateProjectRequest : IRequest<ProjectResponse>
{
    public string Name { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string NotesFromMarketing { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime ExpectedStartDate { get; set; }
    public int DurationWeeks { get; set; }
    public Guid CreatedBy { get; set; }
    public List<CreateRoleCompositionRequest> RoleCompositions { get; set; } = [];
}
