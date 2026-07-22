import { Bell, Search, UserCircle } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Agent Dashboard
        </h1>

        <p className="text-sm text-slate-500">
          Welcome back to SoilGenie
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 rounded-xl border px-4 py-2">
          <Search size={18} className="text-slate-500" />

          <input
            type="text"
            placeholder="Search..."
            className="outline-none"
          />
        </div>

        <button className="rounded-full p-2 hover:bg-slate-100">
          <Bell size={22} />
        </button>

        <div className="flex items-center gap-3">
          <UserCircle size={38} className="text-green-700" />

          <div>
            <p className="font-semibold">Ali Mohammed</p>
            <p className="text-sm text-slate-500">
              Field Agent
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}