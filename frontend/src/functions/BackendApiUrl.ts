import { AppSettings } from "./AppSettings";

const baseUrl = AppSettings.apiGatewayBasePath;

export const BackendApiUrl = {
  login: `${baseUrl}/Auth/login`,
  register: `${baseUrl}/Auth/register`,
  getDashboardStats: `${baseUrl}/Dashboard/stats`,
  getProjects: `${baseUrl}/Project`,
  getProjectById: `${baseUrl}/Project`,
  createProject: `${baseUrl}/Project`,
  updateProject: `${baseUrl}/Project`,
  getEmployees: `${baseUrl}/Employee`,
  createChangeRequest: `${baseUrl}/projects/change-requests`,
  createContractExtendRequest: `${baseUrl}/ContractExtendRequest`,
  getContractExtensionHistory: `${baseUrl}/ContractExtendRequest/history`,
  getNotifications: `${baseUrl}/Notification`,
  markNotificationAsRead: `${baseUrl}/Notification`,
};

export function GetProjectById(id: string): string {
  return `${BackendApiUrl.getProjectById}/${encodeURIComponent(id)}`;
}

export function UpdateProjectById(id: string): string {
  return `${BackendApiUrl.updateProject}/${encodeURIComponent(id)}`;
}

export function MarkNotificationAsRead(id: string): string {
  return `${BackendApiUrl.markNotificationAsRead}/${encodeURIComponent(id)}/read`;
}

export function GetContractExtensionHistoryByEmployeeId(employeeId: string): string {
  return `${BackendApiUrl.getContractExtensionHistory}/${encodeURIComponent(employeeId)}`;
}
