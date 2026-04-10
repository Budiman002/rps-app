export type UserRole = "Marketing" | "GM" | "PM" | "HR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ProjectStatus =
  | "unassigned"
  | "scheduled"
  | "in-progress"
  | "completed";
export type Priority = "low" | "medium" | "high" | "critical";
export type Seniority = "intern" | "junior" | "senior";

export interface RoleComposition {
  id: string;
  roleTitle: string;
  seniorityLevel: Seniority;
  quantity: number;
  employmentStatus: "dedicated" | "parallel";
}

export interface ProjectMember {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  jobTitle: string;
  seniorityLevel: Seniority;
  roleCompositionId: string;
  roleTitle: string;
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
      added?: Array<{
        role: string;
        seniority: Seniority;
        count: number;
        allocationType?: "dedicated" | "parallel";
      }>;
      removed?: Array<{
        role: string;
        seniority: Seniority;
        count: number;
        allocationType?: "dedicated" | "parallel";
      }>;
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
      removed?: Array<{
        employeeId: string;
        role: string;
        seniority: Seniority;
      }>;
    };
  };
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  expectedStartDate: string;
  durationWeeks: number;
  estimatedEndDate: string;
  actualStartDate?: string;
  endDate?: string;
  priority: Priority;
  status: ProjectStatus;
  notesFromMarketing: string;
  poDocument?: string;
  roleCompositions: RoleComposition[];
  members?: ProjectMember[];
  assignedPmId?: string;
  createdAt: string;
  updatedAt: string;
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
  fullName: string;
  email: string;
  jobTitle: string;
  seniorityLevel: Seniority;
  yearsOfExperience: number;
  contractType: "permanent" | "contract";
  contractEndDate?: string;
  isDedicated?: boolean;
  currentProject?: string;
  createdAt: string;
  updatedAt: string;
  extensionRequest?: ContractExtensionRequest;
}
