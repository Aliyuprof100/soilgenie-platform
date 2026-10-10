import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getFarmers } from "../services/farmers";
import type { Farmer } from "../services/farmers";


function formatDate(value?: string | null): string {
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


function statusClasses(status?: string): string {
  return (status || "ACTIVE") === "ACTIVE"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-100 text-slate-600";
}


export default function AdminFarmers() {
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [agentFilter, setAgentFilter] = useState("ALL");


  async function loadFarmers() {
    try {
      setLoading(true);
      setError("");

      const data = await getFarmers();

      setFarmers(data);
    } catch (err) {
      console.error(
        "Error loading admin farmers:",
        err
      );

      setError(
        "Unable to load farmers. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  useEffect(() => {
    void loadFarmers();
  }, []);


  const states = useMemo(() => {
    return Array.from(
      new Set(
        farmers
          .map((farmer) => farmer.state)
          .filter(Boolean)
      )
    ).sort();
  }, [farmers]);


  const agents = useMemo(() => {
    return Array.from(
      new Set(
        farmers
          .map(
            (farmer) =>
              farmer.registered_by_name
          )
          .filter(Boolean)
      )
    ).sort();
  }, [farmers]);


  const filteredFarmers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return farmers.filter((farmer) => {
      const searchable = [
        farmer.farmer_id,
        farmer.first_name,
        farmer.last_name,
        farmer.phone_number,
        farmer.email,
        farmer.state,
        farmer.lga,
        farmer.ward,
        farmer.village,
        farmer.primary_crop,
        farmer.registered_by_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


      const matchesSearch =
        !query ||
        searchable.includes(query);


      const matchesStatus =
        statusFilter === "ALL" ||
        (farmer.status || "ACTIVE") ===
          statusFilter;


      const matchesState =
        stateFilter === "ALL" ||
        farmer.state === stateFilter;


      const matchesAgent =
        agentFilter === "ALL" ||
        (farmer.registered_by_name ||
          "Unknown") === agentFilter;


      return (
        matchesSearch &&
        matchesStatus &&
        matchesState &&
        matchesAgent
      );
    });
  }, [
    farmers,
    search,
    statusFilter,
    stateFilter,
    agentFilter,
  ]);


  const activeCount =
    farmers.filter(
      (farmer) =>
        (farmer.status || "ACTIVE") ===
        "ACTIVE"
    ).length;


  const inactiveCount =
    farmers.filter(
      (farmer) =>
        farmer.status === "INACTIVE"
    ).length;


  const hasFilters =
    Boolean(search) ||
    statusFilter !== "ALL" ||
    stateFilter !== "ALL" ||
    agentFilter !== "ALL";


  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setStateFilter("ALL");
    setAgentFilter("ALL");
  }


  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b bg-white">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                navigate("/admin")
              }
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Back to admin dashboard"
            >
              <ArrowLeft size={20} />
            </button>


            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                SoilGenie Administration
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Farmer Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage and monitor farmers
                registered across the platform.
              </p>

            </div>

          </div>


          <button
            type="button"
            disabled={refreshing}
            onClick={() => {
              setRefreshing(true);
              void loadFarmers();
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>
      </header>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="p-4 sm:p-6">

        <div className="mx-auto max-w-[1600px] space-y-6">


          {/* =================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              icon={
                <Users size={22} />
              }
              iconClass="bg-emerald-50 text-emerald-600"
              label="Total Farmers"
              value={farmers.length}
              detail="Registered on SoilGenie"
            />


            <SummaryCard
              icon={
                <UserRound size={22} />
              }
              iconClass="bg-blue-50 text-blue-600"
              label="Active Farmers"
              value={activeCount}
              detail="Currently active"
            />


            <SummaryCard
              icon={
                <X size={22} />
              }
              iconClass="bg-slate-100 text-slate-600"
              label="Inactive Farmers"
              value={inactiveCount}
              detail="Currently inactive"
            />


            <SummaryCard
              icon={
                <MapPin size={22} />
              }
              iconClass="bg-purple-50 text-purple-600"
              label="States Represented"
              value={states.length}
              detail="Across the platform"
            />

          </div>


          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">

              <span>
                {error}
              </span>


              <button
                type="button"
                onClick={() =>
                  void loadFarmers()
                }
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm"
              >
                Retry
              </button>

            </div>
          )}


          {/* =================================================
              FARMER MANAGEMENT
          ================================================== */}

          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">


            {/* =================================================
                FILTER BAR
            ================================================== */}

            <div className="border-b border-slate-200 p-4 sm:p-5">

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">


                {/* SEARCH */}

                <div className="relative min-w-0 flex-1">

                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search by name, Farmer ID, phone, location, crop or agent..."
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                </div>


                {/* STATUS */}

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
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


                {/* STATE */}

                <select
                  value={stateFilter}
                  onChange={(event) =>
                    setStateFilter(
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
                >

                  <option value="ALL">
                    All States
                  </option>

                  {states.map(
                    (state) => (
                      <option
                        key={state}
                        value={state}
                      >
                        {state}
                      </option>
                    )
                  )}

                </select>


                {/* AGENT */}

                <select
                  value={agentFilter}
                  onChange={(event) =>
                    setAgentFilter(
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
                >

                  <option value="ALL">
                    All Agents
                  </option>

                  {agents.map(
                    (agent) => (
                      <option
                        key={agent}
                        value={agent}
                      >
                        {agent}
                      </option>
                    )
                  )}

                </select>


                {/* CLEAR */}

                {hasFilters && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >

                    <X size={16} />

                    Clear

                  </button>
                )}

              </div>


              {/* FILTER SUMMARY */}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">

                <span>

                  Showing{" "}

                  <strong className="text-slate-800">
                    {
                      filteredFarmers.length
                    }
                  </strong>

                  {" "}of{" "}

                  <strong className="text-slate-800">
                    {farmers.length}
                  </strong>

                  {" "}farmers

                </span>


                <span className="inline-flex items-center gap-1.5">

                  <Filter size={14} />

                  Platform-wide
                  administrator view

                </span>

              </div>

            </div>


            {/* =================================================
                LOADING
            ================================================== */}

            {loading ? (

              <div className="flex min-h-72 items-center justify-center">

                <div className="text-center">

                  <RefreshCw
                    size={30}
                    className="mx-auto animate-spin text-emerald-600"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading farmers...
                  </p>

                </div>

              </div>

            ) : filteredFarmers.length === 0 ? (

              /* =================================================
                 EMPTY STATE
              ================================================== */

              <div className="flex min-h-72 items-center justify-center p-8 text-center">

                <div>

                  <Users
                    size={42}
                    className="mx-auto text-slate-300"
                  />

                  <h2 className="mt-4 text-lg font-bold text-slate-800">
                    No farmers found
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">

                    {hasFilters
                      ? "Try changing your search or filters."
                      : "There are no farmers registered on the platform yet."}

                  </p>


                  {hasFilters && (
                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="mt-5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                      Clear Filters
                    </button>
                  )}

                </div>

              </div>

            ) : (

              /* =================================================
                 FARMER TABLE
              ================================================== */

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead>

                    <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-400">

                      <th className="px-5 py-4">
                        Farmer
                      </th>

                      <th className="px-5 py-4">
                        Contact
                      </th>

                      <th className="px-5 py-4">
                        Location
                      </th>

                      <th className="px-5 py-4">
                        Crop
                      </th>

                      <th className="px-5 py-4">
                        Farms
                      </th>

                      <th className="px-5 py-4">
                        Registered By
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4">
                        Registered
                      </th>

                      <th className="px-5 py-4 text-right">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {filteredFarmers.map(
                      (farmer) => (

                        <tr
                          key={farmer.id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* FARMER */}

                          <td className="px-5 py-4">

                            <p className="font-semibold text-slate-900">
                              {
                                farmer.first_name
                              }{" "}
                              {
                                farmer.last_name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                farmer.farmer_id
                              }
                            </p>

                          </td>


                          {/* CONTACT */}

                          <td className="px-5 py-4">

                            <p className="text-slate-700">
                              {
                                farmer.phone_number
                              }
                            </p>

                            {farmer.email && (
                              <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                                {
                                  farmer.email
                                }
                              </p>
                            )}

                          </td>


                          {/* LOCATION */}

                          <td className="px-5 py-4">

                            <p className="text-slate-800">

                              {
                                farmer.lga
                              }
                              ,{" "}
                              {
                                farmer.state
                              }

                            </p>

                            {farmer.village && (
                              <p className="mt-1 text-xs text-slate-400">
                                {
                                  farmer.village
                                }
                              </p>
                            )}

                          </td>


                          {/* CROP */}

                          <td className="px-5 py-4 text-slate-700">

                            {
                              farmer.primary_crop ||
                              "—"
                            }

                          </td>


                          {/* FARMS */}

                          <td className="px-5 py-4 font-semibold text-slate-800">

                            {
                              farmer.number_of_farms ??
                              0
                            }

                          </td>


                          {/* REGISTERED BY */}

                          <td className="px-5 py-4 text-slate-700">

                            {
                              farmer.registered_by_name ||
                              "—"
                            }

                          </td>


                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                                farmer.status
                              )}`}
                            >

                              {
                                farmer.status ||
                                "ACTIVE"
                              }

                            </span>

                          </td>


                          {/* DATE */}

                          <td className="px-5 py-4 text-slate-500">

                            {
                              formatDate(
                                farmer.created_at
                              )
                            }

                          </td>


                          {/* ACTION */}

                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/farmers/${farmer.id}`
                                )
                              }
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              View Farmer
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon,
  iconClass,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: number;
  detail: string;
}) {
  return (

    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {detail}
      </p>

    </div>
  );
}