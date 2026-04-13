using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Employee;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Employee;

public class UpdateContractExtendRequestStatusHandler : IRequestHandler<UpdateContractExtendRequestStatus, bool>
{
    private readonly AppDbContext _context;

    public UpdateContractExtendRequestStatusHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateContractExtendRequestStatus request, CancellationToken cancellationToken)
    {
        var extensionRequest = await _context.ContractExtendRequests
            .Include(x => x.Employee)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (extensionRequest == null)
        {
            throw new KeyNotFoundException($"Contract extension request with ID {request.Id} not found.");
        }

        if (!Enum.TryParse<RequestStatus>(request.Status, true, out var newStatus))
        {
            throw new ValidationException(new List<ValidationFailure>
            {
                new ValidationFailure("Status", "Status must be either Approved or Rejected.")
            });
        }

        if (newStatus == RequestStatus.Pending)
        {
            throw new ValidationException(new List<ValidationFailure>
            {
                new ValidationFailure("Status", "Pending is not a valid decision status.")
            });
        }

        extensionRequest.Status = newStatus;
        extensionRequest.UpdatedAt = DateTime.UtcNow;

        if (newStatus == RequestStatus.Approved)
        {
            extensionRequest.Employee.ContractEndDate = extensionRequest.RequestedEndDate;
            extensionRequest.Employee.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}