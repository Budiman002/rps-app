import { Navigate } from "react-router";
import { useAuth } from "@/contexts/auth-context";

export function getRoleHomePath(role?: string) {
  switch (role) {
    case "pm":
      return "/app/pm-dashboard";
    case "hr":
      return "/app/employees";
    case "gm":
    case "marketing":
    default:
      return "/app/dashboard";
  }
}

export function RoleRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // Wait for user to be loaded
  if (!user) {
    return null;
  }

  // Redirect based on user role
  return <Navigate to={getRoleHomePath(user.role)} replace />;
}

export function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: Array<"marketing" | "gm" | "pm" | "hr">;
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <>{children}</>;
}

