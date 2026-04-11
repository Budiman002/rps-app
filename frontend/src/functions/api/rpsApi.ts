import { BackendApiUrl, GetProjectById, UpdateProjectById } from "../BackendApiUrl";
import { useFetchWithAccessToken } from "../useFetchWithAccessToken";
import type { ChangeRequest, Employee, Project } from "@/types/domain";

export function useRpsApi() {
  const { fetchGET, fetchPOST, fetchPUT } = useFetchWithAccessToken();

  return {
    getProjects: () => fetchGET<Project[]>(BackendApiUrl.getProjects),
    getProjectById: (id: string) => fetchGET<Project>(GetProjectById(id)),
    createProject: (payload: Omit<Project, "Id" | "UpdatedAt" | "Status" | "CreatedAt" | "Members">) =>
      fetchPOST<Project>(BackendApiUrl.createProject, payload),
    updateProject: (id: string, payload: Partial<Project>) =>
      fetchPUT<Project>(UpdateProjectById(id), payload),
    getEmployees: () => fetchGET<Employee[]>(BackendApiUrl.getEmployees),
    createChangeRequest: (payload: ChangeRequest) =>
      fetchPOST<ChangeRequest>(BackendApiUrl.createChangeRequest, payload),
  };
}

