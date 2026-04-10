import { createContext, useContext, useState, ReactNode } from "react";
import type {
  ChangeRequest,
  ContractExtensionRequest,
  Employee,
  Priority,
  Project,
  Seniority,
  TeamMember,
} from "@/types/domain";

export type {
  ChangeRequest,
  ContractExtensionRequest,
  Employee,
  Priority,
  Project,
  Seniority,
  TeamMember,
} from "@/types/domain";

interface DataContextType {
  projects: Project[];
  employees: Employee[];
  addProject: (project: Omit<Project, "id" | "lastUpdated" | "status">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  assignMembers: (projectId: string, members: TeamMember[], pmId: string) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  addRequestChange: (projectId: string, title: string, description: string) => void;
  addDetailedRequestChange: (projectId: string, changeRequest: ChangeRequest) => void;
  approveChangeRequest: (projectId: string, requestId: string) => void;
  rejectChangeRequest: (projectId: string, requestId: string) => void;
  requestContractExtension: (employeeId: string, proposedEndDate: string, reason: string, requestedBy: string) => void;
  approveContractExtension: (employeeId: string) => void;
  rejectContractExtension: (employeeId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const mockProjects: Project[] = [
  {
    id: "P001",
    name: "Website Redesign",
    clientName: "TechCorp Inc.",
    description: "Complete redesign of corporate website with modern UI/UX",
    expectedStartDate: "2026-04-15",
    duration: 12,
    estimatedEndDate: "2026-07-08",
    startDate: "2026-04-15",
    endDate: "2026-07-08",
    priority: "high",
    status: "scheduled",
    notes: "Client wants modern, minimalist design",
    teamComposition: [
      { role: "Project Manager", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "UI/UX Designer", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "Frontend Developer", seniority: "senior", allocationType: "dedicated", count: 2 },
      { role: "Backend Developer", seniority: "junior", allocationType: "dedicated", count: 1 },
    ],
    assignedMembers: [
      { id: "TM001", employeeId: "E001", role: "Project Manager", seniority: "senior" },
      { id: "TM002", employeeId: "E002", role: "UI/UX Designer", seniority: "senior" },
      { id: "TM003", employeeId: "E003", role: "Frontend Developer", seniority: "senior" },
      { id: "TM004", employeeId: "E004", role: "Frontend Developer", seniority: "senior" },
      { id: "TM005", employeeId: "E005", role: "Backend Developer", seniority: "junior" },
    ],
    pmId: "E001",
    lastUpdated: "2026-04-02",
  },
  {
    id: "P002",
    name: "Mobile App Development",
    clientName: "FinanceHub",
    description: "Native mobile application for financial management",
    expectedStartDate: "2026-05-01",
    duration: 16,
    estimatedEndDate: "2026-08-20",
    startDate: "2026-05-01",
    endDate: "2026-08-20",
    priority: "critical",
    status: "scheduled",
    notes: "iOS and Android platforms required",
    teamComposition: [
      { role: "Project Manager", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "UI/UX Designer", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "Mobile Developer", seniority: "senior", allocationType: "dedicated", count: 2 },
      { role: "Backend Developer", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "QA Engineer", seniority: "junior", allocationType: "parallel", count: 1 },
    ],
    assignedMembers: [
      { id: "TM006", employeeId: "E006", role: "Project Manager", seniority: "senior" },
      { id: "TM007", employeeId: "E007", role: "UI/UX Designer", seniority: "senior" },
      { id: "TM008", employeeId: "E008", role: "Mobile Developer", seniority: "senior" },
      { id: "TM009", employeeId: "E009", role: "Mobile Developer", seniority: "senior" },
      { id: "TM010", employeeId: "E010", role: "Backend Developer", seniority: "senior" },
      { id: "TM011", employeeId: "E011", role: "QA Engineer", seniority: "junior" },
    ],
    pmId: "E006",
    lastUpdated: "2026-04-01",
  },
  {
    id: "P003",
    name: "E-commerce Platform",
    clientName: "RetailMax",
    description: "Full-featured e-commerce platform with inventory management",
    expectedStartDate: "2026-04-20",
    duration: 8,
    estimatedEndDate: "2026-06-15",
    startDate: "2026-04-20",
    endDate: "2026-06-15",
    priority: "medium",
    status: "scheduled",
    notes: "Integration with existing ERP system required",
    teamComposition: [
      { role: "Project Manager", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "UI/UX Designer", seniority: "junior", allocationType: "parallel", count: 1 },
      { role: "Frontend Developer", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "Backend Developer", seniority: "senior", allocationType: "dedicated", count: 2 },
      { role: "QA Engineer", seniority: "junior", allocationType: "parallel", count: 1 },
    ],
    assignedMembers: [
      { id: "TM017", employeeId: "E019", role: "Project Manager", seniority: "senior" },
      { id: "TM018", employeeId: "E002", role: "UI/UX Designer", seniority: "junior" },
      { id: "TM019", employeeId: "E003", role: "Frontend Developer", seniority: "senior" },
      { id: "TM020", employeeId: "E005", role: "Backend Developer", seniority: "senior" },
      { id: "TM021", employeeId: "E017", role: "Backend Developer", seniority: "senior" },
      { id: "TM022", employeeId: "E018", role: "QA Engineer", seniority: "junior" },
    ],
    pmId: "E019",
    lastUpdated: "2026-04-02",
  },
  {
    id: "P004",
    name: "Data Analytics Dashboard",
    clientName: "DataInsights Co.",
    description: "Real-time analytics dashboard with data visualization",
    expectedStartDate: "2026-06-01",
    duration: 10,
    estimatedEndDate: "2026-08-10",
    startDate: "2026-06-01",
    endDate: "2026-08-10",
    priority: "high",
    status: "scheduled",
    notes: "Big data processing capabilities needed",
    teamComposition: [
      { role: "Project Manager", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "Data Engineer", seniority: "senior", allocationType: "dedicated", count: 2 },
      { role: "Frontend Developer", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "Backend Developer", seniority: "senior", allocationType: "dedicated", count: 1 },
    ],
    assignedMembers: [
      { id: "TM012", employeeId: "E001", role: "Project Manager", seniority: "senior" },
      { id: "TM013", employeeId: "E012", role: "Data Engineer", seniority: "senior" },
      { id: "TM014", employeeId: "E013", role: "Data Engineer", seniority: "senior" },
      { id: "TM015", employeeId: "E014", role: "Frontend Developer", seniority: "senior" },
      { id: "TM016", employeeId: "E015", role: "Backend Developer", seniority: "senior" },
    ],
    pmId: "E001",
    lastUpdated: "2026-03-30",
  },
  {
    id: "P005",
    name: "CRM System",
    clientName: "SalesPro Ltd.",
    description: "Customer relationship management system with automation",
    expectedStartDate: "2026-05-15",
    duration: 6,
    estimatedEndDate: "2026-06-26",
    priority: "low",
    status: "unassigned",
    notes: "Email integration and reporting features",
    teamComposition: [
      { role: "Project Manager", seniority: "junior", allocationType: "dedicated", count: 1 },
      { role: "Frontend Developer", seniority: "senior", allocationType: "parallel", count: 1 },
      { role: "Backend Developer", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "QA Engineer", seniority: "junior", allocationType: "parallel", count: 1 },
    ],
    lastUpdated: "2026-04-01",
  },
  {
    id: "P006",
    name: "Marketing Portal",
    clientName: "BrandCo",
    description: "Internal marketing resource management portal",
    expectedStartDate: "2026-03-15",
    duration: 8,
    estimatedEndDate: "2026-05-10",
    startDate: "2026-03-15",
    endDate: "2026-05-10",
    priority: "medium",
    status: "in-progress",
    notes: "Integration with existing CMS required",
    teamComposition: [
      { role: "Project Manager", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "Frontend Developer", seniority: "senior", allocationType: "dedicated", count: 2 },
      { role: "Backend Developer", seniority: "junior", allocationType: "parallel", count: 1 },
    ],
    assignedMembers: [
      { id: "TM023", employeeId: "E006", role: "Project Manager", seniority: "senior" },
      { id: "TM024", employeeId: "E014", role: "Frontend Developer", seniority: "senior" },
      { id: "TM025", employeeId: "E016", role: "Frontend Developer", seniority: "junior" },
      { id: "TM026", employeeId: "E017", role: "Backend Developer", seniority: "junior" },
    ],
    pmId: "E006",
    lastUpdated: "2026-04-05",
  },
  {
    id: "P007",
    name: "Client Onboarding System",
    clientName: "ServiceNow Inc.",
    description: "Automated client onboarding and document management system",
    expectedStartDate: "2026-01-10",
    duration: 10,
    estimatedEndDate: "2026-03-21",
    startDate: "2026-01-10",
    endDate: "2026-03-21",
    priority: "high",
    status: "completed",
    notes: "Successfully delivered ahead of schedule",
    teamComposition: [
      { role: "Project Manager", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "UI/UX Designer", seniority: "senior", allocationType: "parallel", count: 1 },
      { role: "Frontend Developer", seniority: "senior", allocationType: "dedicated", count: 1 },
      { role: "Backend Developer", seniority: "senior", allocationType: "dedicated", count: 2 },
      { role: "QA Engineer", seniority: "senior", allocationType: "parallel", count: 1 },
    ],
    assignedMembers: [
      { id: "TM027", employeeId: "E019", role: "Project Manager", seniority: "senior" },
      { id: "TM028", employeeId: "E007", role: "UI/UX Designer", seniority: "senior" },
      { id: "TM029", employeeId: "E003", role: "Frontend Developer", seniority: "senior" },
      { id: "TM030", employeeId: "E010", role: "Backend Developer", seniority: "senior" },
      { id: "TM031", employeeId: "E015", role: "Backend Developer", seniority: "senior" },
      { id: "TM032", employeeId: "E011", role: "QA Engineer", seniority: "junior" },
    ],
    pmId: "E019",
    lastUpdated: "2026-03-21",
  },
];

const mockEmployees: Employee[] = [
  {
    id: "E001",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    dob: "1988-05-15",
    role: "Project Manager",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2020-01-10",
    isDedicated: true,
    currentProject: "Website Redesign",
  },
  {
    id: "E002",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    dob: "1990-08-22",
    role: "UI/UX Designer",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2019-03-15",
    isDedicated: true,
    currentProject: "Website Redesign",
  },
  {
    id: "E003",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    dob: "1992-11-30",
    role: "Frontend Developer",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2021-06-01",
    isDedicated: true,
    currentProject: "Website Redesign",
  },
  {
    id: "E004",
    name: "David Kim",
    email: "david.kim@company.com",
    dob: "1991-03-18",
    role: "Frontend Developer",
    seniority: "senior",
    contractType: "contract",
    contractStartDate: "2025-01-15",
    contractEndDate: "2026-06-30",
    isDedicated: false,
    currentProject: "Website Redesign",
  },
  {
    id: "E005",
    name: "Jessica Martinez",
    email: "jessica.martinez@company.com",
    dob: "1995-07-09",
    role: "Backend Developer",
    seniority: "junior",
    contractType: "permanent",
    contractStartDate: "2023-09-01",
    isDedicated: true,
    currentProject: "Website Redesign",
  },
  {
    id: "E006",
    name: "Robert Taylor",
    email: "robert.taylor@company.com",
    dob: "1987-12-05",
    role: "Project Manager",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2018-04-20",
    isDedicated: true,
    currentProject: "Mobile App Development",
  },
  {
    id: "E007",
    name: "Amanda Lee",
    email: "amanda.lee@company.com",
    dob: "1993-09-14",
    role: "UI/UX Designer",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2020-11-01",
    isDedicated: true,
    currentProject: "Mobile App Development",
  },
  {
    id: "E008",
    name: "Christopher Brown",
    email: "christopher.brown@company.com",
    dob: "1989-06-25",
    role: "Mobile Developer",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2019-08-15",
    isDedicated: true,
    currentProject: "Mobile App Development",
  },
  {
    id: "E009",
    name: "Jennifer Wilson",
    email: "jennifer.wilson@company.com",
    dob: "1994-02-11",
    role: "Mobile Developer",
    seniority: "senior",
    contractType: "contract",
    contractStartDate: "2025-03-01",
    contractEndDate: "2026-08-31",
    isDedicated: false,
    currentProject: "Mobile App Development",
  },
  {
    id: "E010",
    name: "Daniel Garcia",
    email: "daniel.garcia@company.com",
    dob: "1990-10-28",
    role: "Backend Developer",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2020-02-10",
    isDedicated: true,
    currentProject: "Mobile App Development",
  },
  {
    id: "E011",
    name: "Lisa Anderson",
    email: "lisa.anderson@company.com",
    dob: "1996-04-17",
    role: "QA Engineer",
    seniority: "junior",
    contractType: "permanent",
    contractStartDate: "2024-01-08",
    isDedicated: true,
    currentProject: "Mobile App Development",
  },
  {
    id: "E012",
    name: "James Thompson",
    email: "james.thompson@company.com",
    dob: "1988-11-03",
    role: "Data Engineer",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2019-05-20",
    isDedicated: true,
    currentProject: "Data Analytics Dashboard",
  },
  {
    id: "E013",
    name: "Karen White",
    email: "karen.white@company.com",
    dob: "1991-08-19",
    role: "Data Engineer",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2021-03-15",
    isDedicated: true,
    currentProject: "Data Analytics Dashboard",
  },
  {
    id: "E014",
    name: "Thomas Miller",
    email: "thomas.miller@company.com",
    dob: "1993-01-26",
    role: "Frontend Developer",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2022-07-01",
    isDedicated: false,
    currentProject: "Data Analytics Dashboard",
  },
  {
    id: "E015",
    name: "Nancy Davis",
    email: "nancy.davis@company.com",
    dob: "1992-05-08",
    role: "Backend Developer",
    seniority: "senior",
    contractType: "contract",
    contractStartDate: "2025-06-01",
    contractEndDate: "2026-12-31",
    isDedicated: false,
    currentProject: "Data Analytics Dashboard",
  },
  {
    id: "E016",
    name: "Paul Martinez",
    email: "paul.martinez@company.com",
    dob: "1994-09-21",
    role: "Frontend Developer",
    seniority: "junior",
    contractType: "permanent",
    contractStartDate: "2023-11-01",
    isDedicated: false,
  },
  {
    id: "E017",
    name: "Sandra Moore",
    email: "sandra.moore@company.com",
    dob: "1995-12-30",
    role: "Backend Developer",
    seniority: "junior",
    contractType: "permanent",
    contractStartDate: "2024-02-15",
    isDedicated: false,
  },
  {
    id: "E018",
    name: "Kevin Johnson",
    email: "kevin.johnson@company.com",
    dob: "1997-03-14",
    role: "QA Engineer",
    seniority: "junior",
    contractType: "permanent",
    contractStartDate: "2024-06-01",
    isDedicated: false,
  },
  {
    id: "E019",
    name: "Project Manager",
    email: "pm@rps.com",
    dob: "1986-04-10",
    role: "Project Manager",
    seniority: "senior",
    contractType: "permanent",
    contractStartDate: "2017-08-01",
    isDedicated: true,
    currentProject: "E-commerce Platform",
  },
  {
    id: "E020",
    name: "Alex Thompson",
    email: "alex.thompson@company.com",
    dob: "1996-03-22",
    role: "Project Manager",
    seniority: "junior",
    contractType: "permanent",
    contractStartDate: "2024-02-15",
    isDedicated: false,
  },
  {
    id: "E021",
    name: "Jordan Smith",
    email: "jordan.smith@company.com",
    dob: "1997-09-08",
    role: "Project Manager",
    seniority: "junior",
    contractType: "permanent",
    contractStartDate: "2025-01-10",
    isDedicated: false,
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);

  const addProject = (project: Omit<Project, "id" | "lastUpdated" | "status">) => {
    const newProject: Project = {
      ...project,
      id: `P${String(projects.length + 1).padStart(3, "0")}`,
      status: "unassigned",
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => 
      p.id === id 
        ? { ...p, ...updates, lastUpdated: new Date().toISOString().split("T")[0] }
        : p
    ));
  };

  const assignMembers = (projectId: string, members: TeamMember[], pmId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const today = new Date().toISOString().split("T")[0];
        const startDate = p.startDate || p.expectedStartDate;
        const status = startDate > today ? "scheduled" : "in-progress";

        return {
          ...p,
          assignedMembers: members,
          pmId,
          status,
          lastUpdated: today
        };
      }
      return p;
    }));
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const addRequestChange = (projectId: string, title: string, description: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const newRequest = {
          id: `REQ${Date.now()}`,
          title,
          description,
          type: "general" as const,
          status: "pending" as const,
          createdAt: new Date().toISOString().split("T")[0],
        };
        return {
          ...p,
          requestChanges: [...(p.requestChanges || []), newRequest],
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }
      return p;
    }));
  };

  const addDetailedRequestChange = (projectId: string, changeRequest: ChangeRequest) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          requestChanges: [...(p.requestChanges || []), changeRequest],
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }
      return p;
    }));
  };

  const approveChangeRequest = (projectId: string, requestId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updatedRequests = p.requestChanges?.map(req => 
          req.id === requestId ? { ...req, status: "approved" as const } : req
        );
        return {
          ...p,
          requestChanges: updatedRequests,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }
      return p;
    }));
  };

  const rejectChangeRequest = (projectId: string, requestId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updatedRequests = p.requestChanges?.map(req =>
          req.id === requestId ? { ...req, status: "rejected" as const } : req
        );
        return {
          ...p,
          requestChanges: updatedRequests,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }
      return p;
    }));
  };

  const requestContractExtension = (employeeId: string, proposedEndDate: string, reason: string, requestedBy: string) => {
    setEmployees(employees.map(e => {
      if (e.id === employeeId) {
        const newRequest: ContractExtensionRequest = {
          id: `EXT${Date.now()}`,
          employeeId,
          requestedBy,
          requestedDate: new Date().toISOString().split("T")[0],
          proposedEndDate,
          reason,
          status: "pending",
        };
        return { ...e, extensionRequest: newRequest };
      }
      return e;
    }));
  };

  const approveContractExtension = (employeeId: string) => {
    setEmployees(employees.map(e => {
      if (e.id === employeeId && e.extensionRequest) {
        return {
          ...e,
          contractEndDate: e.extensionRequest.proposedEndDate,
          extensionRequest: {
            ...e.extensionRequest,
            status: "approved",
          },
        };
      }
      return e;
    }));
  };

  const rejectContractExtension = (employeeId: string) => {
    setEmployees(employees.map(e => {
      if (e.id === employeeId && e.extensionRequest) {
        return {
          ...e,
          extensionRequest: {
            ...e.extensionRequest,
            status: "rejected",
          },
        };
      }
      return e;
    }));
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        employees,
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

