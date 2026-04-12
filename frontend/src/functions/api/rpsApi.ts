import { useMemo } from "react";
import { BackendApiUrl, GetProjectById, MarkNotificationAsRead, UpdateProjectById } from "../BackendApiUrl";
import { useFetchWithAccessToken } from "../useFetchWithAccessToken";
import type { ChangeRequest, CreateExtendContractRequest, Employee, Notification, Project, UpdateProjectRequest } from "@/types/domain";

export function useRpsApi() {
  const { fetchGET, fetchPOST, fetchPUT } = useFetchWithAccessToken();

  return useMemo(() => ({
    getProjects: () => fetchGET<Project[]>(BackendApiUrl.getProjects),
    getProjectById: (id: string) => fetchGET<Project>(GetProjectById(id)),
    createProject: (payload: Omit<Project, "Id" | "UpdatedAt" | "Status" | "CreatedAt" | "Members">) =>
      fetchPOST<Project>(BackendApiUrl.createProject, payload),
    updateProject: (id: string, payload: UpdateProjectRequest) =>
      fetchPUT<Project>(UpdateProjectById(id), payload),
    getEmployees: () => fetchGET<Employee[]>(BackendApiUrl.getEmployees),
    createChangeRequest: (payload: ChangeRequest) =>
      fetchPOST<ChangeRequest>(BackendApiUrl.createChangeRequest, payload),
    createContractExtendRequest: (payload: CreateExtendContractRequest) =>
      fetchPOST<void>(BackendApiUrl.createContractExtendRequest, payload),
    getNotifications: () => fetchGET<Notification[]>(BackendApiUrl.getNotifications),
    markNotificationAsRead: (id: string) => fetchPUT<void>(MarkNotificationAsRead(id), {}),
  }), [fetchGET, fetchPOST, fetchPUT]);
}

