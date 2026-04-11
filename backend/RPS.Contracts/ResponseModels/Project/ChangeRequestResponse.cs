namespace RPS.Contracts.ResponseModels.Project;

public class ChangeRequestResponse
{
    public Guid Id { get; set; }
    public string ChangeTitle { get; set; } = string.Empty;
    public string ChangeDescription { get; set; } = string.Empty;
    public string RequestType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? NewStartDate { get; set; }
    public DateTime? NewEndDate { get; set; }
    public int? NewDurationWeeks { get; set; }
    public string? RoleChangesJson { get; set; }
    public string? MemberChangesJson { get; set; }
}
