using FluentValidation;
using RPS.Contracts.RequestModels.Project;
using RPS.Entities;

namespace RPS.Commons.Validators.Project;

public class UpdateProjectRequestValidator : AbstractValidator<UpdateProjectRequest>
{
    public UpdateProjectRequestValidator()
    {

        RuleFor(x => x.NewDurationWeeks)
            .GreaterThan(0)
            .When(x => x.NewDurationWeeks.HasValue)
            .WithMessage("Duration must be greater than 0 weeks.");

        RuleFor(x => x.NewEndDate)
            .GreaterThan(x => x.NewStartDate!.Value)
            .When(x => x.NewEndDate.HasValue && x.NewStartDate.HasValue)
            .WithMessage("End date must be after the new start date.");

        RuleForEach(x => x.Roles).ChildRules(role =>
        {
            role.RuleFor(r => r.RoleTitle)
                .NotEmpty().WithMessage("Role title is required.")
                .MaximumLength(200).WithMessage("Role title must not exceed 200 characters.");

            role.RuleFor(r => r.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than 0.");

            role.RuleFor(r => r.SeniorityLevel)
                .NotEmpty().WithMessage("Seniority level is required.")
                .Must(v => Enum.TryParse<SeniorityLevel>(v, out _))
                .WithMessage("Invalid seniority level. Valid values: Senior, Junior, Intern.");

            role.RuleFor(r => r.EmploymentStatus)
                .NotEmpty().WithMessage("Employment status is required.")
                .Must(v => Enum.TryParse<EmploymentStatus>(v, out _))
                .WithMessage("Invalid employment status. Valid values: Dedicated, Parallel.");
        });

        RuleForEach(x => x.Members).ChildRules(member =>
        {
            member.RuleFor(m => m.EmployeeId)
                .NotEqual(Guid.Empty)
                .WithMessage("A valid Employee ID is required for each member.");

            member.RuleFor(m => m.RoleCompositionId)
                .NotEqual(Guid.Empty)
                .WithMessage("A valid Role Composition ID is required for each member.");
        });
    }
}
