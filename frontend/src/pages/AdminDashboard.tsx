import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle2,
  Database,
  FileBarChart2,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Menu,
  RefreshCw,
  Sprout,
  TestTube2,
  TrendingUp,
  UserCog,
  Users,
  X,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import api from "../api/api";
import { getFarms } from "../services/farms";
import type { Farm } from "../services/farms";
import FarmMap from "../components/farms/FarmMap";

// ============================================================

// TYPES

// ============================================================

interface DashboardData {
  overview: {
    total_users: number;

    total_admins: number;

    total_agents: number;

    active_agents: number;

    total_farmers: number;

    total_farms: number;

    total_farm_area: number;

    total_samples: number;

    total_tests: number;

    completed_tests: number;

    pending_tests: number;

    failed_tests: number;

    completed_assessments: number;
  };

  test_status: {
    completed: number;

    pending: number;

    failed: number;
  };

  soil_health: {
    pH: number | null;

    nitrogen: number | null;

    phosphorus: number | null;

    potassium: number | null;

    organic_matter: number | null;
  };

  recent_farmers: RecentFarmer[];

  recent_farms: RecentFarm[];

  recent_tests: RecentTest[];

  agent_performance: AgentPerformance[];

  system: {
    api: string;

    database: string;

    weather: string;
  };
}

interface RecentFarmer {
  id: string;

  farmer_id: string;

  name: string;

  phone_number: string;

  state: string;

  lga: string;

  agent: string;

  created_at: string | null;
}

interface RecentFarm {
  id: number;

  farm_id: string;

  farm_name: string;

  farmer: string;

  farmer_id: string | null;

  size: number;

  state: string;

  lga: string;

  agent: string;

  created_at: string | null;
}

interface RecentTest {
  id: string;

  test_id: string;

  sample_id: string | null;

  farm_name: string;

  farmer: string;

  status: string;

  created_at: string | null;

  tested_at: string | null;
}

interface AgentPerformance {
  id: string;

  name: string;

  email: string;

  farmers: number;

  farms: number;

  samples: number;

  tests: number;

  completed_tests: number;

  pending_tests: number;

  failed_tests: number;

  assessments: number;

  active: boolean;

  activity_score: number;
}

// ============================================================

// STAT CARD

// ============================================================

interface StatCardProps {
  title: string;

  value: string | number;

  subtitle: string;

  icon: React.ElementType;

  iconClassName: string;
}

