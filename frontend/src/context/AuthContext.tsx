import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { login as loginService, me } from "../services/auth";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  async function login(email: string, password: string) {
    const data = await loginService(email, password);

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setUser(null);
  }

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("access");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await me(token);

        setUser(user);
      } catch {
        logout();
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );

  return context;
}