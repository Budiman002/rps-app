# Frontend Guidelines — Resource Planning System (RPS)

> Mengikuti prinsip Clean Architecture dan Separation of Concerns dengan React + TypeScript

## Project Overview

Frontend RPS adalah aplikasi React yang mengkonsumsi REST API backend untuk manajemen sumber daya manusia dan proyek. Antarmuka didesain dengan shadcn/ui component library untuk konsistensi visual.

### Roles & Permission

| Role      | Akses                                                                 |
| --------- | --------------------------------------------------------------------- |
| Marketing | Create project, Read all projects                                     |
| GM        | Read all projects, Assign team, Edit project, Request extend contract |
| PM        | Read assigned projects, Request change                                |
| HR        | Read all employees, Process extend contract                           |

### Key Features

- Employee Management (list, filter, contract extension)
- Project Management (create, assign, track status)
- Dashboard (statistics, pending items)
- Real-time notifications (Sonner toast)
- Role-based access control (JWT Bearer token)

---

## 1. Architecture & Stack

| Layer            | Technology            | Purpose                          |
| ---------------- | --------------------- | -------------------------------- |
| Framework        | React 18+             | UI library with hooks            |
| Language         | TypeScript            | Type safety across UI            |
| Build Tool       | Vite                  | Fast, modern bundler             |
| State Management | Context API + hooks   | Global state (auth, data)        |
| Styling          | Tailwind CSS + shadcn | Component styling and themes     |
| Component Lib    | shadcn/ui             | Pre-built, accessible components |
| HTTP Client      | Fetch API             | Backend API calls                |
| Toast Notify     | Sonner                | Non-intrusive notifications      |
| Data Formats     | TypeScript Interfaces | Strong typing for API responses  |

---

## 2. Project Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   └── [domain]/             # Feature-specific components
│   │       ├── employee-list.tsx
│   │       ├── employee-management.tsx
│   │       ├── project-card.tsx
│   │       └── ...
│   ├── pages/                   # Page-level components
│   │   ├── employee-management.tsx
│   │   ├── dashboard.tsx
│   │   ├── project-list.tsx
│   │   └── ...
│   ├── contexts/                # React Context for global state
│   │   ├── auth-context.tsx     # Auth state & login/logout
│   │   ├── data-context.tsx     # API calls & data fetching
│   │   └── ...
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useEmployee.ts
│   │   └── ...
│   ├── types/                   # TypeScript interfaces/types
│   │   ├── employee.ts
│   │   ├── project.ts
│   │   ├── api.ts
│   │   └── ...
│   ├── functions/               # Utility functions
│   │   ├── BackendApiUrl.ts     # API endpoint helpers
│   │   ├── auth-utils.ts
│   │   └── ...
│   ├── lib/                     # Library utilities (formatting, etc)
│   │   └── utils.ts
│   ├── store/                   # Global state (if using Zustand/Redux)
│   │   └── [store].ts
│   ├── styles/                  # Global CSS
│   │   └── globals.css
│   ├── constants/               # App-wide constants
│   │   └── index.ts
│   ├── routes.tsx               # Route definitions
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite types
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── frontend.md                  # Frontend guidelines (this file)
```

### Key Rules

- **Feature folders**: Components dan types WAJIB dikelompokkan per feature domain
- **One component per file**: Satu component per file (kecuali shadcn/ui)
- **Context for state**: Gunakan React Context untuk global state (auth, notifications)
- **Custom hooks**: Extract logic kompleks dari components ke custom hooks
- **Type everything**: Semua props, state, dan API responses HARUS di-type dengan TypeScript

---

## 3. Component Standards

### Functional Components with Hooks

```typescript
// src/components/employee/employee-card.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmployeeResponse } from '@/types/employee';

