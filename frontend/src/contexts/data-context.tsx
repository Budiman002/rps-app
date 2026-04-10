import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AppSettings } from "@/functions/AppSettings";
import { BackendApiUrl } from "@/functions/BackendApiUrl";
import { useAuth } from "@/contexts/auth-context";
import type {
  ChangeRequest,
  ContractExtensionRequest,
  Employee,
  Project,
  TeamMember,
} from "@/types/domain";

export type {
  ChangeRequest,
  ContractExtensionRequest,
  Employee,
  Project,
  TeamMember,
  Priority,
  Seniority,
} from "@/types/domain";

interface DataContextType {
  projects: Project[];
  employees: Employee[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addProject: (project: Omit<Project, "Id" | "UpdatedAt" | "Status" | "CreatedAt" | "Members">) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  assignMembers: (projectId: string, members: TeamMember[], pmId: string) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  addRequestChange: (projectId: string, title: string, description: string) => Promise<void>;
  addDetailedRequestChange: (projectId: string, changeRequest: ChangeRequest) => Promise<void>;
  approveChangeRequest: (projectId: string, requestId: string) => Promise<void>;
  rejectChangeRequest: (projectId: string, requestId: string) => Promise<void>;
  requestContractExtension: (employeeId: string, proposedEndDate: string, reason: string, requestedBy: string) => Promise<void>;
  approveContractExtension: (employeeId: string) => Promise<void>;
  rejectContractExtension: (employeeId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        if (response.status === 401) {
            // Token expired or invalid
        }
        throw new Error(`API Request failed: ${response.statusText}`);
    }
    return response;
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.Id === employeeId)?.FullName || "Unknown";
  };

  const formatDate = (value: string) => {
    const parts = value.split("T");
    const dateOnly = parts[0];
    if (!dateOnly) return "-";
    const [year, month, day] = dateOnly.split("-").map(Number);
    if (year === undefined || month === undefined || day === undefined || isNaN(year) || isNaN(month) || isNaN(day)) return value;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  const refreshData = async () => {
    if (!isAuthenticated || !token) return;
    
    setIsLoading(true);
    try {
      const [projRes, empRes] = await Promise.all([
        fetchWithAuth(BackendApiUrl.getProjects),
        fetchWithAuth(BackendApiUrl.getEmployees)
      ]);

      const [projData, empData] = await Promise.all([
        projRes.json() as Promise<Project[]>,
        empRes.json() as Promise<Employee[]>
      ]);

      setProjects(projData);
      setEmployees(empData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setProjects([]);
      setEmployees([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const addProject = async (project: Omit<Project, "Id" | "UpdatedAt" | "Status" | "CreatedAt" | "Members">) => {
    await fetchWithAuth(BackendApiUrl.createProject, {
      method: "POST",
      body: JSON.stringify(project),
    });
    await refreshData();
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const url = `${BackendApiUrl.updateProject}/${id}`;
    await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    await refreshData();
  };

  const assignMembers = async (projectId: string, members: TeamMember[], pmId: string) => {
    const url = `${BackendApiUrl.updateProject}/${projectId}/assign`;
    await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify({
        AssignedPmId: pmId,
        Members: members
      }),
    });
    await refreshData();
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    // Note: Adjust endpoint if specific employee update exists
    const url = `${BackendApiUrl.getEmployees}/${id}`;
    await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    await refreshData();
  };

  const addRequestChange = async (projectId: string, title: string, description: string) => {
    await fetchWithAuth(BackendApiUrl.createChangeRequest, {
      method: "POST",
      body: JSON.stringify({
        ProjectId: projectId,
        ChangeTitle: title,
        ChangeDescription: description,
        RequestType: "Timeline" // Default or selected
      }),
    });
    await refreshData();
  };

  const addDetailedRequestChange = async (projectId: string, changeRequest: ChangeRequest) => {
     await fetchWithAuth(BackendApiUrl.createChangeRequest, {
      method: "POST",
      body: JSON.stringify({
        ...changeRequest,
        ProjectId: projectId
      }),
    });
    await refreshData();
  };

  const approveChangeRequest = async (projectId: string, requestId: string) => {
    const url = `${BackendApiUrl.createChangeRequest}/${requestId}`;
    await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify({ Status: "Approved" }),
    });
    await refreshData();
  };

  const rejectChangeRequest = async (projectId: string, requestId: string) => {
    const url = `${BackendApiUrl.createChangeRequest}/${requestId}`;
    await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify({ Status: "Rejected" }),
    });
    await refreshData();
  };

  const requestContractExtension = async (employeeId: string, proposedEndDate: string, reason: string, requestedBy: string) => {
    const url = `${AppSettings.apiGatewayBasePath}/ContractRequest`;
    await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify({
        EmployeeId: employeeId,
        RequestedEndDate: proposedEndDate,
        Reason: reason
      }),
    });
    await refreshData();
  };

  const approveContractExtension = async (requestId: string) => {
    const url = `${AppSettings.apiGatewayBasePath}/ContractRequest/${requestId}`;
    await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify({ Status: "Approved" }),
    });
    await refreshData();
  };

  const rejectContractExtension = async (requestId: string) => {
    const url = `${AppSettings.apiGatewayBasePath}/ContractRequest/${requestId}`;
    await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify({ Status: "Rejected" }),
    });
    await refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        employees,
        isLoading,
        refreshData,
        addProject,
        updateProject,
        assignMembers,
        updateEmployee,
        addRequestChange,
        addDetailedRequestChange,
        approveChangeRequest,
        rejectChangeRequest,
        requestContractExtension,
        approveContractExtension,
        rejectContractExtension,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
