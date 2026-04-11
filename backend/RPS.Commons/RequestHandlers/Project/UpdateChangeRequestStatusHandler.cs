using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Project;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Project;

public class UpdateChangeRequestStatusHandler : IRequestHandler<UpdateChangeRequestStatus, bool>
{
    private readonly AppDbContext _context;

    public UpdateChangeRequestStatusHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateChangeRequestStatus request, CancellationToken cancellationToken)
    {
        var changeRequest = await _context.ChangeRequests
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        
        if (changeRequest == null) return false;

        changeRequest.Status = Enum.Parse<RequestStatus>(request.Status, true);
        changeRequest.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
