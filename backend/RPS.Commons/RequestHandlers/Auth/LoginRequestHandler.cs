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
        // email yang disimpan ke DB ketika register apakah udah normalized - ToLower?
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email, cancellationToken);

        if (user is null)
        {
            throw new Exception("Email tidak ditemukan");
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
        if (!passwordValid)
        {
            throw new Exception("Password salah");
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
