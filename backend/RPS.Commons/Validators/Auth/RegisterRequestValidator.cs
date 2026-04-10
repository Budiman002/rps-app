using FluentValidation;
using RPS.Contracts.RequestModels.Auth;

namespace RPS.Commons.Validators.Auth;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("full_name tidak boleh kosong");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("email tidak boleh kosong")
            .EmailAddress().WithMessage("email harus format email valid");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("password tidak boleh kosong")
            .MinimumLength(6).WithMessage("password minimal 6 karakter");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("role tidak boleh kosong");
    }
}
