import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getFarms } from "../services/farms";
import type { Farm } from "../services/farms";
import FarmMap from "../components/farms/FarmMap";

export default function Farms() {
  const navigate = useNavigate();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("");
  const [gpsFilter, setGpsFilter] = useState("");

  useEffect(() => {
    async function loadFarms() {
      try {
        setLoading(true);
        setError("");

        const data = await getFarms();

        setFarms(data);
      } catch (err) {
        console.error("Unable to load farms:", err);

        setError(
          "Unable to load farms. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFarms();
  }, []);

  const crops = useMemo(() => {
    const uniqueCrops = farms
      .map((farm) => farm.primary_crop)
      .filter(
        (crop): crop is string =>
          Boolean(crop && crop.trim())
      );

    return Array.from(new Set(uniqueCrops)).sort();
  }, [farms]);

  const filteredFarms = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return farms.filter((farm) => {
      const matchesSearch =
        !searchValue ||
        farm.farm_id
          .toLowerCase()
          .includes(searchValue) ||
        farm.farm_name
          .toLowerCase()
          .includes(searchValue) ||
        farm.farmer_name
          .toLowerCase()
          .includes(searchValue) ||
        farm.state
          .toLowerCase()
          .includes(searchValue) ||
        farm.lga
          .toLowerCase()
          .includes(searchValue);

      const matchesCrop =
        !cropFilter ||
        farm.primary_crop === cropFilter;

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
        matchesGPS
      );
    });
  }, [
    farms,
    search,
    cropFilter,
    gpsFilter,
  ]);

  const farmsWithGPS = farms.filter(
    (farm) =>
      farm.latitude !== null &&
      farm.latitude !== undefined &&
      farm.longitude !== null &&
      farm.longitude !== undefined
  ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Farms
            </h1>

            <p className="mt-2 text-slate-500">
              Manage and monitor farms registered on SoilGenie.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/agent/farms/register")
            }
            className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            + Register Farm
          </button>

        </div>

        {/* Statistics */}
        <div className="grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Farms
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {farms.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              GPS Captured
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {farmsWithGPS}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Showing
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {filteredFarms.length}
            </p>
          </div>
            {/* Farm Intelligence Map */}
        </div>
        <FarmMap
        farms={farms}
        />

        {/* Filters */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search
              </label>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Farm ID, farm name, farmer, LGA..."
                className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
              />
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
                className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
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
                GPS
              </label>

              <select
                value={gpsFilter}
                onChange={(e) =>
                  setGpsFilter(e.target.value)
                }
                className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
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

        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading farms...
            </div>
          ) : filteredFarms.length === 0 ? (
            <div className="p-10 text-center">

              <p className="text-lg font-semibold text-slate-700">
                No farms found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

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
                      GPS
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y">

                  {filteredFarms.map((farm) => {

                    const hasGPS =
                      farm.latitude !== null &&
                      farm.latitude !== undefined &&
                      farm.longitude !== null &&
                      farm.longitude !== undefined;

                    return (
                      <tr
                        key={farm.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/farms/${farm.id}`
                              )
                            }
                            className="font-bold text-green-700 hover:underline"
                          >
                            {farm.farm_id}
                          </button>

                          <p className="mt-1 text-sm text-slate-500">
                            {farm.farm_name}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="font-semibold text-slate-800">
                            {farm.farmer_name}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="font-medium text-slate-800">
                            {farm.lga}
                          </p>

                          <p className="text-sm text-slate-500">
                            {farm.state}
                          </p>

                        </td>

                        <td className="px-6 py-5">
                          {farm.farm_size} ha
                        </td>

                        <td className="px-6 py-5">
                          {farm.primary_crop || "—"}
                        </td>

                        <td className="px-6 py-5">

                          {hasGPS ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              📍 Captured
                            </span>
                          ) : (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                              Not captured
                            </span>
                          )}

                        </td>

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