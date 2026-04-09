namespace RPS.API.Models;

public enum UserRole
{
    GM,
    PM,
    Marketing,
    HR
}

public enum ContractType
{
    Permanent,
    Contract
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

public enum SeniorityLevel
{
    Senior,
    Junior,
    Intern
}

public enum EmploymentStatus
{
    Dedicated,
    Parallel
}

public enum ChangeRequestType
{
    Timeline,
    Team,
    Roles
}

public enum RequestStatus
{
    Pending,
    Approved,
    Rejected
}

public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public ContractType ContractType { get; set; }
    public DateTime? ContractEndDate { get; set; }
    public int YearsOfExperience { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Project> CreatedProjects { get; set; } = new List<Project>();
    public ICollection<Project> AssignedProjects { get; set; } = new List<Project>();
}

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

public class ProjectRoleComposition
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string RoleTitle { get; set; } = string.Empty;
    public SeniorityLevel SeniorityLevel { get; set; }
    public EmploymentStatus EmploymentStatus { get; set; }
    public int Quantity { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Project Project { get; set; } = null!;
    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
}

public class ProjectMember
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public Guid RoleCompositionId { get; set; }
    public Guid AssignedBy { get; set; }
    public DateTime AssignedAt { get; set; }

    public Project Project { get; set; } = null!;
    public User User { get; set; } = null!;
    public ProjectRoleComposition RoleComposition { get; set; } = null!;
    public User AssignedByUser { get; set; } = null!;
}

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
    public RequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Project Project { get; set; } = null!;
    public User RequestedByUser { get; set; } = null!;
}

public class ContractExtendRequest
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid RequestedBy { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime RequestedEndDate { get; set; }
    public RequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User Employee { get; set; } = null!;
    public User RequestedByUser { get; set; } = null!;
}

public class Notification
{
    public Guid Id { get; set; }
    public Guid RecipientId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public Guid? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }

    public User Recipient { get; set; } = null!;
}
