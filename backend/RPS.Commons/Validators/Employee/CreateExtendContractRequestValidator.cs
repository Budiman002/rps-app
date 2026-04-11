using FluentValidation;
using RPS.Contracts.RequestModels.Employee;

namespace RPS.Commons.Validators.Employee;

public class CreateExtendContractRequestValidator : AbstractValidator<CreateExtendContractRequest>
{
    public CreateExtendContractRequestValidator()
    {
        RuleFor(x => x.EmployeeId)
            .NotEmpty().WithMessage("Employee ID tidak boleh kosong");

        RuleFor(x => x.RequestedEndDate)
            .NotEmpty().WithMessage("Requested End Date tidak boleh kosong")
            .GreaterThan(DateTime.Today).WithMessage("Requested End Date harus di masa depan");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason tidak boleh kosong");
    }
}
