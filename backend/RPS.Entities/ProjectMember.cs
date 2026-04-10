namespace RPS.Entities;

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
