using MediatR;
using RPS.Contracts.ResponseModels.Auth;

namespace RPS.Contracts.RequestModels.Auth;

public class RegisterRequest : IRequest<AuthResponse>
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
