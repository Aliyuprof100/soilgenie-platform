import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getFarms } from "../services/farms";
import type { Farm } from "../services/farms";
import FarmMap from "../components/farms/FarmMap";

export default function AdminFarms() {
  const navigate = useNavigate();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [gpsFilter, setGpsFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  async function loadFarms() {
    try {
      setLoading(true);
      setError("");

      const data = await getFarms();

      setFarms(data);
    } catch (err) {
      console.error("Unable to load admin farms:", err);

      setError(
        "Unable to load farms. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFarms();
  }, []);

  /* ============================================================
     FILTER OPTIONS
  ============================================================ */

  const crops = useMemo(() => {
    return Array.from(
      new Set(
        farms
          .map((farm) => farm.primary_crop)
          .filter(
            (crop): crop is string =>
              Boolean(crop && crop.trim())
          )
      )
    ).sort();
  }, [farms]);

  const states = useMemo(() => {
    return Array.from(
      new Set(
        farms
          .map((farm) => farm.state)
          .filter(
            (state): state is string =>
              Boolean(state && state.trim())
          )
      )
    ).sort();
  }, [farms]);

  /* ============================================================
     FILTERED FARMS
  ============================================================ */

  const filteredFarms = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return farms.filter((farm) => {
      const matchesSearch =
        !searchValue ||
        farm.farm_id.toLowerCase().includes(searchValue) ||
        farm.farm_name.toLowerCase().includes(searchValue) ||
        farm.farmer_name.toLowerCase().includes(searchValue) ||
        farm.state.toLowerCase().includes(searchValue) ||
        farm.lga.toLowerCase().includes(searchValue) ||
        (farm.primary_crop || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesCrop =
        !cropFilter ||
        farm.primary_crop === cropFilter;

      const matchesStatus =
        !statusFilter ||
        farm.status === statusFilter;

      const matchesState =
        !stateFilter ||
        farm.state === stateFilter;

      const hasGPS =
        farm.latitude !== null &&
        farm.latitude !== undefined &&
        farm.longitude !== null &&
        farm.longitude !== undefined;

      const matchesGPS =
        !gpsFilter ||
        (gpsFilter === "CAPTURED" && hasGPS) ||
        (gpsFilter === "MISSING" && !hasGPS);

      return (
        matchesSearch &&
        matchesCrop &&
        matchesStatus &&
        matchesState &&
        matchesGPS
      );
    });
  }, [
    farms,
    search,
    cropFilter,
    statusFilter,
    stateFilter,
    gpsFilter,
  ]);

  /* ============================================================
     STATISTICS
  ============================================================ */

  const totalArea = useMemo(() => {
    return farms.reduce(
      (total, farm) =>
        total + Number(farm.farm_size || 0),
      0
    );
  }, [farms]);

  const activeFarms = farms.filter(
    (farm) => farm.status === "ACTIVE"
  ).length;

  const inactiveFarms = farms.filter(
    (farm) => farm.status !== "ACTIVE"
  ).length;

  const farmsWithGPS = farms.filter(
    (farm) =>
      farm.latitude !== null &&
      farm.latitude !== undefined &&
      farm.longitude !== null &&
      farm.longitude !== undefined
  ).length;

  const statesRepresented = new Set(
    farms.map((farm) => farm.state).filter(Boolean)
  ).size;

  /* ============================================================
     HELPERS
  ============================================================ */

  function hasGPS(farm: Farm) {
    return (
      farm.latitude !== null &&
      farm.latitude !== undefined &&
      farm.longitude !== null &&
      farm.longitude !== undefined
    );
  }

  function formatDate(value: string) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function handleFarmSelect(farm: Farm) {
    setSelectedFarm(farm);
  }

  function handleViewFarm(farm: Farm) {
    navigate(`/admin/farms/${farm.id}`);
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              SoilGenie Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Farm Management
            </h1>

            <p className="mt-2 text-slate-500">
              Manage and monitor all farms registered across
              the SoilGenie platform.
            </p>
          </div>

          <button
            type="button"
            onClick={loadFarms}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>

        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">
              Unable to load farms
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* ======================================================
            STATISTICS
        ====================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Farms
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {farms.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Registered on SoilGenie
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Farm Area
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {totalArea.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              hectares registered
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Farms
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {activeFarms}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently active
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              GPS Captured
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {farmsWithGPS}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Farms with coordinates
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              States Represented
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {statesRepresented}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Across the platform
            </p>
          </div>

        </div>

        {/* ======================================================
            MAP
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Geographic Coverage
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              SoilGenie Farm Intelligence Map
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View the geographic distribution of registered
              farms across the platform.
            </p>
          </div>

          <FarmMap
            farms={filteredFarms}
            selectedFarm={selectedFarm}
            onFarmSelect={handleFarmSelect}
          />

        </div>

        {/* ======================================================
            SELECTED FARM
        ====================================================== */}

        {selectedFarm && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                  Selected Farm
                </p>

                <h2 className="mt-1 text-2xl font-bold text-green-950">
                  {selectedFarm.farm_name}
                </h2>

                <p className="mt-1 text-sm text-green-800">
                  {selectedFarm.farm_id}
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <div>
                    <p className="text-xs text-green-700">
                      Farmer
                    </p>

                    <p className="font-semibold text-green-950">
                      {selectedFarm.farmer_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-green-700">
                      Location
                    </p>

                    <p className="font-semibold text-green-950">
                      {selectedFarm.lga}, {selectedFarm.state}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-green-700">
                      Farm Size
                    </p>

                    <p className="font-semibold text-green-950">
                      {selectedFarm.farm_size} hectares
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-green-700">
                      Primary Crop
                    </p>

                    <p className="font-semibold text-green-950">
                      {selectedFarm.primary_crop || "—"}
                    </p>
                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  handleViewFarm(selectedFarm)
                }
                className="whitespace-nowrap rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
              >
                View Farm Profile →
              </button>

            </div>

          </div>
        )}

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Farm Registry
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and filter farms across the SoilGenie platform.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

            <div className="xl:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Farm ID, farm name, farmer, LGA..."
                className="w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                State
              </label>

              <select
                value={stateFilter}
                onChange={(e) =>
                  setStateFilter(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-green-600"
              >
                <option value="">
                  All States
                </option>

                {states.map((state) => (
                  <option
                    key={state}
                    value={state}
                  >
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Crop
              </label>

              <select
                value={cropFilter}
                onChange={(e) =>
                  setCropFilter(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-green-600"
              >
                <option value="">
                  All Crops
                </option>

                {crops.map((crop) => (
                  <option
                    key={crop}
                    value={crop}
                  >
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-green-600"
              >
                <option value="">
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

          <div className="mt-4 max-w-xs">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              GPS
            </label>

            <select
              value={gpsFilter}
              onChange={(e) =>
                setGpsFilter(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-green-600"
            >
              <option value="">
                All Farms
              </option>

              <option value="CAPTURED">
                GPS Captured
              </option>

              <option value="MISSING">
                GPS Missing
              </option>
            </select>

          </div>

        </div>

        {/* ======================================================
            RESULTS SUMMARY
        ====================================================== */}

        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Registered Farms
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredFarms.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {farms.length}
              </span>{" "}
              farms
            </p>
          </div>

          {inactiveFarms > 0 && (
            <p className="text-sm text-slate-500">
              {inactiveFarms} inactive farm
              {inactiveFarms === 1 ? "" : "s"}
            </p>
          )}

        </div>

        {/* ======================================================
            FARM TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading farms...
            </div>
          ) : filteredFarms.length === 0 ? (
            <div className="p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🌱
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No farms found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] text-left">

                <thead className="border-b bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Farm
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Farmer
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Location
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Size
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Crop
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Irrigation
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      GPS
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Registered
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredFarms.map((farm) => {

                    const farmHasGPS = hasGPS(farm);

                    const isSelected =
                      selectedFarm?.id === farm.id;

                    return (
                      <tr
                        key={farm.id}
                        className={`transition ${
                          isSelected
                            ? "bg-green-50"
                            : "hover:bg-slate-50"
                        }`}
                      >

                        {/* FARM */}

                        <td className="px-6 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              handleFarmSelect(farm)
                            }
                            className="font-bold text-green-700 hover:underline"
                          >
                            {farm.farm_id}
                          </button>

                          <p className="mt-1 font-semibold text-slate-800">
                            {farm.farm_name}
                          </p>

                        </td>

                        {/* FARMER */}

                        <td className="px-6 py-5">

                          <p className="font-semibold text-slate-800">
                            {farm.farmer_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Farmer ID #{farm.farmer}
                          </p>

                        </td>

                        {/* LOCATION */}

                        <td className="px-6 py-5">

                          <p className="font-medium text-slate-800">
                            {farm.lga}
                          </p>

                          <p className="text-sm text-slate-500">
                            {farm.state}
                          </p>

                          {farm.village && (
                            <p className="mt-1 text-xs text-slate-400">
                              {farm.village}
                            </p>
                          )}

                        </td>

                        {/* SIZE */}

                        <td className="px-6 py-5">

                          <p className="font-semibold text-slate-800">
                            {Number(farm.farm_size).toFixed(2)} ha
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {farm.farming_type}
                          </p>

                        </td>

                        {/* CROP */}

                        <td className="px-6 py-5">

                          <p className="font-medium text-slate-800">
                            {farm.primary_crop || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {farm.ownership_type}
                          </p>

                        </td>

                        {/* IRRIGATION */}

                        <td className="px-6 py-5">

                          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                            {farm.irrigation_type}
                          </span>

                        </td>

                        {/* GPS */}

                        <td className="px-6 py-5">

                          {farmHasGPS ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              📍 Captured
                            </span>
                          ) : (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                              Not captured
                            </span>
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              farm.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {farm.status}
                          </span>

                        </td>

                        {/* DATE */}

                        <td className="px-6 py-5">

                          <p className="whitespace-nowrap text-sm font-medium text-slate-700">
                            {formatDate(farm.created_at)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            By {farm.registered_by_name || "—"}
                          </p>

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5">

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleFarmSelect(farm)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Map
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleViewFarm(farm)
                              }
                              className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-800"
                            >
                              View Farm
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}