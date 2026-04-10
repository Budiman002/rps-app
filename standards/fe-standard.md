# Frontend Development Standard (Next.js / React / TypeScript)

> **Scope**: This is a general-purpose frontend development standard for Next.js (Pages Router) projects using TypeScript. It defines architecture, coding conventions, component patterns, and mandatory rules for all contributors (human and AI).

---

## 1. Architecture & Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js (Pages Router) | SSR/SSG React framework |
| **Language** | TypeScript | Type-safe JavaScript |
| **Styling** | TailwindCSS | Utility-first CSS |
| **UI Library** | shadcn/ui (Radix UI) | Accessible component primitives |
| **Ant Design** | antd (legacy) | Enterprise UI components |
| **Forms** | React Hook Form + Zod | Form management & validation |
| **Data Fetching** | SWR | Client-side data fetching & caching |
| **State** | Jotai / Zustand | Lightweight state management |
| **Auth** | NextAuth.js (next-auth) | OAuth/OIDC authentication |
| **Icons** | Font Awesome / Lucide React | Icon libraries |
| **Charts** | Chart.js + react-chartjs-2 | Data visualization |
| **Testing** | Storybook + Vitest | Component testing & docs |
| **Linting** | ESLint + TypeScript ESLint | Code quality |

---

## 2. Project Structure

```
project-root/
├── components/              # UI components (by feature)
│   ├── [feature-name]/      # Feature-specific components
│   │   ├── index.tsx         # Main feature component
│   │   ├── [Component].tsx   # Sub-components
│   │   ├── hooks/            # Feature-specific hooks
│   │   └── form/             # Feature-specific form components
│   ├── layouts/              # Page layout components
│   │   ├── MainLayout.tsx
│   │   ├── PageContainer.tsx
│   │   └── [Feature]Layout.tsx
│   ├── shared/               # Reusable shared components
│   │   ├── Modal.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── input/            # Shared form inputs
│   └── ui/                   # Base UI primitives (shadcn/ui)
│       ├── button.tsx
│       ├── card.tsx
│       ├── data-table.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...
├── pages/                   # Next.js page routes
│   ├── _app.tsx             # App wrapper (providers, global styles)
│   ├── index.tsx            # Home/dashboard page
│   ├── api/                 # API routes (proxy, auth)
│   │   ├── auth/            # NextAuth endpoints
│   │   └── gateway/         # Backend API proxy
│   ├── error/               # Error pages (403, 404, 500)
│   └── [feature]/           # Feature page routes
├── functions/               # Core utilities & API layer
│   ├── BackendApiUrl.ts     # Centralized API URL definitions
│   ├── useFetchWithAccessToken.ts  # Auth-aware fetch wrapper
│   ├── useSwrFetcherWithAccessToken.ts  # SWR fetcher with auth
│   ├── tryFetchJson.ts      # Base fetch utility
│   ├── AuthorizationContext.ts  # Auth context & hooks
│   ├── AppSettings.ts       # App configuration
│   └── api/                 # Feature-specific API modules
├── contexts/                # React contexts
│   └── PermissionContext.tsx
├── hooks/                   # Global custom hooks
├── store/                   # State management stores
├── types/                   # TypeScript type definitions
├── constants/               # Shared constants
├── utils/                   # Generic utility functions
├── styles/                  # Global stylesheets
├── public/                  # Static assets
├── stories/                 # Storybook stories (global)
└── lib/                     # Third-party library wrappers
```

### Key Rules
- **Feature folders**: Components MUST be organized by feature (e.g., `components/data-connection/`, `components/ropa-list/`).
- **Colocation**: Keep hooks, sub-components, and form components close to where they're used.
- **UI primitives** (`components/ui/`): Generic, reusable, unstyled components (shadcn/ui pattern).
- **Shared components** (`components/shared/`): Business-agnostic reusable components.

---

## 3. Component Patterns

### 3.1 Feature Component

```tsx
// components/[feature]/index.tsx
import { useFeatureData } from "./hooks/useFeatureData";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

export default function FeaturePage() {
  const { data, isLoading, actions } = useFeatureData();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Feature Title</h1>
        <Button onClick={actions.onCreate}>Add New</Button>
      </div>
      <DataTable 
        data={data} 
        columns={columns} 
        isLoading={isLoading} 
      />
    </div>
  );
}
```

### 3.2 Custom Hook Pattern

