using MediatR;

namespace RPS.Contracts.RequestModels.Notification;

public class MarkNotificationAsReadRequest : IRequest<bool>
{
    public Guid Id { get; set; }
}
