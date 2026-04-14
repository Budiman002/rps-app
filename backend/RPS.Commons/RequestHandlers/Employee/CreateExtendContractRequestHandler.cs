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
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.EmployeeId, cancellationToken);

        if (employee == null)
        {
            throw new KeyNotFoundException($"Employee with ID {request.EmployeeId} not found.");
        }

        // Check if employee already has 2 finalized requests within the last 30 days
        // Only count Approved/Rejected, not Pending (to allow multiple submissions before decision)
        var recentRequests = await _context.ContractExtendRequests
            .AsNoTracking()
            .Where(x => x.EmployeeId == request.EmployeeId &&
                        x.CreatedAt >= DateTime.UtcNow.AddDays(-30) &&
                        (x.Status == RequestStatus.Approved || x.Status == RequestStatus.Rejected))
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        if (recentRequests.Count >= 2)
        {
            // Find the oldest finalized request in the 30-day window to calculate when next window opens
            var oldestRequest = recentRequests.First();

            var nextAvailableDate = oldestRequest.CreatedAt.AddDays(30);
            throw new ValidationException(new List<ValidationFailure>
            {
                new ValidationFailure(
                    "EmployeeId",
                    $"Maximum 2 contract extension requests allowed per 30 days. Next request can be submitted on {nextAvailableDate:yyyy-MM-dd}.")
            });
        }

        // Move complex validation from Validator to Handler to avoid DI scoping issues
        if (employee.ContractEndDate.HasValue && request.RequestedEndDate <= employee.ContractEndDate.Value)
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
            .AsNoTracking()
            .Where(u => u.Role == UserRole.HR)
            .ToListAsync(cancellationToken);

        var gmUser = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.RequestedBy, cancellationToken);

        var gmName = gmUser?.FullName ?? "General Manager";

        var notifications = new List<RPS.Entities.Notification>();
        foreach (var hr in hrUsers)
        {
            notifications.Add(new RPS.Entities.Notification
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
            });
        }
        _context.Notifications.AddRange(notifications);

        await _context.SaveChangesAsync(cancellationToken);

        return new CreateExtendContractResponse
        {
            RequestId = contractRequest.Id
        };
    }
}