```tsx
// components/[feature]/hooks/useFeatureData.ts
import useSWR from "swr";
import { useState, useCallback } from "react";
import { featureApi } from "@/functions/api/featureApi";

interface UseFeatureDataReturn {
  data: FeatureItem[];
  isLoading: boolean;
  error: unknown;
  actions: {
    onCreate: (data: CreatePayload) => Promise<boolean>;
    onUpdate: (id: string, data: UpdatePayload) => Promise<boolean>;
    onDelete: (id: string) => Promise<void>;
  };
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const useFeatureData = (): UseFeatureDataReturn => {
  const { data: response, mutate, isLoading, error } = useSWR(
    featureApi.keys.list(),
    () => featureApi.getList()
  );

  const [isCreating, setIsCreating] = useState(false);
  // ... handler implementations with try/catch/finally pattern

  return {
    data: response?.data || [],
    isLoading,
    error,
    actions: { onCreate, onUpdate, onDelete },
    isCreating,
    isUpdating,
    isDeleting,
  };
};
```

### 3.3 Page Layout Pattern

```tsx
// pages/[feature]/index.tsx
import { Authorize } from "@/components/Authorize";
import FeaturePage from "@/components/[feature]";
import { MainLayout } from "@/components/layouts/MainLayout";

export default function Page() {
  return (
    <Authorize>
      <FeaturePage />
    </Authorize>
  );
}

Page.layout = (page: React.ReactElement) => (
  <MainLayout>{page}</MainLayout>
);
```

---

## 4. API Communication

### 4.1 Centralized API URLs

All backend API URLs MUST be defined in a single `BackendApiUrl.ts` file:

```tsx
// functions/BackendApiUrl.ts
const baseUrl = "/app/api/gateway";

export const BackendApiUrl = {
  getUserList: baseUrl + "/api/User",
  createUser: baseUrl + "/api/User/create",
  deleteUser: baseUrl + "/api/User",
  // ... all endpoints
};

// URL builder functions for parameterized endpoints
export function GetUserList(page: number, search: string) {
  const param = new URLSearchParams();
  param.append("page", page.toString());
  if (search) param.append("search", search);
  return BackendApiUrl.getUserList + "?" + param.toString();
}
```

### 4.2 Authenticated Fetch

Use the `useFetchWithAccessToken` hook inside `<Authorize>` components:

```tsx
const { fetchGET, fetchPOST, fetchPUT, fetchDELETE } = useFetchWithAccessToken();

// GET request
const { data, error, problem } = await fetchGET<ResponseType>(url);

// POST request with body
const { data, error, problem } = await fetchPOST<ResponseType>(url, body);
```

### 4.3 SWR Data Fetching

```tsx
import useSWR from "swr";
import { useSwrFetcherWithAccessToken } from "@/functions/useSwrFetcherWithAccessToken";

const fetcher = useSwrFetcherWithAccessToken();
const { data, error, isLoading, mutate } = useSWR<ResponseType>(url, fetcher);
```

### Rules
- All API calls go through the gateway proxy (`/api/gateway/[...slug]`).
- Bearer tokens are automatically attached via `useFetchWithAccessToken`.
- Handle 403 responses by redirecting to the error page.
- Use `SWR.mutate()` for cache invalidation after mutations.

---

## 5. Authentication & Authorization

### 5.1 NextAuth Setup

```tsx
// pages/_app.tsx
<SessionProvider session={session} basePath="/app/api/auth">
  <PermissionProvider>
    <SessionErrorHandler>
      {children}
    </SessionErrorHandler>
  </PermissionProvider>
</SessionProvider>
```

### 5.2 Route Protection

```tsx
// Wrap pages that require authentication
<Authorize>
  <ProtectedContent />
</Authorize>

// Permission-based access control
<RequirePermission permission="manage_users">
  <AdminOnlyContent />
</RequirePermission>
```

### Rules
- Authentication is handled by NextAuth with OpenID Connect.
- Permissions are loaded from the backend on login.
- Use `<Authorize>` for authenticated pages, `<RequirePermission>` for role-based access.
- Session tokens are refreshed automatically (configurable interval).

---

## 6. Form Handling

### 6.1 React Hook Form + Zod

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ExampleForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Rules
- Always use Zod schemas for form validation.
- Client-side validation is a UX enhancement, NOT a security measure. Server-side validation is mandatory.
- Use `@hookform/resolvers` providing Zod schema to React Hook Form.
- Define reusable validation schemas in shared files when schemas are used across features.

---

