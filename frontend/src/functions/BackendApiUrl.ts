import { AppSettings } from "./AppSettings";

const baseUrl = AppSettings.apiGatewayBasePath;

export const BackendApiUrl = {
  login: `${baseUrl}/Auth/login`,
  register: `${baseUrl}/Auth/register`,
  getDashboardStats: `${baseUrl}/Dashboard/stats`,
  getProjects: `${baseUrl}/Project`,
  getProjectById: `${baseUrl}/Project{id}`,
  createProject: `${baseUrl}/Project`,
  updateProject: `${baseUrl}/Project/{id}`,
  getEmployees: `${baseUrl}/employees`,
  createChangeRequest: `${baseUrl}/projects/change-requests`,
};

export function GetProjectById(id: string): string {
  return `${BackendApiUrl.getProjectById}/${encodeURIComponent(id)}`;
}

export function UpdateProjectById(id: string): string {
  return `${BackendApiUrl.updateProject}/${encodeURIComponent(id)}`;
}
