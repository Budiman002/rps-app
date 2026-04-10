import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { User, UserRole } from "@/types/domain";

export type { User, UserRole } from "@/types/domain";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Array<User & { password: string }> = [
  { id: "1", name: "Marketing User", email: "marketing@rps.com", password: "password", role: "marketing" },
  { id: "2", name: "General Manager", email: "gm@rps.com", password: "password", role: "gm" },
  { id: "3", name: "Project Manager", email: "pm@rps.com", password: "password", role: "pm" },
  { id: "4", name: "HR Manager", email: "hr@rps.com", password: "password", role: "hr" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("rps_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem("rps_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error("Invalid email or password");
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem("rps_user", JSON.stringify(userWithoutPassword));
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email,
      role,
    };

    mockUsers.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem("rps_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rps_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


