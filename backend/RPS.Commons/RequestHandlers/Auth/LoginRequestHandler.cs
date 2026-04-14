using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Commons.Helpers;
using RPS.Contracts.RequestModels.Auth;
using RPS.Contracts.ResponseModels.Auth;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Auth;

public class LoginRequestHandler : IRequestHandler<LoginRequest, AuthResponse>
{
    private readonly AppDbContext _context;

    public LoginRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AuthResponse> Handle(LoginRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email.ToLower() == normalizedEmail, cancellationToken);

        if (user is null)
        {
            throw new UnauthorizedAccessException("Email atau password salah");
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
        if (!passwordValid)
        {
            throw new UnauthorizedAccessException("Email atau password salah");
        }

        var token = JwtHelper.GenerateToken(user);

        return new AuthResponse
        {
            Token = token,
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }
}
