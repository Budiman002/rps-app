export type UserRole = "marketing" | "gm" | "pm" | "hr";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ProjectStatus = "unassigned" | "scheduled" | "in-progress" | "completed";
export type Priority = "low" | "medium" | "high" | "critical";
export type Seniority = "intern" | "junior" | "senior";

export interface TeamMember {
  id: string;
  employeeId: string;
  role: string;
  seniority: Seniority;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  type: "timeline" | "roles" | "employees" | "general";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  changes?: {
    timeline?: {
      oldStartDate?: string;
      newStartDate?: string;
      oldEndDate?: string;
      newEndDate?: string;
      oldDuration?: number;
      newDuration?: number;
    };
    roles?: {
      added?: Array<{ role: string; seniority: Seniority; count: number; allocationType?: "dedicated" | "parallel" }>;
      removed?: Array<{ role: string; seniority: Seniority; count: number; allocationType?: "dedicated" | "parallel" }>;
      modified?: Array<{
        role: string;
        seniority: Seniority;
        oldCount: number;
        newCount: number;
        allocationType?: "dedicated" | "parallel";
      }>;
    };
    employees?: {
      added?: Array<{ employeeId: string; role: string; seniority: Seniority }>;
      removed?: Array<{ employeeId: string; role: string; seniority: Seniority }>;
    };
  };
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  expectedStartDate: string;
  duration: number;
  estimatedEndDate: string;
  startDate?: string;
  endDate?: string;
  priority: Priority;
  status: ProjectStatus;
  notes: string;
  poDocument?: string;
  teamComposition: Array<{
    role: string;
    seniority: Seniority;
    allocationType: "dedicated" | "parallel";
    count: number;
  }>;
  assignedMembers?: TeamMember[];
  pmId?: string;
  lastUpdated: string;
  requestChanges?: ChangeRequest[];
}

export interface ContractExtensionRequest {
  id: string;
  employeeId: string;
  requestedBy: string;
  requestedDate: string;
  proposedEndDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  dob: string;
  role: string;
  seniority: Seniority;
  contractType: "permanent" | "contract";
  contractStartDate: string;
  contractEndDate?: string;
  isDedicated: boolean;
  currentProject?: string;
  extensionRequest?: ContractExtensionRequest;
}

