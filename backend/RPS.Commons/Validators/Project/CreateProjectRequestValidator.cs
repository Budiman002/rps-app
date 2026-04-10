using FluentValidation;
using RPS.Contracts.RequestModels.Project;

namespace RPS.Commons.Validators.Project;

public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("name tidak boleh kosong");

        RuleFor(x => x.ClientName)
            .NotEmpty().WithMessage("client_name tidak boleh kosong");

        RuleFor(x => x.Priority)
            .NotEmpty().WithMessage("priority tidak boleh kosong");

        RuleFor(x => x.ExpectedStartDate)
            .NotEqual(default(DateTime)).WithMessage("expected_start_date tidak boleh kosong");

        RuleFor(x => x.DurationWeeks)
            .GreaterThan(0).WithMessage("duration_weeks harus lebih dari 0");
    }
}
