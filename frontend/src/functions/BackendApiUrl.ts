import { AppSettings } from "./AppSettings";

const baseUrl = AppSettings.apiGatewayBasePath;

export const BackendApiUrl = {
  getProjects: `${baseUrl}/projects`,
  getProjectById: `${baseUrl}/projects`,
  createProject: `${baseUrl}/projects`,
  updateProject: `${baseUrl}/projects`,
  getEmployees: `${baseUrl}/employees`,
  createChangeRequest: `${baseUrl}/projects/change-requests`,
};

export function GetProjectById(id: string): string {
  return `${BackendApiUrl.getProjectById}/${encodeURIComponent(id)}`;
}

export function UpdateProjectById(id: string): string {
  return `${BackendApiUrl.updateProject}/${encodeURIComponent(id)}`;
}

