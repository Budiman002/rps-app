using FluentValidation;
using RPS.Contracts.RequestModels.Project;

namespace RPS.Commons.Validators.Project;

public class CreateChangeRequestRequestValidator : AbstractValidator<CreateChangeRequestRequest>
{
    public CreateChangeRequestRequestValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID tidak boleh kosong");

        RuleFor(x => x.ChangeTitle)
            .NotEmpty().WithMessage("Change Title tidak boleh kosong")
            .MaximumLength(150).WithMessage("Change Title can only contain up to 150 characters.");

        RuleFor(x => x.ChangeDescription)
            .NotEmpty().WithMessage("Change Description tidak boleh kosong");

        RuleFor(x => x.RequestType)
            .NotEmpty().WithMessage("Request Type tidak boleh kosong");
    }
}