import { createContext, useContext, useState, ReactNode } from "react";
import type {
  ChangeRequest,
  ContractExtensionRequest,
  Employee,
  Priority,
  Project,
  Seniority,
  ProjectMember,
} from "@/types/domain";

export type {
  ChangeRequest,
  ContractExtensionRequest,
  Employee,
  Priority,
  Project,
  Seniority,
  ProjectMember,
} from "@/types/domain";

interface DataContextType {
  projects: Project[];
  employees: Employee[];
  addProject: (project: Omit<Project, "id" | "updatedAt" | "status">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  assignMembers: (projectId: string, members: ProjectMember[], pmId: string) => void;
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
    durationWeeks: 12,
    estimatedEndDate: "2026-07-08",
    actualStartDate: "2026-04-15",
    endDate: "2026-07-08",
    priority: "high",
    status: "scheduled",
    notesFromMarketing: "Client wants modern, minimalist design",
    roleCompositions: [
      { id: "RC001", roleTitle: "Project Manager", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC002", roleTitle: "UI/UX Designer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC003", roleTitle: "Frontend Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 2 },
      { id: "RC004", roleTitle: "Backend Developer", seniorityLevel: "junior", employmentStatus: "dedicated", quantity: 1 },
    ],
    members: [
      { id: "TM001", employeeId: "E001", fullName: "Sarah Johnson", email: "sarah.johnson@company.com", jobTitle: "Project Manager", seniorityLevel: "senior", roleCompositionId: "RC001", roleTitle: "Project Manager" },
      { id: "TM002", employeeId: "E002", fullName: "Michael Chen", email: "michael.chen@company.com", jobTitle: "UI/UX Designer", seniorityLevel: "senior", roleCompositionId: "RC002", roleTitle: "UI/UX Designer" },
      { id: "TM003", employeeId: "E003", fullName: "Emily Rodriguez", email: "emily.rodriguez@company.com", jobTitle: "Frontend Developer", seniorityLevel: "senior", roleCompositionId: "RC003", roleTitle: "Frontend Developer" },
      { id: "TM004", employeeId: "E004", fullName: "David Kim", email: "david.kim@company.com", jobTitle: "Frontend Developer", seniorityLevel: "senior", roleCompositionId: "RC003", roleTitle: "Frontend Developer" },
      { id: "TM005", employeeId: "E005", fullName: "Jessica Martinez", email: "jessica.martinez@company.com", jobTitle: "Backend Developer", seniorityLevel: "junior", roleCompositionId: "RC004", roleTitle: "Backend Developer" },
    ],
    assignedPmId: "E001",
    createdAt: "2026-04-01",
    updatedAt: "2026-04-02",
  },
  {
    id: "P002",
    name: "Mobile App Development",
    clientName: "FinanceHub",
    description: "Native mobile application for financial management",
    expectedStartDate: "2026-05-01",
    durationWeeks: 16,
    estimatedEndDate: "2026-08-20",
    actualStartDate: "2026-05-01",
    endDate: "2026-08-20",
    priority: "critical",
    status: "scheduled",
    notesFromMarketing: "iOS and Android platforms required",
    roleCompositions: [
      { id: "RC005", roleTitle: "Project Manager", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC006", roleTitle: "UI/UX Designer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC007", roleTitle: "Mobile Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 2 },
      { id: "RC008", roleTitle: "Backend Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC009", roleTitle: "QA Engineer", seniorityLevel: "junior", employmentStatus: "parallel", quantity: 1 },
    ],
    members: [
      { id: "TM006", employeeId: "E006", fullName: "Robert Taylor", email: "robert.taylor@company.com", jobTitle: "Project Manager", seniorityLevel: "senior", roleCompositionId: "RC005", roleTitle: "Project Manager" },
      { id: "TM007", employeeId: "E007", fullName: "Amanda Lee", email: "amanda.lee@company.com", jobTitle: "UI/UX Designer", seniorityLevel: "senior", roleCompositionId: "RC006", roleTitle: "UI/UX Designer" },
      { id: "TM008", employeeId: "E008", fullName: "Christopher Brown", email: "christopher.brown@company.com", jobTitle: "Mobile Developer", seniorityLevel: "senior", roleCompositionId: "RC007", roleTitle: "Mobile Developer" },
      { id: "TM009", employeeId: "E009", fullName: "Jennifer Wilson", email: "jennifer.wilson@company.com", jobTitle: "Mobile Developer", seniorityLevel: "senior", roleCompositionId: "RC007", roleTitle: "Mobile Developer" },
      { id: "TM010", employeeId: "E010", fullName: "Daniel Garcia", email: "daniel.garcia@company.com", jobTitle: "Backend Developer", seniorityLevel: "senior", roleCompositionId: "RC008", roleTitle: "Backend Developer" },
      { id: "TM011", employeeId: "E011", fullName: "Lisa Anderson", email: "lisa.anderson@company.com", jobTitle: "QA Engineer", seniorityLevel: "junior", roleCompositionId: "RC009", roleTitle: "QA Engineer" },
    ],
    assignedPmId: "E006",
    createdAt: "2026-04-01",
    updatedAt: "2026-04-01",
  },
  {
    id: "P003",
    name: "E-commerce Platform",
    clientName: "RetailMax",
    description: "Full-featured e-commerce platform with inventory management",
    expectedStartDate: "2026-04-20",
    durationWeeks: 8,
    estimatedEndDate: "2026-06-15",
    actualStartDate: "2026-04-20",
    endDate: "2026-06-15",
    priority: "medium",
    status: "scheduled",
    notesFromMarketing: "Integration with existing ERP system required",
    roleCompositions: [
      { id: "RC010", roleTitle: "Project Manager", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC011", roleTitle: "UI/UX Designer", seniorityLevel: "junior", employmentStatus: "parallel", quantity: 1 },
      { id: "RC012", roleTitle: "Frontend Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC013", roleTitle: "Backend Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 2 },
      { id: "RC014", roleTitle: "QA Engineer", seniorityLevel: "junior", employmentStatus: "parallel", quantity: 1 },
    ],
    members: [
      { id: "TM017", employeeId: "E019", fullName: "Jordan Smith", email: "jordan.smith@company.com", jobTitle: "Project Manager", seniorityLevel: "senior", roleCompositionId: "RC010", roleTitle: "Project Manager" },
      { id: "TM018", employeeId: "E002", fullName: "Michael Chen", email: "michael.chen@company.com", jobTitle: "UI/UX Designer", seniorityLevel: "junior", roleCompositionId: "RC011", roleTitle: "UI/UX Designer" },
      { id: "TM019", employeeId: "E003", fullName: "Emily Rodriguez", email: "emily.rodriguez@company.com", jobTitle: "Frontend Developer", seniorityLevel: "senior", roleCompositionId: "RC012", roleTitle: "Frontend Developer" },
      { id: "TM020", employeeId: "E005", fullName: "Jessica Martinez", email: "jessica.martinez@company.com", jobTitle: "Backend Developer", seniorityLevel: "senior", roleCompositionId: "RC013", roleTitle: "Backend Developer" },
      { id: "TM021", employeeId: "E017", fullName: "Sandra Moore", email: "sandra.moore@company.com", jobTitle: "Backend Developer", seniorityLevel: "senior", roleCompositionId: "RC013", roleTitle: "Backend Developer" },
      { id: "TM022", employeeId: "E018", fullName: "Kevin Johnson", email: "kevin.johnson@company.com", jobTitle: "QA Engineer", seniorityLevel: "junior", roleCompositionId: "RC014", roleTitle: "QA Engineer" },
    ],
    assignedPmId: "E019",
    createdAt: "2026-04-01",
    updatedAt: "2026-04-02",
  },
  {
    id: "P004",
    name: "Data Analytics Dashboard",
    clientName: "DataInsights Co.",
    description: "Real-time analytics dashboard with data visualization",
    expectedStartDate: "2026-06-01",
    durationWeeks: 10,
    estimatedEndDate: "2026-08-10",
    actualStartDate: "2026-06-01",
    endDate: "2026-08-10",
    priority: "high",
    status: "scheduled",
    notesFromMarketing: "Big data processing capabilities needed",
    roleCompositions: [
      { id: "RC015", roleTitle: "Project Manager", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC016", roleTitle: "Data Engineer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 2 },
      { id: "RC017", roleTitle: "Frontend Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC018", roleTitle: "Backend Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
    ],
    members: [
      { id: "TM012", employeeId: "E001", fullName: "Sarah Johnson", email: "sarah.johnson@company.com", jobTitle: "Project Manager", seniorityLevel: "senior", roleCompositionId: "RC015", roleTitle: "Project Manager" },
      { id: "TM013", employeeId: "E012", fullName: "James Thompson", email: "james.thompson@company.com", jobTitle: "Data Engineer", seniorityLevel: "senior", roleCompositionId: "RC016", roleTitle: "Data Engineer" },
      { id: "TM014", employeeId: "E013", fullName: "Karen White", email: "karen.white@company.com", jobTitle: "Data Engineer", seniorityLevel: "senior", roleCompositionId: "RC016", roleTitle: "Data Engineer" },
      { id: "TM015", employeeId: "E014", fullName: "Thomas Miller", email: "thomas.miller@company.com", jobTitle: "Frontend Developer", seniorityLevel: "senior", roleCompositionId: "RC017", roleTitle: "Frontend Developer" },
      { id: "TM016", employeeId: "E015", fullName: "Nancy Davis", email: "nancy.davis@company.com", jobTitle: "Backend Developer", seniorityLevel: "senior", roleCompositionId: "RC018", roleTitle: "Backend Developer" },
    ],
    assignedPmId: "E001",
    createdAt: "2026-03-30",
    updatedAt: "2026-03-30",
  },
  {
    id: "P005",
    name: "CRM System",
    clientName: "SalesPro Ltd.",
    description: "Customer relationship management system with automation",
    expectedStartDate: "2026-05-15",
    durationWeeks: 6,
    estimatedEndDate: "2026-06-26",
    priority: "low",
    status: "unassigned",
    notesFromMarketing: "Email integration and reporting features",
    roleCompositions: [
      { id: "RC019", roleTitle: "Project Manager", seniorityLevel: "junior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC020", roleTitle: "Frontend Developer", seniorityLevel: "senior", employmentStatus: "parallel", quantity: 1 },
      { id: "RC021", roleTitle: "Backend Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC022", roleTitle: "QA Engineer", seniorityLevel: "junior", employmentStatus: "parallel", quantity: 1 },
    ],
    members: [],
    createdAt: "2026-04-01",
    updatedAt: "2026-04-01",
  },
  {
    id: "P006",
    name: "Marketing Portal",
    clientName: "BrandCo",
    description: "Internal marketing resource management portal",
    expectedStartDate: "2026-03-15",
    estimatedEndDate: "2026-05-10",
    actualStartDate: "2026-03-15",
    endDate: "2026-05-10",
    durationWeeks: 8,
    priority: "medium",
    status: "in-progress",
    notesFromMarketing: "Integration with existing CMS required",
    roleCompositions: [
      { id: "RC023", roleTitle: "Project Manager", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC024", roleTitle: "Frontend Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 2 },
      { id: "RC025", roleTitle: "Backend Developer", seniorityLevel: "junior", employmentStatus: "parallel", quantity: 1 },
    ],
    members: [
      { id: "TM023", employeeId: "E006", fullName: "Robert Taylor", email: "robert.taylor@company.com", jobTitle: "Project Manager", seniorityLevel: "senior", roleCompositionId: "RC023", roleTitle: "Project Manager" },
      { id: "TM024", employeeId: "E014", fullName: "Thomas Miller", email: "thomas.miller@company.com", jobTitle: "Frontend Developer", seniorityLevel: "senior", roleCompositionId: "RC024", roleTitle: "Frontend Developer" },
      { id: "TM025", employeeId: "E016", fullName: "Paul Martinez", email: "paul.martinez@company.com", jobTitle: "Frontend Developer", seniorityLevel: "junior", roleCompositionId: "RC024", roleTitle: "Frontend Developer" },
      { id: "TM026", employeeId: "E017", fullName: "Sandra Moore", email: "sandra.moore@company.com", jobTitle: "Backend Developer", seniorityLevel: "junior", roleCompositionId: "RC025", roleTitle: "Backend Developer" },
    ],
    assignedPmId: "E006",
    createdAt: "2026-04-01",
    updatedAt: "2026-04-05",
  },
  {
    id: "P007",
    name: "HR Management System",
    clientName: "HR Solutions Inc.",
    description: "Comprehensive HR management system with employee records and payroll integration",
    expectedStartDate: "2026-01-10",
    estimatedEndDate: "2026-03-21",
    actualStartDate: "2026-01-10",
    endDate: "2026-03-21",
    durationWeeks: 10,
    priority: "high",
    status: "completed",
    notesFromMarketing: "Successfully delivered ahead of schedule",
    roleCompositions: [
      { id: "RC026", roleTitle: "Project Manager", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC027", roleTitle: "UI/UX Designer", seniorityLevel: "senior", employmentStatus: "parallel", quantity: 1 },
      { id: "RC028", roleTitle: "Frontend Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 1 },
      { id: "RC029", roleTitle: "Backend Developer", seniorityLevel: "senior", employmentStatus: "dedicated", quantity: 2 },
      { id: "RC030", roleTitle: "QA Engineer", seniorityLevel: "senior", employmentStatus: "parallel", quantity: 1 },
    ],
    members: [
      { id: "TM027", employeeId: "E019", fullName: "Jordan Smith", email: "jordan.smith@company.com", jobTitle: "Project Manager", seniorityLevel: "senior", roleCompositionId: "RC026", roleTitle: "Project Manager" },
      { id: "TM028", employeeId: "E007", fullName: "Amanda Lee", email: "amanda.lee@company.com", jobTitle: "UI/UX Designer", seniorityLevel: "senior", roleCompositionId: "RC027", roleTitle: "UI/UX Designer" },
      { id: "TM029", employeeId: "E003", fullName: "Emily Rodriguez", email: "emily.rodriguez@company.com", jobTitle: "Frontend Developer", seniorityLevel: "senior", roleCompositionId: "RC028", roleTitle: "Frontend Developer" },
      { id: "TM030", employeeId: "E010", fullName: "Daniel Garcia", email: "daniel.garcia@company.com", jobTitle: "Backend Developer", seniorityLevel: "senior", roleCompositionId: "RC029", roleTitle: "Backend Developer" },
      { id: "TM031", employeeId: "E015", fullName: "Nancy Davis", email: "nancy.davis@company.com", jobTitle: "Backend Developer", seniorityLevel: "senior", roleCompositionId: "RC029", roleTitle: "Backend Developer" },
      { id: "TM032", employeeId: "E011", fullName: "Lisa Anderson", email: "lisa.anderson@company.com", jobTitle: "QA Engineer", seniorityLevel: "junior", roleCompositionId: "RC030", roleTitle: "QA Engineer" },
    ],
    assignedPmId: "E019",
    createdAt: "2026-01-10",
    updatedAt: "2026-03-21",
  },
];

const mockEmployees: Employee[] = [
  {
    id: "E001",
    fullName: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    jobTitle: "Project Manager",
    seniorityLevel: "senior",
    yearsOfExperience: 12,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Website Redesign",
    createdAt: "2020-01-10",
    updatedAt: "2020-01-10",
  },
  {
    id: "E002",
    fullName: "Michael Chen",
    email: "michael.chen@company.com",
    jobTitle: "UI/UX Designer",
    seniorityLevel: "senior",
    yearsOfExperience: 10,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Website Redesign",
    createdAt: "2019-03-15",
    updatedAt: "2019-03-15",
  },
  {
    id: "E003",
    fullName: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    jobTitle: "Frontend Developer",
    seniorityLevel: "senior",
    yearsOfExperience: 8,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Website Redesign",
    createdAt: "2021-06-01",
    updatedAt: "2021-06-01",
  },
  {
    id: "E004",
    fullName: "David Kim",
    email: "david.kim@company.com",
    jobTitle: "Frontend Developer",
    seniorityLevel: "senior",
    yearsOfExperience: 7,
    contractType: "contract",
    contractEndDate: "2026-06-30",
    isDedicated: false,
    currentProject: "Website Redesign",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-15",
  },
  {
    id: "E005",
    fullName: "Jessica Martinez",
    email: "jessica.martinez@company.com",
    jobTitle: "Backend Developer",
    seniorityLevel: "junior",
    yearsOfExperience: 3,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Website Redesign",
    createdAt: "2023-09-01",
    updatedAt: "2023-09-01",
  },
  {
    id: "E006",
    fullName: "Robert Taylor",
    email: "robert.taylor@company.com",
    jobTitle: "Project Manager",
    seniorityLevel: "senior",
    yearsOfExperience: 15,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Mobile App Development",
    createdAt: "2018-04-20",
    updatedAt: "2018-04-20",
  },
  {
    id: "E007",
    fullName: "Amanda Lee",
    email: "amanda.lee@company.com",
    jobTitle: "UI/UX Designer",
    seniorityLevel: "senior",
    yearsOfExperience: 9,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Mobile App Development",
    createdAt: "2020-11-01",
    updatedAt: "2020-11-01",
  },
  {
    id: "E008",
    fullName: "Christopher Brown",
    email: "christopher.brown@company.com",
    jobTitle: "Mobile Developer",
    seniorityLevel: "senior",
    yearsOfExperience: 11,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Mobile App Development",
    createdAt: "2019-08-15",
    updatedAt: "2019-08-15",
  },
  {
    id: "E009",
    fullName: "Jennifer Wilson",
    email: "jennifer.wilson@company.com",
    jobTitle: "Mobile Developer",
    seniorityLevel: "senior",
    yearsOfExperience: 6,
    contractType: "contract",
    contractEndDate: "2026-08-31",
    isDedicated: false,
    currentProject: "Mobile App Development",
    createdAt: "2025-03-01",
    updatedAt: "2025-03-01",
  },
  {
    id: "E010",
    fullName: "Daniel Garcia",
    email: "daniel.garcia@company.com",
    jobTitle: "Backend Developer",
    seniorityLevel: "senior",
    yearsOfExperience: 10,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Mobile App Development",
    createdAt: "2020-02-10",
    updatedAt: "2020-02-10",
  },
  {
    id: "E011",
    fullName: "Lisa Anderson",
    email: "lisa.anderson@company.com",
    jobTitle: "QA Engineer",
    seniorityLevel: "junior",
    yearsOfExperience: 2,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Mobile App Development",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-08",
  },
  {
    id: "E012",
    fullName: "James Thompson",
    email: "james.thompson@company.com",
    jobTitle: "Data Engineer",
    seniorityLevel: "senior",
    yearsOfExperience: 11,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Data Analytics Dashboard",
    createdAt: "2019-05-20",
    updatedAt: "2019-05-20",
  },
  {
    id: "E013",
    fullName: "Karen White",
    email: "karen.white@company.com",
    jobTitle: "Data Engineer",
    seniorityLevel: "senior",
    yearsOfExperience: 9,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Data Analytics Dashboard",
    createdAt: "2021-03-15",
    updatedAt: "2021-03-15",
  },
  {
    id: "E014",
    fullName: "Thomas Miller",
    email: "thomas.miller@company.com",
    jobTitle: "Frontend Developer",
    seniorityLevel: "senior",
    yearsOfExperience: 8,
    contractType: "permanent",
    isDedicated: false,
    currentProject: "Data Analytics Dashboard",
    createdAt: "2022-07-01",
    updatedAt: "2022-07-01",
  },
  {
    id: "E015",
    fullName: "Nancy Davis",
    email: "nancy.davis@company.com",
    jobTitle: "Backend Developer",
    seniorityLevel: "senior",
    yearsOfExperience: 10,
    contractType: "contract",
    contractEndDate: "2026-12-31",
    isDedicated: false,
    currentProject: "Data Analytics Dashboard",
    createdAt: "2025-06-01",
    updatedAt: "2025-06-01",
  },
  {
    id: "E016",
    fullName: "Paul Martinez",
    email: "paul.martinez@company.com",
    jobTitle: "Frontend Developer",
    seniorityLevel: "junior",
    yearsOfExperience: 3,
    contractType: "permanent",
    isDedicated: false,
    createdAt: "2023-11-01",
    updatedAt: "2023-11-01",
  },
  {
    id: "E017",
    fullName: "Sandra Moore",
    email: "sandra.moore@company.com",
    jobTitle: "Backend Developer",
    seniorityLevel: "junior",
    yearsOfExperience: 2,
    contractType: "permanent",
    isDedicated: false,
    createdAt: "2024-02-15",
    updatedAt: "2024-02-15",
  },
  {
    id: "E018",
    fullName: "Kevin Johnson",
    email: "kevin.johnson@company.com",
    jobTitle: "QA Engineer",
    seniorityLevel: "junior",
    yearsOfExperience: 1,
    contractType: "permanent",
    isDedicated: false,
    createdAt: "2025-01-10",
    updatedAt: "2025-01-10",
  },
  {
    id: "E019",
    fullName: "Jordan Smith",
    email: "jordan.smith@company.com",
    jobTitle: "Project Manager",
    seniorityLevel: "senior",
    yearsOfExperience: 14,
    contractType: "permanent",
    isDedicated: true,
    currentProject: "Client Onboarding System",
    createdAt: "2017-09-01",
    updatedAt: "2017-09-01",
  },
  {
    id: "E020",
    fullName: "Alex Thompson",
    email: "alex.thompson@company.com",
    jobTitle: "Project Manager",
    seniorityLevel: "junior",
    yearsOfExperience: 4,
    contractType: "permanent",
    isDedicated: false,
    createdAt: "2024-02-15",
    updatedAt: "2024-02-15",
  },
  {
    id: "E021",
    fullName: "Jordan Lee",
    email: "jordan.lee@company.com",
    jobTitle: "Project Manager",
    seniorityLevel: "junior",
    yearsOfExperience: 1,
    contractType: "permanent",
    isDedicated: false,
    createdAt: "2025-01-10",
    updatedAt: "2025-01-10",
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);

  const addProject = (project: Omit<Project, "id" | "updatedAt" | "status">) => {
    const newProject: Project = {
      ...project,
      id: `P${String(projects.length + 1).padStart(3, "0")}`,
      status: "unassigned",
      updatedAt: new Date().toISOString().substring(0, 10),
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        const updatedProject: Project = { 
          ...p, 
          ...updates, 
          updatedAt: new Date().toISOString().substring(0, 10)
        };
        return updatedProject;
      }
      return p;
    }));
  };

  const assignMembers = (projectId: string, members: ProjectMember[], pmId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const today = new Date().toISOString().substring(0, 10);
        const startDate = p.actualStartDate || p.expectedStartDate;
        const status = startDate > today ? "scheduled" : "in-progress";

        const updatedProject: Project = {
          ...p,
          members: members,
          assignedPmId: pmId,
          status,
          updatedAt: today
        };
        return updatedProject;
      }
      return p;
    }));
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(employees.map(e => {
      if (e.id === id) {
        const updatedEmployee: Employee = {
          ...e,
          ...updates,
          updatedAt: new Date().toISOString().substring(0, 10)
        };
        return updatedEmployee;
      }
      return e;
    }));
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
          createdAt: new Date().toISOString().substring(0, 10),
        };
        const updatedProject: Project = {
          ...p,
          requestChanges: [...(p.requestChanges || []), newRequest],
          updatedAt: new Date().toISOString().substring(0, 10),
        };
        return updatedProject;
      }
      return p;
    }));
  };

  const addDetailedRequestChange = (projectId: string, changeRequest: ChangeRequest) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const updatedProject: Project = {
          ...p,
          requestChanges: [...(p.requestChanges || []), changeRequest],
          updatedAt: new Date().toISOString().substring(0, 10),
        };
        return updatedProject;
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
        const updatedProject: Project = {
          ...p,
          requestChanges: updatedRequests,
          updatedAt: new Date().toISOString().substring(0, 10),
        };
        return updatedProject;
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
        const updatedProject: Project = {
          ...p,
          requestChanges: updatedRequests,
          updatedAt: new Date().toISOString().substring(0, 10),
        };
        return updatedProject;
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
          requestedDate: new Date().toISOString().substring(0, 10),
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

