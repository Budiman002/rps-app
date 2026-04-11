using MediatR;
using RPS.Contracts.RequestModels.Project;
using RPS.Entities;

namespace RPS.Commons.RequestHandlers.Project;

public class CreateChangeRequestRequestHandler : IRequestHandler<CreateChangeRequestRequest, Guid>
{
    private readonly AppDbContext _context;

    public CreateChangeRequestRequestHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateChangeRequestRequest request, CancellationToken cancellationToken)
    {
        var changeRequest = new ChangeRequest
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            RequestedBy = request.RequestedBy,
            ChangeTitle = request.ChangeTitle,
            ChangeDescription = request.ChangeDescription,
            RequestType = Enum.Parse<ChangeRequestType>(request.RequestType, true),
            NewStartDate = request.NewStartDate,
            NewEndDate = request.NewEndDate,
            NewDurationWeeks = request.NewDurationWeeks,
            RoleChangesJson = request.RoleChangesJson,
            MemberChangesJson = request.MemberChangesJson,
            Status = RequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ChangeRequests.Add(changeRequest);
        await _context.SaveChangesAsync(cancellationToken);

        return changeRequest.Id;
    }
}
