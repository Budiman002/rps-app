namespace RPS.Contracts.ResponseModels.Project;

public class ProjectResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string NotesFromMarketing { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime ExpectedStartDate { get; set; }
    public DateTime EstimatedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public int DurationWeeks { get; set; }
    public Guid? AssignedPmId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<RoleCompositionResponse> RoleCompositions { get; set; } = [];
    public List<MemberResponse> Members { get; set; } = [];
    public List<ChangeRequestResponse> RequestChanges { get; set; } = [];
}
