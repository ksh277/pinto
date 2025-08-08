import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// JWT-based authentication - no Supabase import needed

interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  nickname?: string;
  points: number;
  coupons: number;
  totalOrders: number;
  totalSpent: number;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  redirectPath: string | null;
  setRedirectPath: (path: string | null) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for JWT token and stored user data
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (token && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (parseError) {
            console.error("Error parsing stored user:", parseError);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data) {
        const mappedUser: User = {
          id: data.id,
          name: data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.username,
          username: data.username,
          email: data.email,
          nickname: data.nickname,
          points: 0,
          coupons: 0,
          totalOrders: 0,
          totalSpent: 0,
          isAdmin: data.isAdmin || false,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
        };

        setUser(mappedUser);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        localStorage.setItem("token", data.token);
        setIsLoading(false);
        return true;
      } else {
        console.error("로그인 오류:", data.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Remove JWT token and user data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setRedirectPath(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        redirectPath,
        setRedirectPath,
        setUser,
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