## 7. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Component files | PascalCase `.tsx` | `DataConnectionForm.tsx` |
| Hook files | camelCase with `use` prefix | `useDataConnections.ts` |
| Utility files | camelCase `.ts` | `tryFetchJson.ts` |
| Type/Interface files | PascalCase `.ts` | `DataConnection.ts` |
| CSS modules | camelCase `.module.css` | `layout.module.css` |
| Feature folders | kebab-case | `data-connection/`, `ropa-list/` |
| Component names | PascalCase | `DataConnectionsTable` |
| Hook names | `use[Feature][Action]` | `useDataConnections`, `useFetchWithAccessToken` |
| API URL constants | camelCase with get/create/update/delete prefix | `getUserList`, `createUser` |
| URL builder functions | PascalCase | `GetUserList(page, search)` |

---

## 8. Styling

### TailwindCSS
- Use TailwindCSS utility classes for styling.
- Use `cn()` utility (from `clsx` + `tailwind-merge`) for conditional class merging.
- Global styles in `styles/globals.css`.
- Component variants via `class-variance-authority` (CVA).

### Component Variants (CVA)
```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("inline-flex items-center rounded-md", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border border-input bg-background",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
```

---

## 9. Security Headers

Configure security headers in `next.config.js`:

```javascript
function getSecurityHeaders(isProd) {
  const headers = [
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: '...' },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
  ];

  if (isProd) {
    headers.push(
      { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
      { key: 'Content-Security-Policy', value: '...' },
    );
  }

  return headers;
}
```

### Rules
- HSTS with `max-age=31536000` (1 year) in production.
- CSP must restrict `default-src`, `script-src`, `style-src`, `img-src`, `connect-src`, `frame-ancestors`, and `form-action`.
- `poweredByHeader: false` to suppress `X-Powered-By`.
- `productionBrowserSourceMaps: true` for debugging.

---

## 10. Storybook

- Every reusable UI component (`components/ui/`) SHOULD have a corresponding `.stories.tsx` file.
- Stories document component variants, states, and usage examples.
- Use accessibility testing addon (`@storybook/addon-a11y`).

---

## 11. Mandatory Rules for AI Agents

> All AI agents contributing to this codebase MUST follow these rules without exception.

### 11.1 No Hardcoding
- Never hardcode API URLs — use `BackendApiUrl.ts`.
- Never hardcode environment-specific values — use `process.env` or `AppSettings`.
- Never hardcode user-facing strings that should be configurable.

### 11.2 Use Existing Patterns
- Follow the hook pattern (`useFeatureData`) for data fetching.
- Use `useFetchWithAccessToken` for authenticated API calls.
- Use SWR for server state management.
- Use React Hook Form + Zod for forms.
- Place components in feature folders, not root.

### 11.3 Respect Project Structure
- Feature components → `components/[feature-name]/`
- Feature hooks → `components/[feature-name]/hooks/`
- Shared components → `components/shared/`
- UI primitives → `components/ui/`
- API URLs → `functions/BackendApiUrl.ts`
- Types → `types/`

### 11.4 TypeScript
- All files MUST use TypeScript (`.ts` / `.tsx`).
- Define explicit types for API responses, props, and state.
- Avoid `any` — use `unknown` with type guards when types are uncertain.
- Export interfaces/types from `types/` directory.

### 11.5 Error Handling
- Handle API errors gracefully — show toast notifications for user-facing errors.
- Use `try/catch/finally` pattern in async operations.
- Set loading states (`isCreating`, `isDeleting`, etc.) to prevent duplicate submissions.
- Never silently swallow errors without at least logging them.

### 11.6 Never Execute Code
- Never run `npm run dev`, `npm run build`, or execute the application.
- Only write code; the owner runs it on the appropriate server.

### 11.7 Accessibility
- Use semantic HTML elements.
- Ensure interactive elements are keyboard-accessible.
- Provide `aria-label` or visible labels for all controls.
- Use Radix UI primitives which are accessible by default.

---

## 12. Performance

- Use `React.memo`, `useCallback`, `useMemo` for expensive computations.
- Lazy load heavy components with `dynamic()` from Next.js.
- Minimize re-renders — keep state as close to where it's used as possible.
- Use SWR's built-in deduplication and caching.
- Optimize images via `next/image`.

---

## 13. Testing

- Unit tests for hooks and utility functions (Vitest).
- Visual regression with Storybook + Chromatic.
- Accessibility checks via `axe-storybook-testing`.
- Type checking: `tsc --noEmit` in CI pipeline.
- Lint checking: `next lint` in CI pipeline.
