import { Outlet, Navigate } from "react-router";
import { useAuth } from "@/contexts/auth-context";

function getRoleHomePath(role?: string) {
  switch (role) {
    case "PM":
      return "/app/pm-dashboard";
    case "HR":
      return "/app/employees";
    case "GM":
    case "Marketing":
    default:
      return "/app/dashboard";
  }
}

export function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={getRoleHomePath(user?.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}


