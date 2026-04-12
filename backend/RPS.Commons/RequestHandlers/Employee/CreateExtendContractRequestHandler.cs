using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Employee;
using RPS.Contracts.ResponseModels.Employee;
using RPS.Entities;
using FluentValidation;
using FluentValidation.Results;

namespace RPS.Commons.RequestHandlers.Employee;

public class CreateExtendContractRequestHandler : IRequestHandler<CreateExtendContractRequest, CreateExtendContractResponse>
{
    private readonly AppDbContext _context;

    public CreateExtendContractRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CreateExtendContractResponse> Handle(CreateExtendContractRequest request, CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(x => x.Id == request.EmployeeId, cancellationToken);

        if (employee == null)
        {
            throw new KeyNotFoundException($"Employee with ID {request.EmployeeId} not found.");
        }

        // Move complex validation from Validator to Handler to avoid DI scoping issues
        if (employee.ContractEndDate.HasValue && request.RequestedEndDate.Date <= employee.ContractEndDate.Value.Date)
        {
            throw new ValidationException(new List<ValidationFailure>
            {
                new ValidationFailure("RequestedEndDate", "New end date has to be in the future.")
            });
        }

        var contractRequest = new ContractExtendRequest
        {
            Id = Guid.NewGuid(),
            EmployeeId = request.EmployeeId,
            RequestedBy = request.RequestedBy,
            Reason = request.Reason,
            RequestedEndDate = request.RequestedEndDate,
            Status = RequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ContractExtendRequests.Add(contractRequest);

        // Notify HR users
        var hrUsers = await _context.Users
            .Where(u => u.Role == UserRole.HR)
            .ToListAsync(cancellationToken);

        var gmUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.RequestedBy, cancellationToken);
        
        var gmName = gmUser?.FullName ?? "General Manager";

        foreach (var hr in hrUsers)
        {
            var notification = new RPS.Entities.Notification
            {
                Id = Guid.NewGuid(),
                RecipientId = hr.Id,
                Type = "ContractExtensionRequest",
                Title = "New Contract Extension Request",
                Message = $"{gmName} has requested a contract extension for {employee.FullName} until {request.RequestedEndDate:dd MMM yyyy}.",
                ReferenceId = contractRequest.Id,
                ReferenceType = "ContractExtendRequest",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new CreateExtendContractResponse
        {
            RequestId = contractRequest.Id
        };
    }
}
