namespace RPS.Entities;

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

public enum ContractType
{
    Permanent,
    Contract
}

public enum UserRole
{
    GM,
    PM,
    Marketing,
    HR
}