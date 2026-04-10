using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RPS.Contracts.RequestModels.Dashboard;

namespace RPS.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] GetDashboardStatsRequest request, CancellationToken cancellationToken)
    {
        var idClaim = User.FindFirstValue("id");
        request.UserId = Guid.TryParse(idClaim, out var userId) ? userId : Guid.Empty;
        request.UserRole = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }
}
