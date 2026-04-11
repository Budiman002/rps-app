using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RPS.Contracts.RequestModels.Project;

namespace RPS.WebAPI.Controllers;

[ApiController]
[Route("api/projects/change-requests")]
[Authorize]
public class ProjectChangeRequestController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProjectChangeRequestController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "PM")]
    public async Task<IActionResult> Create([FromBody] CreateChangeRequestRequest request, CancellationToken cancellationToken)
    {
        request.RequestedBy = GetUserId();
        var id = await _mediator.Send(request, cancellationToken);
        return Ok(id);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "GM")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateChangeRequestStatus request, CancellationToken cancellationToken)
    {
        request.Id = id;
        var success = await _mediator.Send(request, cancellationToken);
        
        if (!success) return NotFound();
        
        return Ok();
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirstValue("id");
        return Guid.TryParse(idClaim, out var userId) ? userId : Guid.Empty;
    }
}
