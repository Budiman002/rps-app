using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RPS.Contracts.RequestModels.Project;

namespace RPS.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProjectController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Marketing")]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request, CancellationToken cancellationToken)
    {
        request.CreatedBy = GetUserId();
        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetProjectListRequest request, CancellationToken cancellationToken)
    {
        request.UserId = GetUserId();
        request.UserRole = GetUserRole();
        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var request = new GetProjectDetailRequest { Id = id };
        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirstValue("id");
        return Guid.TryParse(idClaim, out var userId) ? userId : Guid.Empty;
    }

    private string GetUserRole()
    {
        return User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    }
}
