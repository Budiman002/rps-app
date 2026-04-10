using MediatR;
using RPS.Contracts.ResponseModels.Auth;

namespace RPS.Contracts.RequestModels.Auth;

public class LoginRequest : IRequest<AuthResponse>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
