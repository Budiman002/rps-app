using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RPS.API.DTOs.Request;
using RPS.API.DTOs.Response;
using RPS.API.Services;

namespace RPS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectController : ControllerBase
{
    private readonly IProjectService projectService;

    public ProjectController(IProjectService projectService)
    {
        this.projectService = projectService;
    }

    [HttpGet("test")]
    [AllowAnonymous]
    public IActionResult Test() => Ok("works");

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateProjectDTO dto)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new Exception("User tidak valid");
            var createdBy = Guid.Parse(userIdClaim);

            var result = await projectService.CreateAsync(dto, createdBy);
            return StatusCode(201, new ApiResponse<ProjectResponseDTO>
            {
                Success = true,
                Data = result,
                Message = "Project berhasil dibuat"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = ex.InnerException?.Message ?? ex.Message
            });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new Exception("User tidak valid");
            var userRole = User.FindFirstValue(ClaimTypes.Role)
                ?? throw new Exception("Role tidak valid");

            var userId = Guid.Parse(userIdClaim);
            var result = await projectService.GetAllAsync(userRole, userId);
            return Ok(new ApiResponse<List<ProjectResponseDTO>>
            {
                Success = true,
                Data = result,
                Message = "Berhasil mengambil data project"
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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await projectService.GetByIdAsync(id);
            return Ok(new ApiResponse<ProjectResponseDTO>
            {
                Success = true,
                Data = result,
                Message = "Berhasil mengambil detail project"
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
