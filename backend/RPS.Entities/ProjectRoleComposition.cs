namespace RPS.Entities;

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
