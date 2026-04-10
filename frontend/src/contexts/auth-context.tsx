import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AppSettings } from "@/functions/AppSettings";
import type { User, UserRole } from "@/types/domain";

export type { User, UserRole } from "@/types/domain";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_STORAGE_KEY = "rps_access_token";
const USER_STORAGE_KEY = "rps_user";

interface AuthApiResponse {
  Token: string;
  Id: string;
  FullName: string;
  Email: string;
  Role: string;
}

const validRoles: UserRole[] = ["Marketing", "GM", "PM", "HR"];

function toUserRole(role: string): UserRole {
  if (validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  throw new Error("Invalid role returned from authentication API");
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      message?: string;
      title?: string;
      error?: string;
    };
    return (
      payload.message ??
      payload.title ??
      payload.error ??
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        setToken(null);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(
      `${AppSettings.apiGatewayBasePath}/Auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          Password: password,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    const authData = (await response.json()) as AuthApiResponse;
    const loggedInUser: User = {
      id: authData.Id,
      name: authData.FullName,
      email: authData.Email,
      role: toUserRole(authData.Role),
    };

    setToken(authData.Token);
    setUser(loggedInUser);
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, authData.Token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => {
    const response = await fetch(
      `${AppSettings.apiGatewayBasePath}/Auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          FullName: name,
          Email: email,
          Password: password,
          Role: role,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    const authData = (await response.json()) as AuthApiResponse;
    const registeredUser: User = {
      id: authData.Id,
      name: authData.FullName,
      email: authData.Email,
      role: toUserRole(authData.Role),
    };

    setToken(authData.Token);
    setUser(registeredUser);
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, authData.Token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(registeredUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user && !!token,
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
