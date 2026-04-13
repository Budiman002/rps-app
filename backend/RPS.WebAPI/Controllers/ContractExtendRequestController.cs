using System.Security.Claims;
using FluentValidation;
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
        try
        {
            request.RequestedBy = GetUserId();
            var result = await _mediator.Send(request, cancellationToken);
            return Ok(result);
        }
        catch (ValidationException ex)
        {
            var message = ex.Errors.FirstOrDefault()?.ErrorMessage ?? ex.Message;
            return BadRequest(new { message });
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateContractExtendRequestStatus request,
        CancellationToken cancellationToken)
    {
        request.Id = id;
        var result = await _mediator.Send(request, cancellationToken);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpGet("history/{employeeId:guid}")]
    [Authorize(Roles = "HR")]
    public async Task<ActionResult<List<ContractExtensionRequestResponse>>> GetHistory(
        Guid employeeId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetContractExtensionHistoryRequest
        {
            EmployeeId = employeeId
        }, cancellationToken);

        return Ok(result);
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirstValue("id");
        return Guid.TryParse(idClaim, out var userId) ? userId : Guid.Empty;
    }
}
