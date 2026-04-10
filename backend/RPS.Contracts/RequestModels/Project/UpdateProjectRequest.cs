using System.Text.Json.Serialization;
using MediatR;

namespace RPS.Contracts.RequestModels.Project;

public class UpdateProjectRequest : IRequest<Unit>
{
    [JsonIgnore]
    public Guid ProjectId { get; set; }

    [JsonIgnore]
    public Guid UpdatedBy { get; set; }

    public DateTime? NewStartDate { get; set; }
    public DateTime? NewEndDate { get; set; }
    public int? NewDurationWeeks { get; set; }

    public List<RoleCompositionItem> Roles { get; set; } = new();

    public List<ProjectMemberItem> Members { get; set; } = new();
}