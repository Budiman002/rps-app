import { Outlet, Navigate, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Bell, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RootLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unreadNotificationCount = 0;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavItems = () => {
    if (user?.role === "hr") {
      return [
        { icon: Users, label: "Employee Management", path: "/app/employees" },
      ];
    }

    if (user?.role === "pm") {
      return [
        { icon: LayoutDashboard, label: "My Dashboard", path: "/app/pm-dashboard" },
        { icon: FolderKanban, label: "My Projects", path: "/app/projects" },
      ];
    }

    if (user?.role === "gm") {
      return [
        { icon: LayoutDashboard, label: "Project Dashboard", path: "/app/dashboard" },
        { icon: FolderKanban, label: "Projects", path: "/app/projects" },
        { icon: Users, label: "User Management", path: "/app/employees" },
      ];
    }

    // marketing
    return [
      { icon: LayoutDashboard, label: "Project Dashboard", path: "/app/dashboard" },
      { icon: FolderKanban, label: "Projects", path: "/app/projects" },
    ];
  };

  const navItems = getNavItems();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RPS</span>
              </div>
              <span className="font-semibold text-lg hidden sm:inline">Resource Planning System</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Button>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {user ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-gray-600">
                  <span className="text-xs">Role: <span className="capitalize font-medium">{user?.role}</span></span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-20 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:h-[calc(100vh-4rem)] ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <nav className="p-4 space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                               (item.path !== "/app/dashboard" && item.path !== "/app/pm-dashboard" && location.pathname.startsWith(item.path));
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
            
            {/* Logout button at bottom */}
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Log out
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden mt-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 lg:ml-0">
          <div className="mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