function StatCard({
  title,

  value,

  subtitle,

  icon: Icon,

  iconClassName,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
           {" "}
      <div className="flex items-start justify-between">
               {" "}
        <div>
                   {" "}
          <p className="text-sm font-medium text-slate-500">
                        {title}         {" "}
          </p>
                   {" "}
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {value}         {" "}
          </p>
                   {" "}
          <p className="mt-2 text-xs text-slate-500">
                        {subtitle}         {" "}
          </p>
                 {" "}
        </div>
               {" "}
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
                    <Icon size={22} />       {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
}

// ============================================================

// HELPERS

// ============================================================

// ============================================================

// ADMIN DASHBOARD

// ============================================================

export default function AdminDashboard() {
  const navigate = useNavigate();

  const {
    user,

    logout,
  } = useAuth(); // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [mobileOpen, setMobileOpen] = useState(false);

  const [data, setData] = useState<DashboardData | null>(null);

  const [mapFarms, setMapFarms] = useState<Farm[]>([]);

  const [selectedMapFarm, setSelectedMapFarm] = useState<Farm | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(""); // ----------------------------------------------------------
  // LOAD DASHBOARD
  // ----------------------------------------------------------

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const response = await api.get<DashboardData>("/admin/dashboard/");

      setData(response.data);
    } catch (err: any) {
      console.error(
        "Unable to load admin dashboard:",

        err,
      );

      if (err?.response?.status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else if (err?.response?.status === 403) {
        setError("Administrator access is required.");
      } else {
        setError("Unable to load the SoilGenie administration dashboard.");
      }
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    async function loadMapFarms() {
      try {
        const farms = await getFarms();

        setMapFarms(farms);
      } catch (err) {
        console.error("Unable to load farm map data:", err);

        setMapFarms([]);
      }
    }

    void loadMapFarms();
  }, []); // ----------------------------------------------------------
  // REFRESH
  // ----------------------------------------------------------

  function refreshDashboard() {
    setRefreshing(true);

    void loadDashboard();
  } // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  function handleLogout() {
    logout();

    navigate("/login");
  } // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const overview = data?.overview;

  const displayName =
    user?.first_name || user?.last_name
      ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
      : "Administrator"; // ----------------------------------------------------------
  // ADMIN MENU
  // ----------------------------------------------------------

  const menu = [
    {
      title: "Dashboard",

      icon: LayoutDashboard,

      path: "/admin",
    },

    {
      title: "Agents",

      icon: UserCog,

      path: "/admin/agents",
    },

    {
      title: "Farmers",

      icon: Users,

      path: "/admin/farmers",
    },

    {
      title: "Farms",

      icon: Sprout,

      path: "/admin/farms",
    },

    {
      title: "Soil Samples",

      icon: FlaskConical,

      path: "/admin/soil-samples",
    },

    {
      title: "Soil Tests",

      icon: TestTube2,

      path: "/admin/soil-tests",
    },

    {
      title: "Reports",

      icon: FileBarChart2,

      path: "/admin/reports",
    },

    {
      title: "Analytics",

      icon: BarChart3,

      path: "/admin/analytics",
    },

    {
      title: "Map View",

      icon: Map,

      path: "/admin/map",
    },

    {
      title: "Activity",

      icon: Activity,

      path: "/admin/activity",
    },
  ]; // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-100">
           {" "}
      {/* ======================================================

          MOBILE OVERLAY

      ====================================================== */}
           {" "}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}
           {" "}
      {/* ======================================================

          SIDEBAR

      ====================================================== */}
           {" "}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-emerald-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
                {/* Logo */}       {" "}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
                   {" "}
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="text-left"
          >
                       {" "}
            <div className="flex items-center gap-3">
                           {" "}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                               {" "}
                <Sprout size={23} className="text-emerald-300" />
                 {" "}
              </div>
                           {" "}
              <div>
                               {" "}
                <h1 className="text-xl font-bold">
                                    SoilGenie                {" "}
                </h1>
                               {" "}
                <p className="text-[11px] text-emerald-200">
                                    AI Precision Agriculture
                   {" "}
                </p>
                             {" "}
              </div>
                         {" "}
            </div>
                     {" "}
          </button>
                   {" "}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-emerald-200 hover:bg-white/10 lg:hidden"
          >
                        <X size={20} />         {" "}
          </button>
                 {" "}
        </div>
                {/* Navigation */}       {" "}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                   {" "}
          {menu.map((item) => {
            const Icon = item.icon;

            const active = item.path === "/admin";

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  setMobileOpen(false);

                  navigate(item.path);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-emerald-500/20 text-white"
                    : "text-emerald-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                                <Icon size={19} />               {" "}
                <span>                  {item.title}                </span>
                       {" "}
              </button>
            );
          })}
                 {" "}
        </nav>
                {/* Logout */}       {" "}
        <div className="border-t border-white/10 p-4">
                   {" "}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/10"
          >
                        <LogOut size={19} />           {" "}
            <span>              Logout             </span>         {" "}
          </button>
                 {" "}
        </div>
             {" "}
      </aside>
           {" "}
      {/* ======================================================

          MAIN

      ====================================================== */}
           {" "}
      <main className="min-h-screen lg:ml-64">
               {" "}
        {/* ====================================================

            HEADER

        ==================================================== */}
               {" "}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                   {" "}
          <div className="flex h-20 items-center justify-between px-5 sm:px-8">
                        {/* Left */}           {" "}
            <div className="flex items-center gap-4">
                           {" "}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                                <Menu size={23} />             {" "}
              </button>
                           {" "}
              <div>
                               {" "}
                <p className="text-xs font-medium uppercase tracking-wider text-green-700">
                                    SoilGenie Administration
                   {" "}
                </p>
                               {" "}
                <h1 className="text-xl font-bold text-slate-900">
                                    Admin Dashboard                {" "}
                </h1>
                             {" "}
              </div>
                         {" "}
            </div>
                        {/* Right */}           {" "}
            <div className="flex items-center gap-3">
                           {" "}
              <button
                type="button"
                onClick={refreshDashboard}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                               {" "}
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                               {" "}
                <span className="hidden sm:inline">
                                    Refresh                {" "}
                </span>
                             {" "}
              </button>
                           {" "}
              <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
                               {" "}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                                   {" "}
                  {(displayName.charAt(0) || "A").toUpperCase()}
                   {" "}
                </div>
                               {" "}
                <div className="hidden xl:block">
                                   {" "}
                  <p className="text-sm font-semibold text-slate-900">
                                        {displayName}                 {" "}
                  </p>
                                   {" "}
                  <p className="text-xs text-slate-500">
                                        Administrator                  {" "}
                  </p>
                                 {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </header>
               {" "}
        {/* ====================================================

            CONTENT

        ==================================================== */}
               {" "}
        <div className="p-5 sm:p-8">
                   {" "}
          {/* ==================================================

              TITLE

          ================================================== */}
                   {" "}
          <section className="mb-8">
                       {" "}
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Platform Overview            {" "}
            </h2>
                       {" "}
            <p className="mt-2 max-w-3xl text-slate-600">
                            Complete real-time overview of
              SoilGenie farmers, agents, farms,               soil samples,
              tests and assessments.            {" "}
            </p>
                     {" "}
          </section>
                   {" "}
          {/* ==================================================

              ERROR

          ================================================== */}
                   {" "}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                           {" "}
              <p className="font-semibold">
                                Dashboard error              {" "}
              </p>
                           {" "}
              <p className="mt-1 text-sm">
                                {error}             {" "}
              </p>
                         {" "}
            </div>
          )}
                   {" "}
          {/* ==================================================

              LOADING

          ================================================== */}
                   {" "}
          {loading ? (
            <div className="flex min-h-[500px] items-center justify-center">
                           {" "}
              <div className="text-center">
                               {" "}
                <RefreshCw
                  size={36}
                  className="mx-auto animate-spin text-emerald-600"
                />
                               {" "}
                <p className="mt-4 font-semibold text-slate-700">
                                    Loading SoilGenie platform data...
                       {" "}
                </p>
                             {" "}
              </div>
                         {" "}
            </div>
          ) : (
            <>
                           {" "}
              {/* ==================================================

                  PLATFORM STATISTICS

              ================================================== */}
                           {" "}
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                               {" "}
                <StatCard
                  title="Total Farmers"
                  value={overview?.total_farmers ?? 0}
                  subtitle="Farmers registered"
                  icon={Users}
                  iconClassName="bg-emerald-50 text-emerald-700"
                />
                               {" "}
                <StatCard
                  title="Field Agents"
                  value={overview?.total_agents ?? 0}
                  subtitle={`${overview?.active_agents ?? 0} active agents`}
                  icon={UserCog}
                  iconClassName="bg-blue-50 text-blue-700"
                />
                               {" "}
                <StatCard
                  title="Total Farms"
                  value={overview?.total_farms ?? 0}
                  subtitle="Registered farms"
                  icon={Sprout}
                  iconClassName="bg-green-50 text-green-700"
                />
                               {" "}
                <StatCard
                  title="Farm Area"
                  value={`${(overview?.total_farm_area ?? 0).toFixed(2)} ha`}
                  subtitle="Registered agricultural land"
                  icon={MapPin}
                  iconClassName="bg-amber-50 text-amber-700"
                />
                               {" "}
                <StatCard
                  title="Soil Samples"
                  value={overview?.total_samples ?? 0}
                  subtitle="Samples collected"
                  icon={FlaskConical}
                  iconClassName="bg-purple-50 text-purple-700"
                />
                               {" "}
                <StatCard
                  title="Soil Tests"
                  value={overview?.total_tests ?? 0}
                  subtitle="Tests created"
                  icon={TestTube2}
                  iconClassName="bg-rose-50 text-rose-700"
                />
                               {" "}
                <StatCard
                  title="Assessments"
                  value={overview?.completed_assessments ?? 0}
                  subtitle="Completed soil assessments"
                  icon={CheckCircle2}
                  iconClassName="bg-teal-50 text-teal-700"
                />
                               {" "}
                <StatCard
                  title="Pending Tests"
                  value={overview?.pending_tests ?? 0}
                  subtitle="Awaiting results"
                  icon={Database}
                  iconClassName="bg-orange-50 text-orange-700"
                />
                             {" "}
              </section>
                           {" "}
              {/* ==================================================

                  PLATFORM ACTIVITY + TEST STATUS

              ================================================== */}
                           {" "}
              <section className="mt-6 grid gap-6 xl:grid-cols-3">
                                {/* Platform Activity */}               {" "}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                                   {" "}
                  <div className="mb-5 flex items-center justify-between">
                                       {" "}
                    <div>
                                           {" "}
                      <h2 className="text-lg font-bold text-slate-900">
                                                Platform Activity
                               {" "}
                      </h2>
                                           {" "}
                      <p className="mt-1 text-sm text-slate-500">
                                                Current SoilGenie operational
                        footprint.                      {" "}
                      </p>
                                         {" "}
                    </div>
                                       {" "}
                    <TrendingUp size={22} className="text-emerald-600" />
                             {" "}
                  </div>
                                   {" "}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                       {" "}
                    <div className="rounded-xl bg-emerald-50 p-5">
                                           {" "}
                      <p className="text-xs text-slate-500">
                                                Users                      {" "}
                      </p>
                                           {" "}
                      <p className="mt-2 text-2xl font-bold">
                                                {overview?.total_users ?? 0}
                                         {" "}
                      </p>
                                         {" "}
                    </div>
                                       {" "}
                    <div className="rounded-xl bg-blue-50 p-5">
                                           {" "}
                      <p className="text-xs text-slate-500">
                                                Agents
                         {" "}
                      </p>
                                           {" "}
                      <p className="mt-2 text-2xl font-bold">
                                                {overview?.total_agents ?? 0}
                                         {" "}
                      </p>
                                         {" "}
                    </div>
                                       {" "}
                    <div className="rounded-xl bg-purple-50 p-5">
                                           {" "}
                      <p className="text-xs text-slate-500">
                                                Samples
                         {" "}
                      </p>
                                           {" "}
                      <p className="mt-2 text-2xl font-bold">
                                                {overview?.total_samples ?? 0}
                                           {" "}
                      </p>
                                         {" "}
                    </div>
                                       {" "}
                    <div className="rounded-xl bg-orange-50 p-5">
                                           {" "}
                      <p className="text-xs text-slate-500">
                                                Pending
                         {" "}
                      </p>
                                           {" "}
                      <p className="mt-2 text-2xl font-bold">
                                                {overview?.pending_tests ?? 0}
                                           {" "}
                      </p>
                                         {" "}
                    </div>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                                {/* Soil Test Status */}               {" "}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                   {" "}
                  <div className="mb-5">
                                       {" "}
                    <h2 className="text-lg font-bold text-slate-900">
                                            Soil Test Status
                       {" "}
                    </h2>
                                       {" "}
                    <p className="mt-1 text-sm text-slate-500">
                                            Current testing pipeline.
                               {" "}
                    </p>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="space-y-4">
                                       {" "}
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                                           {" "}
                      <span className="font-medium">
                                                Completed
                         {" "}
                      </span>
                                           {" "}
                      <span className="font-bold text-emerald-700">
                                               {" "}
                        {data?.test_status.completed ?? 0}
                         {" "}
                      </span>
                                         {" "}
                    </div>
                                       {" "}
                    <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4">
                                           {" "}
                      <span className="font-medium">
                                                Pending
                         {" "}
                      </span>
                                           {" "}
                      <span className="font-bold text-amber-700">
                                                {data?.test_status.pending ?? 0}
                                             {" "}
                      </span>
                                         {" "}
                    </div>
                                       {" "}
                    <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">
                                           {" "}
                      <span className="font-medium">
                                                Failed
                         {" "}
                      </span>
                                           {" "}
                      <span className="font-bold text-red-700">
                                                {data?.test_status.failed ?? 0}
                                           {" "}
                      </span>
                                         {" "}
                    </div>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                             {" "}
              </section>
                           {" "}
              {/* ==================================================

                  AGENT PERFORMANCE + PLATFORM HEALTH

              ================================================== */}
                           {" "}
              <section className="mt-6 grid gap-6 xl:grid-cols-2">
                                {/* Agent Performance */}               {" "}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                   {" "}
                  <div className="mb-5">
                                       {" "}
                    <div className="flex items-center justify-between">
                                           {" "}
                      <div>
                                               {" "}
                        <h2 className="text-lg font-bold text-slate-900">
                                                    Top Performing Agents
                                           {" "}
                        </h2>
                                               {" "}
                        <p className="mt-1 text-sm text-slate-500">
                                                    Field operations
                          performance.                        {" "}
                        </p>
                                             {" "}
                      </div>
                                           {" "}
                      <UserCog size={22} className="text-blue-600" />
                             {" "}
                    </div>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="grid gap-3">
                    {data?.agent_performance?.length ? (
                      data.agent_performance.map((agent, index) => (
                        <div
                          key={agent.id}
                          className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                                {(agent.name?.charAt(0) || "A").toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="truncate font-semibold text-slate-900">
                                    {agent.name}
                                  </span>

                                  {index === 0 && (
                                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                                      #1 Top
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {agent.email}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                agent.active
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {agent.active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                            {[
                              ["Farmers", agent.farmers],
                              ["Farms", agent.farms],
                              ["Samples", agent.samples],
                              ["Tests", agent.tests],
                              ["Assessments", agent.assessments],
                              ["Score", agent.activity_score],
                            ].map(([label, value]) => (
                              <div
                                key={label}
                                className="rounded-lg bg-white px-2 py-3 text-center ring-1 ring-slate-100"
                              >
                                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                  {label}
                                </p>
                                <p className="mt-1 text-lg font-bold text-slate-900">
                                  {value ?? 0}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                        No field agents available yet.
                      </div>
                    )}
                  </div>
                                    {/* Agent summary */}                 {" "}
                  {data?.agent_performance?.length ? (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                                           {" "}
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                               {" "}
                        <span>
                                                   {" "}
                          {data.agent_performance.length} agent
                                   {" "}
                          {data.agent_performance.length !== 1 ? "s" : ""}
                                              shown                        {" "}
                        </span>
                                               {" "}
                        <span>
                                                    •
                           {" "}
                        </span>
                                               {" "}
                        <span>
                                                    Ranked by operational
                          activity                        {" "}
                        </span>
                                             {" "}
                      </div>
                                         {" "}
                    </div>
                  ) : null}
                                 {" "}
                </div>
                                {/* Platform Health */}               {" "}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                   {" "}
                  <div className="mb-5">
                                       {" "}
                    <h2 className="text-lg font-bold text-slate-900">
                                            Platform Health
                       {" "}
                    </h2>
                                       {" "}
                    <p className="mt-1 text-sm text-slate-500">
                                            Operational service status.
                                 {" "}
                    </p>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="space-y-4">
                                        {/* API */}                   {" "}
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                                           {" "}
                      <div className="flex items-center gap-3">
                                               {" "}
                        <CheckCircle2 size={20} className="text-emerald-600" />
                                             {" "}
                        <div>
                                                   {" "}
                          <p className="font-semibold">
                                                        API
                                 {" "}
                          </p>
                                                   {" "}
                          <p className="text-xs text-slate-500">
                                                        Backend service
                                             {" "}
                          </p>
                                                 {" "}
                        </div>
                                             {" "}
                      </div>
                                           {" "}
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                {data?.system.api}
                               {" "}
                      </span>
                                         {" "}
                    </div>
                                        {/* DATABASE */}                   {" "}
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                                           {" "}
                      <div className="flex items-center gap-3">
                                               {" "}
                        <Database size={20} className="text-emerald-600" />
                                         {" "}
                        <div>
                                                   {" "}
                          <p className="font-semibold">
                                                        Database
                                     {" "}
                          </p>
                                                   {" "}
                          <p className="text-xs text-slate-500">
                                                        PostgreSQL
                                       {" "}
                          </p>
                                                 {" "}
                        </div>
                                             {" "}
                      </div>
                                           {" "}
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                {data?.system.database}
                                   {" "}
                      </span>
                                         {" "}
                    </div>
                                        {/* WEATHER */}                   {" "}
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                                           {" "}
                      <div className="flex items-center gap-3">
                                               {" "}
                        <Bell size={20} className="text-emerald-600" />
                                     {" "}
                        <div>
                                                   {" "}
                          <p className="font-semibold">
                                                        Weather Service
                                             {" "}
                          </p>
                                                   {" "}
                          <p className="text-xs text-slate-500">
                                                        Agricultural weather
                            data                          {" "}
                          </p>
                                                 {" "}
                        </div>
                                             {" "}
                      </div>
                                           {" "}
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                {data?.system.weather}
                                   {" "}
                      </span>
                                         {" "}
                    </div>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                             {" "}
              </section>
                           {" "}
              {/* ==================================================

                  RECENT FARMERS + RECENT FARMS

              ================================================== */}
                           {" "}
              <section className="mt-6 grid gap-6 xl:grid-cols-2">
                                {/* Recent Farmers */}               {" "}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                   {" "}
                  <div className="mb-5 flex items-center justify-between">
                                       {" "}
                    <div>
                                           {" "}
                      <h2 className="text-lg font-bold text-slate-900">
                                                Recent Farmers
                           {" "}
                      </h2>
                                           {" "}
                      <p className="text-sm text-slate-500">
                                                Latest farmer registrations.
                                         {" "}
                      </p>
                                         {" "}
                    </div>
                                       {" "}
                    <Users size={22} className="text-emerald-600" />
                         {" "}
                  </div>
                                   {" "}
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                                       {" "}
                    <div className="space-y-3">
                      {data?.recent_farmers?.length ? (
                        data.recent_farmers.map((farmer) => (
                          <div
                            key={farmer.id}
                            className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                                {(farmer.name?.charAt(0) || "F").toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {farmer.name}
                                </p>
                                <p className="truncate text-xs text-slate-400">
                                  {farmer.farmer_id}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm sm:flex sm:items-center sm:gap-8">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Registered by
                                </p>
                                <p className="mt-1 font-medium text-slate-700">
                                  {farmer.agent || "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Date
                                </p>
                                <p className="mt-1 font-medium text-slate-700">
                                  {farmer.created_at
                                    ? new Date(
                                        farmer.created_at,
                                      ).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                          No recent farmer registrations.
                        </div>
                      )}
                    </div>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                                {/* Recent Farms */}               {" "}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                   {" "}
                  <div className="mb-5 flex items-center justify-between">
                                       {" "}
                    <div>
                                           {" "}
                      <h2 className="text-lg font-bold text-slate-900">
                                                Recent Farms
                         {" "}
                      </h2>
                                           {" "}
                      <p className="text-sm text-slate-500">
                                                Latest farm registrations.
                                       {" "}
                      </p>
                                         {" "}
                    </div>
                                       {" "}
                    <Sprout size={22} className="text-green-600" />
                       {" "}
                  </div>
                                   {" "}
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                                       {" "}
                    <div className="space-y-3">
                      {data?.recent_farms?.length ? (
                        data.recent_farms.map((farm) => (
                          <div
                            key={farm.id}
                            className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                                <Sprout size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {farm.farm_name}
                                </p>
                                <p className="truncate text-xs text-slate-400">
                                  {farm.farm_id}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm sm:flex sm:items-center sm:gap-8">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Farmer
                                </p>
                                <p className="mt-1 font-medium text-slate-700">
                                  {farm.farmer || "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Size
                                </p>
                                <p className="mt-1 font-semibold text-emerald-700">
                                  {farm.size ?? 0} ha
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                          No recent farm registrations.
                        </div>
                      )}
                    </div>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                             {" "}
              </section>
                           {" "}
              {/* ==================================================

                  RECENT SOIL TESTS

              ================================================== */}
                           {" "}
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                               {" "}
                <div className="mb-5 flex items-center justify-between">
                                   {" "}
                  <div>
                                       {" "}
                    <h2 className="text-lg font-bold text-slate-900">
                                            Recent Soil Test Activity
                               {" "}
                    </h2>
                                       {" "}
                    <p className="text-sm text-slate-500">
                                            Latest soil tests across the
                      platform.                    {" "}
                    </p>
                                     {" "}
                  </div>
                                   {" "}
                  <TestTube2 size={22} className="text-rose-600" />
                   {" "}
                </div>
                               {" "}
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                                   {" "}
                  <div className="space-y-3">
                    {data?.recent_tests?.length ? (
                      data.recent_tests.map((test) => (
                        <div
                          key={test.id}
                          className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {test.sample_id}
                              </p>
                              <p className="mt-1 truncate text-xs text-slate-400">
                                Test ID: {test.id}
                              </p>
                            </div>
                            <span
                              className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                                test.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : test.status === "FAILED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {test.status}
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Farmer
                              </p>
                              <p className="mt-1 truncate text-sm font-medium text-slate-700">
                                {test.farmer || "—"}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Farm
                              </p>
                              <p className="mt-1 truncate text-sm font-medium text-slate-700">
                                {test.farm_name || "—"}
                              </p>
                            </div>
                            <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Date
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-700">
                                {test.created_at
                                  ? new Date(
                                      test.created_at,
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                        No recent soil test activity.
                      </div>
                    )}
                  </div>
                                 {" "}
                </div>
                             {" "}
              </section>
                           {" "}
              {/* ==================================================

                  COVERAGE + SOIL HEALTH

              ================================================== */}
                           {" "}
              <section className="mt-6 grid gap-6 lg:grid-cols-2">
                                {/* Farmer Coverage */}               {" "}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                   {" "}
                  <div className="mb-5">
                                       {" "}
                    <h2 className="text-lg font-bold text-slate-900">
                                            Farmer Coverage
                       {" "}
                    </h2>
                                       {" "}
                    <p className="text-sm text-slate-500">
                                            Geographic platform coverage.
                                   {" "}
                    </p>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {mapFarms.length > 0 ? (
                      <FarmMap
                        farms={mapFarms}
                        selectedFarm={selectedMapFarm}
                        onFarmSelect={setSelectedMapFarm}
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center bg-slate-50 px-6 text-center">
                        <div>
                          <Map size={42} className="mx-auto text-slate-300" />
                          <p className="mt-3 font-semibold text-slate-600">
                            No farm map data available
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            Farms will appear here once GPS coordinates are
                            available.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                                 {" "}
                </div>
                                {/* Soil Health */}               {" "}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                   {" "}
                  <div className="mb-5">
                                       {" "}
                    <h2 className="text-lg font-bold text-slate-900">
                                            Soil Health Overview
                         {" "}
                    </h2>
                                       {" "}
                    <p className="text-sm text-slate-500">
                                            Aggregate soil indicators.
                               {" "}
                    </p>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                                       {" "}
                    {[
                      ["pH", data?.soil_health.pH],

                      ["Nitrogen", data?.soil_health.nitrogen],

                      ["Phosphorus", data?.soil_health.phosphorus],

                      ["Potassium", data?.soil_health.potassium],

                      ["Organic Matter", data?.soil_health.organic_matter],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl bg-slate-50 p-4 text-center"
                      >
                                                 {" "}
                        <p className="text-xs font-medium text-slate-500">
                                                      {label}
                               {" "}
                        </p>
                                                 {" "}
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                                      {value ?? "—"}
                                       {" "}
                        </p>
                                               {" "}
                      </div>
                    ))}
                                     {" "}
                  </div>
                                 {" "}
                </div>
                             {" "}
              </section>
                         {" "}
            </>
          )}
                   {" "}
          {/* ====================================================

              FOOTER

          ==================================================== */}
                   {" "}
          <footer className="py-8 text-center text-sm text-slate-400">
                        SoilGenie Admin Portal • AI-powered soil intelligence
                   {" "}
          </footer>
                 {" "}
        </div>
             {" "}
      </main>
         {" "}
    </div>
  );
}
