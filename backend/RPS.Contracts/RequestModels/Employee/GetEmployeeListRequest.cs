using MediatR;
using RPS.Contracts.ResponseModels.Employee;

namespace RPS.Contracts.RequestModels.Employee;

public class GetEmployeeListRequest : IRequest<List<EmployeeResponse>>
{
}
