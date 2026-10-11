import {
  Bell,
  Search,
  UserCircle,
  ChevronDown,
} from "lucide-react";

interface TopbarProps {
  name?: string;
  role?: string;
}

function formatRole(role?: string) {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "Administrator";

    case "AGENT":
      return "Field Agent";

    case "FARMER":
      return "Farmer";

    case "AGRONOMIST":
      return "Agronomist";

    default:
      return role || "User";
  }
}

function getDashboardTitle(role?: string) {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "Admin Dashboard";

    case "AGENT":
      return "Agent Dashboard";

    case "FARMER":
      return "Farmer Dashboard";

    case "AGRONOMIST":
      return "Agronomist Dashboard";

    default:
      return "SoilGenie Dashboard";
  }
}

export default function Topbar({
  name = "Ali Mohammed",
  role = "ADMIN",
}: TopbarProps) {
  const displayRole = formatRole(role);
  const dashboardTitle = getDashboardTitle(role);

  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-8">

      {/* Left */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {dashboardTitle}
        </h1>

        <p className="text-sm text-slate-500">
          Welcome back to SoilGenie
        </p>
      </div>

      {/* Right */}

      <div className="flex items-center gap-6">

        {/* Search */}

        <div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-2">

          <Search
            size={18}
            className="text-slate-500"
          />

          <input
            type="text"
            placeholder="Search farmers, farms..."
            className="w-64 bg-transparent outline-none"
          />

        </div>

        {/* Notification */}

        <button
          type="button"
          className="relative rounded-full p-2 hover:bg-slate-100"
        >
          <Bell size={22} />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Profile */}

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl border px-3 py-2 hover:bg-slate-50"
        >
          <UserCircle
            size={40}
            className="text-green-700"
          />

          <div className="text-left">
            <p className="font-semibold">
              {name}
            </p>

            <p className="text-sm text-slate-500">
              {displayRole}
            </p>
          </div>

          <ChevronDown size={18} />
        </button>

      </div>

    </header>
  );
}