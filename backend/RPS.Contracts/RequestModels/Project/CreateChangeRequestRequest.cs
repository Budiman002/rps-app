using MediatR;


namespace RPS.Contracts.RequestModels.Project;

public class CreateChangeRequestRequest : IRequest<Guid>
{
    public Guid ProjectId { get; set; }
    public string ChangeTitle { get; set; } = string.Empty;
    public string ChangeDescription { get; set; } = string.Empty;
    public string RequestType { get; set; } = "Timeline";
    public DateTime? NewStartDate { get; set; }
    public DateTime? NewEndDate { get; set; }
    public int? NewDurationWeeks { get; set; }
    public string? RoleChangesJson { get; set; }
    public string? MemberChangesJson { get; set; }
    public Guid RequestedBy { get; set; }
}
