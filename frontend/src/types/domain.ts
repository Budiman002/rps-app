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

export interface TeamMember {
  id: string;
  employeeId: string;
  role: string;
  seniority: Seniority;
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
  Priority: string;
  Status: string;
  NotesFromMarketing: string;
  PoDocument?: string;
  RoleCompositions: Array<{
    Id?: string;
    RoleTitle: string;
    SeniorityLevel: string;
    EmploymentStatus: string;
    Quantity: number;
  }>;
  Members: Array<{
    Id: string;
    FullName: string;
    Email: string;
    JobTitle: string;
    SeniorityLevel: string;
    YearsOfExperience: number;
  }>;
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
  IsUnavailable: boolean;
  ContractType: "Permanent" | "Contract";
  ContractEndDate?: string;
  CreatedAt: string;
  UpdatedAt: string;
  ExtensionRequest?: ContractExtensionRequest;
}
