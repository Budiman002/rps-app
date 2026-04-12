export type UserRole = "Marketing" | "GM" | "PM" | "HR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ProjectStatus =
  | "Unassigned"
  | "Scheduled"
  | "InProgress"
  | "Complete";

export type Priority = "Low" | "Medium" | "High" | "Critical";

export type Seniority = "Intern" | "Junior" | "Senior";

export interface RoleComposition {
  Id?: string;
  RoleTitle: string;
  SeniorityLevel: Seniority;
  Quantity: number;
  EmploymentStatus: "Dedicated" | "Parallel";
}

export interface ProjectMember {
  Id: string;
  EmployeeId: string;
  FullName: string;
  Email: string;
  JobTitle: string;
  SeniorityLevel: Seniority;
  RoleCompositionId: string;
  RoleTitle: string;
}

export interface ChangeRequest {
  Id: string;
  ChangeTitle: string;
  ChangeDescription: string;
  RequestType: string;
  Status: string;
  CreatedAt: string;
  NewStartDate?: string;
  NewEndDate?: string;
  NewDurationWeeks?: number;
  RoleChangesJson?: string;
  MemberChangesJson?: string;
}

export interface Project {
  Id: string;
  Name: string;
  ClientName: string;
  Description: string;
  ExpectedStartDate: string;
  DurationWeeks: number;
  EstimatedEndDate: string;
  ActualStartDate?: string;
  EndDate?: string;
  Priority: Priority;
  Status: ProjectStatus;
  NotesFromMarketing: string;
  PoDocument?: string;
  RoleCompositions: RoleComposition[];
  Members?: ProjectMember[];
  AssignedPmId?: string;
  CreatedAt: string;
  UpdatedAt: string;
  RequestChanges?: ChangeRequest[];
}

export interface ContractExtensionRequest {
  Id: string;
  EmployeeId: string;
  RequestedBy: string;
  RequestedDate: string;
  ProposedEndDate: string;
  Reason: string;
  Status: "pending" | "approved" | "rejected";
}

export interface Employee {
  Id: string;
  FullName: string;
  Email: string;
  JobTitle: string;
  SeniorityLevel: Seniority;
  YearsOfExperience: number;
  ContractType: "Permanent" | "Contract";
  ContractEndDate?: string;
  IsUnavailable: boolean;
  CurrentProject?: string;
  CreatedAt: string;
  UpdatedAt: string;
  ExtensionRequest?: ContractExtensionRequest;
}
export interface UpdateRoleCompositionItem {
  Id?: string;
  RoleTitle: string;
  SeniorityLevel: Seniority;
  EmploymentStatus: "Dedicated" | "Parallel";
  Quantity: number;
}

export interface UpdateProjectMemberItem {
  EmployeeId: string;
  RoleCompositionId: string;
}

export interface UpdateProjectRequest {
  NewStartDate?: string;
  NewEndDate?: string;
  NewDurationWeeks?: number;
  NewStatus?: ProjectStatus;
  AssignedPmId?: string;
  Roles: UpdateRoleCompositionItem[];
  Members: UpdateProjectMemberItem[];
}

export interface CreateExtendContractRequest {
  EmployeeId: string;
  RequestedBy?: string;
  RequestedEndDate: string;
  Reason: string;
}

export interface Notification {
  Id: string;
  Type: string;
  Title: string;
  Message: string;
  ReferenceId?: string;
  ReferenceType?: string;
  IsRead: boolean;
  CreatedAt: string;
}
