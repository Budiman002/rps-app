import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "@/components/layouts/root-layout";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Login } from "@/pages/login";
import { SignUp } from "@/pages/signup";
import { Dashboard } from "@/pages/dashboard";
import { PMDashboard } from "@/pages/pm-dashboard";
import { AddProject } from "@/pages/add-project";
import { ProjectDetail } from "@/pages/project-detail";
import { EditProject } from "@/pages/edit-project";
import { ProjectManagement } from "@/pages/project-management";
import { AssignMembers } from "@/pages/assign-members";
import { EmployeeManagement } from "@/pages/employee-management";
import { NotFound } from "@/pages/not-found";
import { RoleRedirect, RoleRoute } from "@/components/shared/role-redirect";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
    ],
  },
  {
    path: "/app",
    element: <RootLayout />,
    children: [
      { index: true, element: <RoleRedirect /> },
      {
        path: "dashboard",
        element: (
          <RoleRoute allowedRoles={["Marketing", "GM"]}>
            <Dashboard />
          </RoleRoute>
        ),
      },
      {
        path: "pm-dashboard",
        element: (
          <RoleRoute allowedRoles={["PM"]}>
            <PMDashboard />
          </RoleRoute>
        ),
      },
      { path: "projects", element: <ProjectManagement /> },
      { path: "projects/new", element: <AddProject /> },
      { path: "projects/:id", element: <ProjectDetail /> },
      { path: "projects/:id/edit", element: <EditProject /> },
      { path: "projects/:id/assign", element: <AssignMembers /> },
      {
        path: "employees",
        element: (
          <RoleRoute allowedRoles={["HR", "GM"]}>
            <EmployeeManagement />
          </RoleRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

