using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RPS.API.DTOs.Response;
using RPS.API.Services;

namespace RPS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        this.dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new Exception("User tidak valid");
            var userRole = User.FindFirstValue(ClaimTypes.Role)
                ?? throw new Exception("Role tidak valid");

            var userId = Guid.Parse(userIdClaim);
            var stats = await dashboardService.GetStatsAsync(userRole, userId);

            return Ok(new ApiResponse<DashboardStatsDTO>
            {
                Success = true,
                Data = stats,
                Message = "Berhasil mengambil statistik dashboard"
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
