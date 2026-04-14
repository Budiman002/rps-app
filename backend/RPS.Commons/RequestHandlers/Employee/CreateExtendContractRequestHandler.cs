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

        // Query line 34 & 43 sama persis, hanya beda di sorting & count
        // Lebih baik 1x query ToListAsync, tinggal count & ambil data paling pertama
        // Biasakan memakai AsNoTracking di query yang fungsinya hanya untuk tampilkan data

        // Check if employee already has 2 finalized requests within the last 30 days
        // Only count Approved/Rejected, not Pending (to allow multiple submissions before decision)
        var requestsLast30Days = await _context.ContractExtendRequests
            .Where(x => x.EmployeeId == request.EmployeeId &&
                        x.CreatedAt >= DateTime.UtcNow.AddDays(-30) &&
                        (x.Status == RequestStatus.Approved || x.Status == RequestStatus.Rejected))
            .CountAsync(cancellationToken);

        if (requestsLast30Days >= 2)
        {
            // Find the oldest finalized request in the 30-day window to calculate when next window opens
            var oldestRequest = await _context.ContractExtendRequests
                .Where(x => x.EmployeeId == request.EmployeeId &&
                            x.CreatedAt >= DateTime.UtcNow.AddDays(-30) &&
                            (x.Status == RequestStatus.Approved || x.Status == RequestStatus.Rejected))
                .OrderBy(x => x.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (oldestRequest == null)
            {
                throw new InvalidOperationException("Unable to determine oldest request for cooldown calculation.");
            }

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

            // Lebih baik simpan di var terpisah kemudian pakai AddRange
            _context.Notifications.Add(notification);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new CreateExtendContractResponse
        {
            RequestId = contractRequest.Id
        };
    }
}
