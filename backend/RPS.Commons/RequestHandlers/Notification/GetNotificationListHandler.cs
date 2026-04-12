using MediatR;
using Microsoft.EntityFrameworkCore;
using RPS.Contracts.RequestModels.Notification;
using RPS.Contracts.ResponseModels.Notification;
using RPS.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RPS.Commons.RequestHandlers.Notification;

public class GetNotificationListHandler : IRequestHandler<GetNotificationListRequest, List<NotificationResponse>>
{
    private readonly AppDbContext _context;

    public GetNotificationListHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<NotificationResponse>> Handle(GetNotificationListRequest request, CancellationToken cancellationToken)
    {
        var notifications = await _context.Notifications
            .Where(x => x.RecipientId == request.UserId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new NotificationResponse
            {
                Id = x.Id,
                Type = x.Type,
                Title = x.Title,
                Message = x.Message,
                ReferenceId = x.ReferenceId,
                ReferenceType = x.ReferenceType,
                IsRead = x.IsRead,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return notifications;
    }
}
