import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
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
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const u = session.user;
          const mappedUser: User = {
            id: u.id,
            name: u.user_metadata?.full_name || u.email!,
            username: u.user_metadata?.username || u.email!,
            email: u.email!,
            points: 0,
            coupons: 0,
            totalOrders: 0,
            totalSpent: 0,
            isAdmin: u.user_metadata?.isAdmin || false,
            firstName: u.user_metadata?.first_name || "",
            lastName: u.user_metadata?.last_name || "",
          };
          setUser(mappedUser);
          localStorage.setItem("user", JSON.stringify(mappedUser));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        console.error("로그인 오류:", error, data);
        setIsLoading(false);
        return false;
      }

      const u = data.user;
      const mappedUser: User = {
        id: u.id,
        name: u.user_metadata?.full_name || u.email!,
        username: u.user_metadata?.username || u.email!,
        email: u.email!,
        points: 0,
        coupons: 0,
        totalOrders: 0,
        totalSpent: 0,
        isAdmin: u.user_metadata?.isAdmin || false,
        firstName: u.user_metadata?.first_name || "",
        lastName: u.user_metadata?.last_name || "",
      };

      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
    }
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      setRedirectPath(null);
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
