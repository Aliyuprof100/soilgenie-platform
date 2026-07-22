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

const menu = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Farmers", icon: Users },
  { name: "Farms", icon: Sprout },
  { name: "Soil Samples", icon: FlaskConical },
  { name: "Reports", icon: FileBarChart2 },
  { name: "Weather", icon: CloudSun },
  { name: "Notifications", icon: Bell },
  { name: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r bg-white">
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold text-green-700">
          SoilGenie
        </h1>

        <p className="text-sm text-slate-500">
          AI Precision Agriculture
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-green-50 hover:text-green-700"
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button className="flex w-full items-center gap-3 rounded-xl p-3 text-red-600 transition hover:bg-red-50">
          <LogOut size={20} />

          Logout
        </button>
      </div>
    </aside>
  );
}