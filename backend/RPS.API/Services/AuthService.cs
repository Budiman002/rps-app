using Microsoft.EntityFrameworkCore;
using RPS.API.Data;
using RPS.API.DTOs.Request;
using RPS.API.DTOs.Response;
using RPS.API.Helpers;
using RPS.API.Models;

namespace RPS.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext context;
    private readonly JwtHelper jwtHelper;

    public AuthService(AppDbContext context, JwtHelper jwtHelper)
    {
        this.context = context;
        this.jwtHelper = jwtHelper;
    }

    public async Task<AuthResponseDTO> RegisterAsync(RegisterDTO dto)
    {
        var email = dto.Email.Trim().ToLower();
        var existingUser = await context.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == email);
        if (existingUser is not null)
        {
            throw new Exception("Email sudah terdaftar");
        }

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
        {
            throw new Exception("Role tidak valid");
        }

        var now = DateTime.UtcNow;
        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            ContractType = ContractType.Permanent,
            YearsOfExperience = 0,
            CreatedAt = now,
            UpdatedAt = now
        };

        await context.Users.AddAsync(user);
        await context.SaveChangesAsync();

        return new AuthResponseDTO
        {
            Token = jwtHelper.GenerateToken(user),
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponseDTO> LoginAsync(LoginDTO dto)
    {
        var email = dto.Email.Trim().ToLower();
        var user = await context.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == email);
        if (user is null)
        {
            throw new Exception("Email tidak ditemukan");
        }

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);
        if (!isPasswordValid)
        {
            throw new Exception("Password salah");
        }

        return new AuthResponseDTO
        {
            Token = jwtHelper.GenerateToken(user),
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }
}
