using MediatR;
using System.Collections.Generic;
using RPS.Contracts.ResponseModels.Notification;

namespace RPS.Contracts.RequestModels.Notification;

public class GetNotificationListRequest : IRequest<List<NotificationResponse>>
{
    public Guid UserId { get; set; }
}
