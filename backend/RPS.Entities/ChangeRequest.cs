namespace RPS.Entities;

public class ChangeRequest
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid RequestedBy { get; set; }
    public string ChangeTitle { get; set; } = string.Empty;
    public string ChangeDescription { get; set; } = string.Empty;
    public ChangeRequestType RequestType { get; set; }
    public DateTime? NewStartDate { get; set; }
    public DateTime? NewEndDate { get; set; }
    public int? NewDurationWeeks { get; set; }
    public string? RoleChangesJson { get; set; }
    public string? MemberChangesJson { get; set; }
    public RequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Project Project { get; set; } = null!;
    public User RequestedByUser { get; set; } = null!;
}

public enum ChangeRequestType
{
    Timeline,
    Team,
    Roles
}