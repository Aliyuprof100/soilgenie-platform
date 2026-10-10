import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import api from "../api/api";

/* ==========================================================================
   TYPES
============================================================================= */

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
}

interface Statistics {
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

interface RecentFarmer {
  id: string;
  farmer_id: string;
  name: string;
  phone_number: string;
  state: string;
  lga: string;
  status: string;
  created_at: string | null;
}

interface RecentFarm {
  id: string;
  farm_id: string;
  farm_name: string;
  farmer: string;
  farmer_id: string | null;
  farm_size: number;
  primary_crop: string | null;
  state: string;
  lga: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
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

interface AgentProfileResponse {
  agent: Agent;
  statistics: Statistics;
  recent_farmers: RecentFarmer[];
  recent_farms: RecentFarm[];
  recent_tests: RecentTest[];
}

/* ==========================================================================
   HELPERS
============================================================================= */

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLabel(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function testStatusClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    case "PROCESSING":
      return "bg-blue-100 text-blue-700";

    case "PENDING":
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function recordStatusClass(status: string) {
  return status === "ACTIVE"
    ? "bg-green-100 text-green-700"
    : "bg-slate-100 text-slate-600";
}

function getPerformanceLevel(score: number) {
  if (score >= 80) {
    return {
      label: "Excellent",
      description: "Very strong operational performance",
      bar: "bg-green-500",
      text: "text-green-700",
      bg: "bg-green-50",
    };
  }

  if (score >= 60) {
    return {
      label: "Good",
      description: "Consistent operational activity",
      bar: "bg-emerald-500",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
    };
  }

  if (score >= 40) {
    return {
      label: "Developing",
      description: "Moderate operational activity",
      bar: "bg-amber-500",
      text: "text-amber-700",
      bg: "bg-amber-50",
    };
  }

  return {
    label: "Low Activity",
    description: "Limited operational activity",
    bar: "bg-slate-400",
    text: "text-slate-600",
    bg: "bg-slate-50",
  };
}

/* ==========================================================================
   PAGE
============================================================================= */

export default function AdminAgentProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<AgentProfileResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* ==========================================================================
     LOAD AGENT
  ========================================================================== */

  const loadAgent = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setError("Agent ID is missing.");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await api.get<AgentProfileResponse>(
          `/auth/admin/agents/${id}/`,
        );

        setData(response.data);
      } catch (err: any) {
        console.error("Unable to load agent profile:", err);

        if (err?.response?.status === 404) {
          setError("Agent not found.");
        } else if (err?.response?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (err?.response?.status === 403) {
          setError("Administrator access is required.");
        } else {
          setError("Unable to load the agent profile. Please try again.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    void loadAgent();
  }, [loadAgent]);

  /* ==========================================================================
     LOADING
  ========================================================================== */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl">
              👤
            </div>

            <p className="mt-4 font-medium text-slate-500">
              Loading agent profile...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ==========================================================================
     ERROR
  ========================================================================== */

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => navigate("/admin/agents")}
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Agents
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="text-3xl">⚠️</div>

            <h2 className="mt-3 text-xl font-bold text-red-800">
              Unable to load agent
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error || "Agent information is unavailable."}
            </p>

            <button
              type="button"
              onClick={() => void loadAgent()}
              className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { agent, statistics, recent_farmers, recent_farms, recent_tests } =
    data;

  const performance = getPerformanceLevel(
    Math.max(0, Math.min(100, statistics.activity_score)),
  );

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ================================================================
            BREADCRUMB / HEADER
        ================================================================ */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="hover:text-green-700"
              >
                Admin Dashboard
              </button>

              <span>/</span>

              <button
                type="button"
                onClick={() => navigate("/admin/agents")}
                className="hover:text-green-700"
              >
                Agents
              </button>

              <span>/</span>

              <span className="text-slate-700">Agent Profile</span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Agent Profile
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Detailed operational profile and activity for this SoilGenie field
              agent.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/agents")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ← Back to Agents
            </button>

