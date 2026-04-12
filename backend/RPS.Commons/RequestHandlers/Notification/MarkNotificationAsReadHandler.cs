using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Notification;
using RPS.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace RPS.Commons.RequestHandlers.Notification;

public class MarkNotificationAsReadHandler : IRequestHandler<MarkNotificationAsReadRequest, bool>
{
    private readonly AppDbContext _context;

    public MarkNotificationAsReadHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(MarkNotificationAsReadRequest request, CancellationToken cancellationToken)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (notification == null)
        {
            return false;
        }

        notification.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
