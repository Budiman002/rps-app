using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RPS.Contracts.RequestModels.Notification;
using RPS.Contracts.ResponseModels.Notification;

namespace RPS.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationResponse>>> List(CancellationToken cancellationToken)
    {
        var request = new GetNotificationListRequest
        {
            UserId = GetUserId()
        };
        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        var request = new MarkNotificationAsReadRequest
        {
            Id = id
        };
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
