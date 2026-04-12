using System.ComponentModel.DataAnnotations;

namespace RPS.Entities;

public class Employee
{
    public Guid Id { get; set; }

    [StringLength(200)]
    public string FullName { get; set; } = string.Empty;

    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [StringLength(100)]
    public string JobTitle { get; set; } = string.Empty;

    [StringLength(50)]
    public string SeniorityLevel { get; set; } = string.Empty;

    [StringLength(50)]
    public string ContractType { get; set; } = string.Empty;

    public DateTime? ContractEndDate { get; set; }
    public int YearsOfExperience { get; set; }
    public Guid? UserId { get; set; }
    public virtual User? User { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
