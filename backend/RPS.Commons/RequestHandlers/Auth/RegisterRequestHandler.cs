using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Commons.Helpers;
using RPS.Contracts.RequestModels.Auth;
using RPS.Contracts.ResponseModels.Auth;
using RPS.Entities;
using FluentValidation;
using FluentValidation.Results;

namespace RPS.Commons.RequestHandlers.Auth;

public class RegisterRequestHandler : IRequestHandler<RegisterRequest, AuthResponse>
{
    private readonly AppDbContext _context;

    public RegisterRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AuthResponse> Handle(RegisterRequest request, CancellationToken cancellationToken)
    {
        var existingUser = await _context.Users
            .AnyAsync(x => x.Email == request.Email, cancellationToken);

        if (existingUser)
        {
            throw new ValidationException(new List<ValidationFailure>
            {
                new ValidationFailure("Email", "Email sudah terdaftar")
            });
        }

        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
        {
            throw new Exception("Role tidak valid");
        }

        var now = DateTime.UtcNow;
        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role,
            ContractType = ContractType.Permanent,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

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
