import {
  LayoutDashboard,
  Users,
  Sprout,
  FlaskConical,
  FileBarChart2,
  CloudSun,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/agent",
  },
  {
    title: "Farmers",
    icon: Users,
    path: "/agent/farmers",
  },
  {
    title: "Farms",
    icon: Sprout,
    path: "/agent/farms",
  },
  {
    title: "Soil Samples",
    icon: FlaskConical,
    path: "/agent/soil/samples",
  },
  {
    title: "Reports",
    icon: FileBarChart2,
    path: "/agent/reports",
  },
  {
    title: "Weather",
    icon: CloudSun,
    path: "/agent/weather",
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/agent/notifications",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/agent/settings",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">

      {/* Logo */}
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold text-green-700">
          SoilGenie
        </h1>

        <p className="text-sm text-slate-500">
          AI Precision Agriculture
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">

        {menu.map((item) => {
          const Icon = item.icon;

          const isActive =
            location.pathname === item.path ||
            (
              item.path === "/agent/soil/samples" &&
              location.pathname.startsWith(
                "/agent/soil/samples"
              )
            );

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left font-medium transition ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "text-slate-700 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <Icon size={20} />

              <span>
                {item.title}
              </span>
            </button>
          );
        })}

      </div>

      {/* Logout */}
      <div className="border-t p-4">

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl p-3 text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={20} />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}