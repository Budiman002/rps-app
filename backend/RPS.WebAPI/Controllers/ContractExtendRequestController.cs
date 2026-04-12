using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RPS.Contracts.RequestModels.Employee;
using RPS.Contracts.ResponseModels.Employee;

namespace RPS.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContractExtendRequestController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContractExtendRequestController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "GM")]
    public async Task<ActionResult<CreateExtendContractResponse>> Create(
        [FromBody] CreateExtendContractRequest request,
        CancellationToken cancellationToken)
    {
        request.RequestedBy = GetUserId();
        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirstValue("id");
        return Guid.TryParse(idClaim, out var userId) ? userId : Guid.Empty;
    }
}
