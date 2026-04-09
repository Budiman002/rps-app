using RPS.API.DTOs.Request;
using RPS.API.DTOs.Response;

namespace RPS.API.Services;

public interface IProjectService
{
    Task<ProjectResponseDTO> CreateAsync(CreateProjectDTO dto, Guid createdBy);
    Task<List<ProjectResponseDTO>> GetAllAsync(string userRole, Guid userId);
    Task<ProjectResponseDTO> GetByIdAsync(Guid id);
}
