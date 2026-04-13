using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Employee;
using RPS.Contracts.ResponseModels.Employee;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Employee;

public class GetContractExtensionHistoryRequestHandler : IRequestHandler<GetContractExtensionHistoryRequest, List<ContractExtensionRequestResponse>>
{
    private readonly AppDbContext _context;

    public GetContractExtensionHistoryRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ContractExtensionRequestResponse>> Handle(GetContractExtensionHistoryRequest request, CancellationToken cancellationToken)
    {
        return await _context.ContractExtendRequests
            .Where(x => x.EmployeeId == request.EmployeeId &&
                        (x.Status == RequestStatus.Approved || x.Status == RequestStatus.Rejected))
            .OrderByDescending(x => x.UpdatedAt)
            .Select(x => new ContractExtensionRequestResponse
            {
                Id = x.Id,
                EmployeeId = x.EmployeeId,
                RequestedBy = x.RequestedBy,
                RequestedDate = x.CreatedAt,
                ProposedEndDate = x.RequestedEndDate,
                Reason = x.Reason,
                Status = x.Status.ToString().ToLowerInvariant(),
                ExpiresAt = null  // History only shows approved/rejected, which don't expire
            })
            .ToListAsync(cancellationToken);
    }
}