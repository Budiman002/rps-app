namespace RPS.Entities;

public class Project
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string NotesFromMarketing { get; set; } = string.Empty;
    public ProjectPriority Priority { get; set; }
    public ProjectStatus Status { get; set; }
    public DateTime ExpectedStartDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime EstimatedEndDate { get; set; }
    public int DurationWeeks { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid? AssignedPmId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User CreatedByUser { get; set; } = null!;
    public User? AssignedPm { get; set; }
    public ICollection<ProjectRoleComposition> RoleCompositions { get; set; } = new List<ProjectRoleComposition>();
    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public ICollection<ChangeRequest> ChangeRequests { get; set; } = new List<ChangeRequest>();
}

public enum ProjectPriority
{
    Low,
    Medium,
    High,
    Critical
}

public enum ProjectStatus
{
    Unassigned,
    Scheduled,
    InProgress,
    Complete
}
