import { useEffect, useState, type ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import api from "../../api/api";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface CurrentUser {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role?: string;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me/");

        if (mounted) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Unable to load authenticated user:", error);
      }
    };

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  const fullName =
    user?.name ||
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user?.email ||
    "SoilGenie User";

  const role = user?.role || "USER";

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}

      <Sidebar />

      {/* Main Area */}

      <div className="flex flex-1 flex-col">

        <Topbar
          name={fullName}
          role={role}
        />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

      </div>

    </div>
  );
}