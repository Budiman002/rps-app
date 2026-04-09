using RPS.API.DTOs.Request;
using RPS.API.DTOs.Response;

namespace RPS.API.Services;

public interface IAuthService
{
    Task<AuthResponseDTO> RegisterAsync(RegisterDTO dto);
    Task<AuthResponseDTO> LoginAsync(LoginDTO dto);
}