interface EmployeeCardProps {
  employee: EmployeeResponse;
  onExtend?: (employeeId: string) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onExtend
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExtend = async () => {
    setIsLoading(true);
    try {
      // Logic
      if (onExtend) onExtend(employee.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>{employee.fullName}</h3>
      <Button onClick={handleExtend} disabled={isLoading}>
        Extend Contract
      </Button>
    </div>
  );
};
```

### Rules

- Gunakan functional components dengan hooks, JANGAN class components
- Destructure props dalam parameter
- Export component sebagai named export
- Definisikan prop types sebagai interface di atas component
- Gunakan `React.FC<Props>` untuk type safety
- Collocate state yang terkait dalam satu component

---

## 4. State Management Pattern

### Context + Custom Hooks (Preferred)

```typescript
// src/contexts/data-context.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { EmployeeResponse } from '@/types/employee';

interface DataContextType {
  employees: EmployeeResponse[];
  isLoading: boolean;
  error: string | null;
  getEmployeeList: () => Promise<void>;
  getEmployeeExtensionHistory: (employeeId: string) => Promise<any[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = React.useState<EmployeeResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const getEmployeeList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(/* endpoint */);
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployeeExtensionHistory = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/.../${employeeId}`);
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  return (
    <DataContext.Provider value={{ employees, isLoading, error, getEmployeeList, getEmployeeExtensionHistory }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
```

### Custom Hook Usage

```typescript
// src/hooks/useEmployee.ts
import { useData } from "@/contexts/data-context";
import { useEffect } from "react";

export const useEmployee = () => {
  const { employees, getEmployeeList } = useData();

  useEffect(() => {
    getEmployeeList();
  }, []);

  return { employees };
};
```

### Rules

- Context untuk global state yang di-share banyak komponen
- Custom hooks untuk logic yang reusable
- Kolokasi state dan side effects dalam context
- Jangan mutate state langsung, gunakan setState
- Panggil hooks di top-level component saja

---

## 5. API Integration Pattern

### Centralized API URLs

```typescript
// src/functions/BackendApiUrl.ts
const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5052";

export const BackendApiUrl = {
  // Auth
  login: () => `${BACKEND_URL}/api/Auth/login`,
  register: () => `${BACKEND_URL}/api/Auth/register`,

  // Employee
  getEmployeeList: () => `${BACKEND_URL}/api/Employee`,
  getEmployee: (id: string) => `${BACKEND_URL}/api/Employee/${id}`,
  getContractExtensionHistory: (employeeId: string) =>
    `${BACKEND_URL}/api/ContractExtendRequest/history/${employeeId}`,
  createExtensionRequest: () => `${BACKEND_URL}/api/ContractExtendRequest`,
  updateExtensionRequest: (id: string) =>
    `${BACKEND_URL}/api/ContractExtendRequest/${id}`,

  // Project
  getProjectList: () => `${BACKEND_URL}/api/Project`,
  createProject: () => `${BACKEND_URL}/api/Project`,
};
```

### Data Fetching with Error Handling

```typescript
export const fetchData = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API request failed");
  }

  return response.json();
};
```

---

## 6. Hooks Standards

### Custom Hooks Naming & Pattern

```typescript
// src/hooks/useContractExtension.ts
import { useState } from "react";
import { BackendApiUrl } from "@/functions/BackendApiUrl";
import { toast } from "sonner";

interface UseContractExtensionResult {
  loading: boolean;
  error: string | null;
  requestExtension: (
    employeeId: string,
    reason: string,
    endDate: Date,
  ) => Promise<void>;
  approveExtension: (requestId: string) => Promise<void>;
  rejectExtension: (requestId: string) => Promise<void>;
}

export const useContractExtension = (): UseContractExtensionResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestExtension = async (
    employeeId: string,
    reason: string,
    endDate: Date,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(BackendApiUrl.createExtensionRequest(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ employeeId, reason, endDate }),
      });

      if (!response.ok) throw new Error("Failed to request extension");
      toast.success("Extension request created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    requestExtension,
    approveExtension,
    rejectExtension,
  };
};
```

### Rules

- Hook names start with `use` prefix
- Return object dengan `loading`, `error`, dan action functions
- Gunakan Sonner toast untuk feedback (success, error)
- Centralize error handling di hook, jangan di component
- Custom hooks adalah tempat logic yang kompleks, tetap component tetap bersih

---

## 7. Styling Standards

### Tailwind + shadcn/ui

```typescript
// src/components/employee/employee-list.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const EmployeeList = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Employees</h1>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search by name..."
          className="flex-1"
        />
        <Button>Filter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Employee cards */}
      </div>
    </div>
  );
};
```

### Rules

- Gunakan Tailwind utility classes untuk styling
- Prefer shadcn/ui components untuk common UI patterns
- Hindari inline styles, gunakan className
- Responsive design dengan Tailwind breakpoints (sm, md, lg, xl)
- Theme colors defined in `tailwind.config.js`

---

## 8. TypeScript Interfaces/Types

### API Response Types

```typescript
// src/types/employee.ts
export interface EmployeeResponse {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  seniorityLevel: string;
  contractType: "permanent" | "contract";
  contractEndDate: string | null;
  yearsOfExperience: number;
  isUnavailable: boolean;
  currentProjects: string[];
  extensionRequest?: ContractExtensionRequestResponse;
}

// src/types/api.ts
export interface ContractExtensionRequestResponse {
  id: string;
  employeeId: string;
  requestedBy: string;
  requestedDate: string;
  proposedEndDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  expiresAt?: string; // 2-day grace period deadline for pending requests
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```

### Rules

- Define interfaces untuk semua API responses
- Use string literales untuk enums (`'pending' | 'approved'` bukan enum)
- Group related types dalam satu file per feature
- Export types dengan `export` keyword
- Nullable fields menggunakan `| null` bukan `undefined`

---

## 9. Form Handling Pattern

```typescript
// src/components/employee/extend-dialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useContractExtension } from '@/hooks/useContractExtension';

interface ExtendDialogProps {
  open: boolean;
  employeeId: string;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ExtendDialog: React.FC<ExtendDialogProps> = ({
  open,
  employeeId,
  onOpenChange,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [endDate, setEndDate] = useState('');
  const { loading, requestExtension } = useContractExtension();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim() || !endDate) {
      toast.error('Please fill all fields');
      return;
    }

    await requestExtension(employeeId, reason, new Date(endDate));
    if (!loading) {
      setReason('');
      setEndDate('');
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Contract Extension</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Reason for extension"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 10. Routing

### Route Structure

```typescript
// src/routes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Dashboard } from '@/pages/dashboard';
import { EmployeeManagement } from '@/pages/employee-management';
import { ProjectList } from '@/pages/project-list';
import { Login } from '@/pages/login';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute requiredRoles={['HR', 'GM']}>
            <EmployeeManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
```

### Rules

- Use dynamic routing di `routes.tsx`
- Create `ProtectedRoute` component untuk role-based access
- Redirect unauthenticated users ke `/login`
- Default redirect root `/` ke `/dashboard`

---

## 11. Error Handling & Loading States

### Consistent Pattern

```typescript
// Component dengan loading dan error states
const { data, loading, error } = useData();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorAlert message={error} />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

### Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Contract extension approved");

// Error
toast.error("Failed to process request");

// Info
toast.info("Processing your request...");

// Promise-based
toast.promise(fetchData(), {
  loading: "Loading...",
  success: "Data loaded!",
  error: "Failed to load data",
});
```

---

## 12. Git Commit Convention

### Branch Naming

```
main → dev → feature/xxx
```

- **main**: Production-ready code
- **dev**: Development integration branch
- **feature/xxx**: Feature branches from dev

### Commit Message Format

```
[feat|fix|refactor|chore|docs]: [description]

Contoh:
feat: add contract extension history dialog
fix: fix date comparison bug in cooldown validation
refactor: extract employee list filtering to custom hook
chore: update dependencies
docs: add frontend guidelines
```

### Indonesian Commits (Optional)

```
feat: menambahkan auto-reject untuk request yang expired
fix: memperbaiki bug date comparison dengan nullable check
refactor: memisahkan employee filtering logic ke custom hook
```

---

## 13. Environment & Configuration

### .env Setup

```
VITE_API_URL=http://localhost:5052
VITE_APP_NAME=RPS
VITE_LOG_LEVEL=debug
```

### Running Development

```bash
npm i              # Install dependencies
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 14. Code Quality & Best Practices

### Linting & Formatting

- Install ESLint and Prettier
- Run `npm run lint` before commit
- Use `npm run format` to auto-format code

### Performance Tips

- Use React.memo() for expensive components
- Avoid unnecessary re-renders with proper dependency arrays in useEffect
- Lazy load pages with React.lazy()
- Use useCallback for memoized callback functions

### Accessibility

- Add semantic HTML (`<button>`, `<form>`, `<label>`)
- Include `aria-*` attributes for screen readers
- Ensure keyboard navigation works
- Test with keyboard-only navigation

---

## 15. Summary

- **Always** use TypeScript for type safety
- **Always** collocate related files (types with components)
- **Always** extract logic to custom hooks
- **Always** use Context for global state
- **Always** centralize API URLs
- **Prefer** shadcn/ui components over custom
- **Prefer** Tailwind utilities over CSS files
- **Follow** commit convention for git history clarity
- **Test** functionality before commit