            <button
              type="button"
              onClick={() => void loadAgent(true)}
              disabled={refreshing}
              className="rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-800 disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* ================================================================
            AGENT HERO
        ================================================================ */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 px-6 py-8 text-white md:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-3xl font-bold ring-1 ring-white/20">
                  {agent.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold md:text-3xl">
                      {agent.name}
                    </h2>

                    <span
                      className={
                        agent.is_active
                          ? "rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20"
                          : "rounded-full bg-black/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20"
                      }
                    >
                      {agent.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-green-50">
                    SoilGenie Field Agent
                  </p>

                  <p className="mt-1 text-xs text-green-100">ID: {agent.id}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 md:min-w-[230px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-green-100">
                      Activity Score
                    </p>

                    <p className="mt-1 text-4xl font-bold">
                      {statistics.activity_score}
                      <span className="ml-1 text-lg font-medium text-green-100">
                        /100
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold">
                    {performance.label}
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className={`h-full rounded-full transition-all ${performance.bar}`}
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, statistics.activity_score),
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-green-100">
                  {performance.description}
                </p>
              </div>
            </div>
          </div>

          {/* Agent contact */}

          <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4 md:p-8">
            <InfoItem label="Email" value={agent.email} icon="✉" />

            <InfoItem label="Phone" value={agent.phone_number} icon="☎" />

            <InfoItem
              label="Date Joined"
              value={formatDate(agent.date_joined)}
              icon="📅"
            />

            <InfoItem label="Role" value={formatLabel(agent.role)} icon="👤" />
          </div>
        </section>

        {/* ================================================================
            ACCOUNT VERIFICATION
        ================================================================ */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Account & Verification
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current authentication and verification status.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <VerificationCard
              title="Account Status"
              verified={agent.is_active}
              positive="Active"
              negative="Inactive"
            />

            <VerificationCard
              title="Email Verification"
              verified={agent.email_verified}
              positive="Verified"
              negative="Not Verified"
            />

            <VerificationCard
              title="Phone Verification"
              verified={agent.phone_verified}
              positive="Verified"
              negative="Not Verified"
            />
          </div>
        </section>

        {/* ================================================================
            PERFORMANCE OVERVIEW
        ================================================================ */}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Performance Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Operational activity attributed to this field agent.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              title="Farmers"
              value={statistics.farmers}
              subtitle="Registered"
              icon="🌾"
            />

            <MetricCard
              title="Farms"
              value={statistics.farms}
              subtitle="Registered"
              icon="🌱"
            />

            <MetricCard
              title="Farm Area"
              value={statistics.farm_area.toFixed(2)}
              subtitle="hectares"
              icon="📐"
            />

            <MetricCard
              title="Soil Samples"
              value={statistics.samples}
              subtitle="Collected"
              icon="🧪"
            />

            <MetricCard
              title="Assessments"
              value={statistics.assessments}
              subtitle="Generated"
              icon="📊"
            />
          </div>
        </section>

        {/* ================================================================
    QUICK ACTIONS
================================================================ */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly explore the operational records associated with this
              agent.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate("/admin/farmers")}
              className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl group-hover:bg-white">
                  🌾
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Farmers</p>
                  <p className="text-xs text-slate-500">
                    {statistics.farmers} registered
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/farms")}
              className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl group-hover:bg-white">
                  🌱
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Farms</p>
                  <p className="text-xs text-slate-500">
                    {statistics.farms} registered
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/soil/samples")}
              className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl group-hover:bg-white">
                  🧪
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Soil Samples</p>
                  <p className="text-xs text-slate-500">
                    {statistics.samples} collected
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/agents")}
              className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl group-hover:bg-white">
                  👥
                </div>

                <div>
                  <p className="font-semibold text-slate-900">Agent Registry</p>
                  <p className="text-xs text-slate-500">Return to all agents</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* ================================================================
            SOIL TEST PIPELINE
        ================================================================ */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Soil Test Pipeline
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Soil testing activity associated with this agent.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PipelineCard
              title="Total Tests"
              value={statistics.tests}
              icon="🧪"
            />

            <PipelineCard
              title="Completed"
              value={statistics.completed_tests}
              icon="✓"
              tone="green"
            />

            <PipelineCard
              title="Pending"
              value={statistics.pending_tests}
              icon="◷"
              tone="amber"
            />

            <PipelineCard
              title="Failed"
              value={statistics.failed_tests}
              icon="!"
              tone="red"
            />
          </div>
        </section>

        {/* ================================================================
            RECENT FARMERS
        ================================================================ */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            title="Farmers Registered by Agent"
            description="Latest farmers registered through this agent."
            count={recent_farmers.length}
          />

          {recent_farmers.length === 0 ? (
            <EmptyState
              icon="🌾"
              title="No farmers registered"
              description="This agent has not registered any farmers yet."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="border-y border-slate-100 bg-slate-50">
                  <tr>
                    <TableHead>Farmer</TableHead>

                    <TableHead>Contact</TableHead>

                    <TableHead>Location</TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead>Registered</TableHead>

                    <TableHead align="right">Action</TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recent_farmers.map((farmer) => (
                    <tr
                      key={farmer.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {farmer.name}
                        </div>

                        <div className="mt-1 text-xs font-medium text-green-700">
                          {farmer.farmer_id}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {farmer.phone_number || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-800">
                          {farmer.lga || "—"}
                        </div>

                        <div className="text-xs text-slate-500">
                          {farmer.state || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${recordStatusClass(
                            farmer.status,
                          )}`}
                        >
                          {formatLabel(farmer.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(farmer.created_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/farmers/${farmer.id}`)
                          }
                          className="rounded-xl border border-green-200 bg-green-50 px-3.5 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                        >
                          View Farmer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================================================================
            RECENT FARMS
        ================================================================ */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            title="Farms Registered by Agent"
            description="Latest farms registered through this agent."
            count={recent_farms.length}
          />

          {recent_farms.length === 0 ? (
            <EmptyState
              icon="🌱"
              title="No farms registered"
              description="This agent has not registered any farms yet."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="border-y border-slate-100 bg-slate-50">
                  <tr>
                    <TableHead>Farm</TableHead>

                    <TableHead>Farmer</TableHead>

                    <TableHead>Size</TableHead>

                    <TableHead>Crop</TableHead>

                    <TableHead>Location</TableHead>

                    <TableHead>GPS</TableHead>

                    <TableHead>Registered</TableHead>

                    <TableHead align="right">Action</TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recent_farms.map((farm) => {
                    const hasGps =
                      farm.latitude !== null && farm.longitude !== null;

                    return (
                      <tr
                        key={farm.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {farm.farm_name}
                          </div>

                          <div className="mt-1 text-xs font-medium text-green-700">
                            {farm.farm_id}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-800">
                            {farm.farmer}
                          </div>

                          {farm.farmer_id && (
                            <div className="mt-1 text-xs text-slate-500">
                              {farm.farmer_id}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {farm.farm_size.toFixed(2)} ha
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {farm.primary_crop || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-800">
                            {farm.lga || "—"}
                          </div>

                          <div className="text-xs text-slate-500">
                            {farm.state || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {hasGps ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              📍 Captured
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                              No GPS
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(farm.created_at)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/farms/${farm.id}`)}
                            className="rounded-xl border border-green-200 bg-green-50 px-3.5 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                          >
                            View Farm
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================================================================
            RECENT SOIL TESTS
        ================================================================ */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            title="Recent Soil Tests"
            description="Latest soil testing activity associated with this agent."
            count={recent_tests.length}
          />

          {recent_tests.length === 0 ? (
            <EmptyState
              icon="🧪"
              title="No soil tests"
              description="No soil tests have been created from this agent's field operations yet."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-y border-slate-100 bg-slate-50">
                  <tr>
                    <TableHead>Test</TableHead>

                    <TableHead>Farmer</TableHead>

                    <TableHead>Farm</TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead>Created</TableHead>

                    <TableHead>Tested</TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recent_tests.map((test) => (
                    <tr key={test.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {test.test_id}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {test.sample_id || "No sample ID"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-800">
                        {test.farmer}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {test.farm_name}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${testStatusClass(
                            test.status,
                          )}`}
                        >
                          {formatLabel(test.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDateTime(test.created_at)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDateTime(test.tested_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================================================================
            OPERATIONAL SUMMARY
        ================================================================ */}

        <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm md:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-green-300">
                OPERATIONAL SUMMARY
              </p>

              <h2 className="mt-2 text-2xl font-bold">{agent.name}</h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                This agent has registered{" "}
                <span className="font-semibold text-white">
                  {statistics.farmers}
                </span>{" "}
                farmer
                {statistics.farmers === 1 ? "" : "s"},{" "}
                <span className="font-semibold text-white">
                  {statistics.farms}
                </span>{" "}
                farm
                {statistics.farms === 1 ? "" : "s"} covering{" "}
                <span className="font-semibold text-white">
                  {statistics.farm_area.toFixed(2)} hectares
                </span>
                .
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniMetric label="Farmers" value={statistics.farmers} />

              <MiniMetric label="Farms" value={statistics.farms} />

              <MiniMetric label="Samples" value={statistics.samples} />

              <MiniMetric label="Assessments" value={statistics.assessments} />
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

/* ==========================================================================
   INFO ITEM
============================================================================= */

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

/* ==========================================================================
   VERIFICATION CARD
============================================================================= */

function VerificationCard({
  title,
  verified,
  positive,
  negative,
}: {
  title: string;
  verified: boolean;
  positive: string;
  negative: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-800">{title}</p>

        <span
          className={
            verified
              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"
          }
        >
          {verified ? positive : negative}
        </span>
      </div>
    </div>
  );
}

/* ==========================================================================
   METRIC CARD
============================================================================= */

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PIPELINE CARD
============================================================================= */

function PipelineCard({
  title,
  value,
  icon,
  tone = "slate",
}: {
  title: string;
  value: number;
  icon: string;
  tone?: "slate" | "green" | "amber" | "red";
}) {
  const classes = {
    slate: "bg-slate-50 text-slate-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${classes[tone]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SECTION HEADER
============================================================================= */

function SectionHeader({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
        {count}
      </span>
    </div>
  );
}

/* ==========================================================================
   TABLE HEAD
============================================================================= */

function TableHead({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  const alignment =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  return (
    <th
      className={`px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 ${alignment}`}
    >
      {children}
    </th>
  );
}

/* ==========================================================================
   EMPTY STATE
============================================================================= */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-800">{title}</h3>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

/* ==========================================================================
   MINI METRIC
============================================================================= */

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/10">
      <p className="text-2xl font-bold text-white">{value}</p>

      <p className="mt-1 text-xs text-slate-300">{label}</p>
    </div>
  );
}
