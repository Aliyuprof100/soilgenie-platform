import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import api from "../api/api";

interface Agent {
  id: string;

  name: string;
  email: string;
  phone_number: string;
  role: string;

  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;

  date_joined: string | null;

  farmers: number;
  farms: number;
  farm_area: number;

  samples: number;
  tests: number;
  completed_tests: number;
  pending_tests: number;
  failed_tests: number;
  assessments: number;

  activity_score: number;
}

interface AgentsResponse {
  count: number;
  agents: Agent[];
}

export default function AdminAgents() {
  const navigate = useNavigate();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  /*
  |--------------------------------------------------------------------------
  | LOAD AGENTS
  |--------------------------------------------------------------------------
  */

  async function loadAgents(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get<AgentsResponse>(
        "/auth/admin/agents/"
      );

      setAgents(response.data.agents || []);
    } catch (err) {
      console.error("Error loading agents:", err);

      setError(
        "Unable to load agents. Please check the backend connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadAgents();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTERED AGENTS
  |--------------------------------------------------------------------------
  */

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return agents.filter((agent) => {
      const matchesSearch =
        !query ||
        agent.name.toLowerCase().includes(query) ||
        agent.email.toLowerCase().includes(query) ||
        agent.phone_number.toLowerCase().includes(query);

      const matchesStatus =
        status === "ALL" ||
        (status === "ACTIVE" && agent.is_active) ||
        (status === "INACTIVE" && !agent.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [agents, search, status]);

  /*
  |--------------------------------------------------------------------------
  | PLATFORM STATISTICS
  |--------------------------------------------------------------------------
  */

  const totalAgents = agents.length;

  const activeAgents = agents.filter(
    (agent) => agent.is_active
  ).length;

  const inactiveAgents = agents.filter(
    (agent) => !agent.is_active
  ).length;

  const totalFarmers = agents.reduce(
    (sum, agent) => sum + (agent.farmers || 0),
    0
  );

  const totalFarms = agents.reduce(
    (sum, agent) => sum + (agent.farms || 0),
    0
  );

  const totalSamples = agents.reduce(
    (sum, agent) => sum + (agent.samples || 0),
    0
  );

  const totalAssessments = agents.reduce(
    (sum, agent) => sum + (agent.assessments || 0),
    0
  );

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div>

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="transition hover:text-green-700"
              >
                Admin Dashboard
              </button>

              <span>/</span>

              <span>Agents</span>

            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Agent Management
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Manage and monitor field agents operating across the
              SoilGenie platform.
            </p>

          </div>

          <button
            type="button"
            onClick={() => loadAgents(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              className={refreshing ? "animate-spin" : ""}
            >
              ↻
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </div>

        {/* ============================================================
            ERROR
        ============================================================ */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ============================================================
            SUMMARY CARDS
        ============================================================ */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

          <StatCard
            label="Total Agents"
            value={totalAgents}
            description="Registered field agents"
            icon="👥"
          />

          <StatCard
            label="Active Agents"
            value={activeAgents}
            description="Currently active"
            icon="✓"
          />

          <StatCard
            label="Inactive Agents"
            value={inactiveAgents}
            description="Currently inactive"
            icon="○"
          />

          <StatCard
            label="Farmers"
            value={totalFarmers}
            description="Registered by agents"
            icon="🌾"
          />

          <StatCard
            label="Farms"
            value={totalFarms}
            description="Registered by agents"
            icon="🌱"
          />

          <StatCard
            label="Samples"
            value={totalSamples}
            description="Collected by agents"
            icon="🧪"
          />

        </div>

        {/* ============================================================
            PERFORMANCE SUMMARY
        ============================================================ */}

        <div className="grid gap-4 md:grid-cols-3">

          <SummaryCard
            title="Field Operations"
            value={totalFarmers + totalFarms}
            description="Farmers and farms registered"
            icon="🌾"
          />

          <SummaryCard
            title="Soil Operations"
            value={totalSamples}
            description="Soil samples collected"
            icon="🧪"
          />

          <SummaryCard
            title="Assessments"
            value={totalAssessments}
            description="Soil assessments generated"
            icon="📊"
          />

        </div>

        {/* ============================================================
            AGENT REGISTRY HEADER / FILTERS
        ============================================================ */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-lg font-bold text-slate-900">
                  Agent Registry
                </h2>

                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                  {filteredAgents.length}
                </span>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Search and review field agents across SoilGenie.
              </p>

            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

              {/* Search */}

              <div className="relative">

                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search agent..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:w-72"
                />

              </div>

              {/* Status */}

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>

            </div>

          </div>

        </div>

        {/* ============================================================
            AGENT REGISTRY
        ============================================================ */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {loading ? (

            <div className="p-14 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl">
                👥
              </div>

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading agents...
              </p>

            </div>

          ) : filteredAgents.length === 0 ? (

            <div className="p-14 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                👥
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No agents found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>

              {(search || status !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus("ALL");
                  }}
                  className="mt-5 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  Clear Filters
                </button>
              )}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px] text-left">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Agent
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                      Farmers
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                      Farms
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                      Farm Area
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                      Soil Operations
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                      Score
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredAgents.map((agent, index) => (

                    <tr
                      key={agent.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* ==================================================
                          AGENT
                      ================================================== */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">

                            {agent.name
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div className="min-w-0">

                            <div className="flex items-center gap-2">

                              <span className="truncate font-semibold text-slate-900">
                                {agent.name}
                              </span>

                              {index === 0 && (
                                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  #1
                                </span>
                              )}

                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              Field Agent
                            </div>

                          </div>

                        </div>

                      </td>

                      {/* ==================================================
                          CONTACT
                      ================================================== */}

                      <td className="px-5 py-5">

                        <div className="max-w-[220px]">

                          <div className="truncate text-sm font-medium text-slate-800">
                            {agent.email || "No email"}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {agent.phone_number || "No phone"}
                          </div>

                        </div>

                      </td>

                      {/* ==================================================
                          FARMERS
                      ================================================== */}

                      <td className="px-5 py-5 text-center">

                        <div className="inline-flex min-w-10 items-center justify-center rounded-lg bg-green-50 px-2.5 py-1.5 font-bold text-green-700">
                          {agent.farmers || 0}
                        </div>

                      </td>

                      {/* ==================================================
                          FARMS
                      ================================================== */}

                      <td className="px-5 py-5 text-center">

                        <div className="inline-flex min-w-10 items-center justify-center rounded-lg bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-700">
                          {agent.farms || 0}
                        </div>

                      </td>

                      {/* ==================================================
                          FARM AREA
                      ================================================== */}

                      <td className="px-5 py-5 text-center">

                        <div className="font-semibold text-slate-900">
                          {(agent.farm_area || 0).toFixed(2)}
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          hectares
                        </div>

                      </td>

                      {/* ==================================================
                          SOIL OPERATIONS
                      ================================================== */}

                      <td className="px-5 py-5">

                        <div className="flex min-w-[150px] flex-col gap-1.5">

                          <div className="flex items-center justify-center gap-2 text-xs">

                            <span className="rounded-md bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                              {agent.samples || 0} samples
                            </span>

                            <span className="rounded-md bg-purple-50 px-2 py-1 font-semibold text-purple-700">
                              {agent.tests || 0} tests
                            </span>

                          </div>

                          <div className="text-center text-[11px] text-slate-500">
                            {agent.assessments || 0} assessments
                          </div>

                        </div>

                      </td>

                      {/* ==================================================
                          SCORE
                      ================================================== */}

                      <td className="px-5 py-5 text-center">

                        <span className="inline-flex min-w-11 items-center justify-center rounded-xl bg-slate-100 px-3 py-2 font-bold text-slate-700">
                          {agent.activity_score || 0}
                        </span>

                      </td>

                      {/* ==================================================
                          STATUS
                      ================================================== */}

                      <td className="px-5 py-5 text-center">

                        <span
                          className={
                            agent.is_active
                              ? "inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700"
                              : "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"
                          }
                        >

                          <span
                            className={
                              agent.is_active
                                ? "h-1.5 w-1.5 rounded-full bg-green-600"
                                : "h-1.5 w-1.5 rounded-full bg-slate-400"
                            }
                          />

                          {agent.is_active
                            ? "ACTIVE"
                            : "INACTIVE"}

                        </span>

                      </td>

                      {/* ==================================================
                          ACTION
                      ================================================== */}

                      <td className="px-5 py-5 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/agents/${agent.id}`
                            )
                          }
                          className="whitespace-nowrap rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-100"
                        >
                          View Agent
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* ============================================================
            FOOTER
        ============================================================ */}

        <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <div>
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredAgents.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {agents.length}
            </span>{" "}
            agents
          </div>

          <div>
            Platform-wide administrator view
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}


/* ==========================================================================
   STAT CARD
============================================================================= */

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>

        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-lg">
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ==========================================================================
   SUMMARY CARD
============================================================================= */

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>

        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-lg">
          {icon}
        </div>

      </div>

    </div>
  );
}