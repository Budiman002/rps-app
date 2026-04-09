using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RPS.API.DTOs.Request;
using RPS.API.DTOs.Response;
using RPS.API.Services;

namespace RPS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService authService;

    public AuthController(IAuthService authService)
    {
        this.authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
    {
        try
        {
            var result = await authService.RegisterAsync(dto);
            return StatusCode(201, new ApiResponse<AuthResponseDTO>
            {
                Success = true,
                Data = result,
                Message = "Register berhasil"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message
            });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        try
        {
            var result = await authService.LoginAsync(dto);
            return Ok(new ApiResponse<AuthResponseDTO>
            {
                Success = true,
                Data = result,
                Message = "Login berhasil"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message
            });
        }
    }
}
