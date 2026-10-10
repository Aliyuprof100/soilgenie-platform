import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getFarm } from "../services/farms";
import type { Farm } from "../services/farms";
import FarmMap from "../components/farms/FarmMap";

export default function AdminFarmProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFarm() {
    if (!id) {
      setError("Farm ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getFarm(Number(id));

      setFarm(data);
    } catch (err) {
      console.error("Unable to load farm:", err);

      setError(
        "Unable to load this farm. The farm may not exist or may no longer be available."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFarm();
  }, [id]);

  function formatDate(value?: string | null) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(value?: string | null) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function hasGPS() {
    return (
      farm?.latitude !== null &&
      farm?.latitude !== undefined &&
      farm?.longitude !== null &&
      farm?.longitude !== undefined
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-700" />

            <p className="mt-4 font-medium text-slate-600">
              Loading farm profile...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !farm) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-6">

          <button
            type="button"
            onClick={() => navigate("/admin/farms")}
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            ← Back to Farm Management
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-xl font-bold text-red-800">
              Unable to Load Farm
            </h1>

            <p className="mt-2 text-red-700">
              {error || "Farm record could not be found."}
            </p>

            <button
              type="button"
              onClick={loadFarm}
              className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              Try Again
            </button>
          </div>

        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ============================================================
            BACK NAVIGATION
        ============================================================ */}

        <button
          type="button"
          onClick={() => navigate("/admin/farms")}
          className="text-sm font-semibold text-green-700 hover:underline"
        >
          ← Back to Farm Management
        </button>

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">

            <div className="flex items-start gap-5">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                🌱
              </div>

              <div>

                <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                  SoilGenie Administration
                </p>

                <h1 className="mt-1 text-3xl font-bold text-slate-900">
                  {farm.farm_name}
                </h1>

                <p className="mt-1 font-mono text-sm text-slate-500">
                  {farm.farm_id}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      farm.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {farm.status}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {farm.farming_type}
                  </span>

                  {hasGPS() && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      📍 GPS Available
                    </span>
                  )}

                </div>

              </div>

            </div>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={loadFarm}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                ↻ Refresh
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/farmers/${farm.farmer}`)
                }
                className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-green-800"
              >
                View Farmer
              </button>

            </div>

          </div>

        </div>

        {/* ============================================================
            KEY FARM METRICS
        ============================================================ */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Farm Size
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {Number(farm.farm_size).toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              hectares
            </p>

          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Primary Crop
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {farm.primary_crop || "—"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Main agricultural crop
            </p>

          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Irrigation
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {farm.irrigation_type}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Water management system
            </p>

          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Ownership
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {farm.ownership_type}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Farm ownership arrangement
            </p>

          </div>

        </div>

        {/* ============================================================
            FARM INFORMATION
        ============================================================ */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* FARM PROFILE */}

          <div className="rounded-2xl border bg-white shadow-sm">

            <div className="border-b px-6 py-5">

              <h2 className="text-xl font-bold text-slate-900">
                Farm Profile
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Core agricultural information.
              </p>

            </div>

            <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-2">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Farm ID
                </p>

                <p className="mt-1 font-mono font-semibold text-slate-800">
                  {farm.farm_id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Farm Name
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {farm.farm_name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Farm Size
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {Number(farm.farm_size).toFixed(2)} hectares
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Primary Crop
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {farm.primary_crop || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Farming Type
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {farm.farming_type}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Irrigation
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {farm.irrigation_type}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Ownership
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {farm.ownership_type}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Status
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    farm.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {farm.status}
                </span>
              </div>

            </div>

          </div>

          {/* FARMER */}

          <div className="rounded-2xl border bg-white shadow-sm">

            <div className="border-b px-6 py-5">

              <h2 className="text-xl font-bold text-slate-900">
                Farmer
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Farmer associated with this farm.
              </p>

            </div>

            <div className="p-6">

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-5">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Farmer
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {farm.farmer_name}
                  </p>

                  <p className="mt-1 font-mono text-sm text-slate-500">
                    Farmer database ID: {farm.farmer}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/admin/farmers/${farm.farmer}`)
                  }
                  className="rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
                >
                  View Farmer →
                </button>

              </div>

              <div className="mt-6">

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Registered By
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {farm.registered_by_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Registration Date
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {formatDate(farm.created_at)}
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ============================================================
            LOCATION
        ============================================================ */}

        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <h2 className="text-xl font-bold text-slate-900">
              Farm Location
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Geographic and administrative location of the farm.
            </p>

          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-2">

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  State
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {farm.state || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  LGA
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {farm.lga || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Ward
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {farm.ward || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Village / Community
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {farm.village || "—"}
                </p>
              </div>

              <div className="sm:col-span-2">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Address
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {farm.address || "—"}
                </p>

              </div>

            </div>

            <div>

              {hasGPS() ? (
                <div className="overflow-hidden rounded-2xl border">

                  <FarmMap
                    farms={[farm]}
                    selectedFarm={farm}
                    onFarmSelect={() => undefined}
                  />

                </div>
              ) : (
                <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-slate-50">

                  <div className="text-center">

                    <div className="text-4xl">
                      📍
                    </div>

                    <p className="mt-3 font-semibold text-slate-800">
                      GPS coordinates unavailable
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      This farm does not currently have a GPS location.
                    </p>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* ============================================================
            GPS DETAILS
        ============================================================ */}

        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <h2 className="text-xl font-bold text-slate-900">
              GPS Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Location coordinates captured for this farm.
            </p>

          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-3">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Latitude
              </p>

              <p className="mt-1 font-mono font-semibold text-slate-800">
                {farm.latitude ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Longitude
              </p>

              <p className="mt-1 font-mono font-semibold text-slate-800">
                {farm.longitude ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                GPS Accuracy
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {farm.gps_accuracy !== null &&
                farm.gps_accuracy !== undefined
                  ? `${farm.gps_accuracy} metres`
                  : "—"}
              </p>
            </div>

          </div>

        </div>

        {/* ============================================================
            RECORD HISTORY
        ============================================================ */}

        <div className="rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <h2 className="text-xl font-bold text-slate-900">
              Registration & Record History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Administrative information about this farm record.
            </p>

          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                SoilGenie Farm ID
              </p>

              <p className="mt-1 font-mono font-semibold text-slate-800">
                {farm.farm_id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Registered By
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {farm.registered_by_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Created
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {formatDateTime(farm.created_at)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Last Updated
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {formatDateTime(farm.updated_at)}
              </p>
            </div>

          </div>

        </div>

        {/* ============================================================
            FUTURE SOIL INTELLIGENCE
        ============================================================ */}

        <div className="rounded-2xl border border-dashed border-green-300 bg-green-50 p-6">

          <div className="flex items-start gap-4">

            <div className="text-2xl">
              🧪
            </div>

            <div>

              <h2 className="font-bold text-green-950">
                Soil Intelligence
              </h2>

              <p className="mt-1 text-sm leading-6 text-green-800">
                Soil samples, laboratory tests, soil-health indicators,
                AI recommendations and historical soil assessments for
                this farm can be connected to this profile.
              </p>

            </div>

          </div>

        </div>

        {/* ============================================================
            FOOTER ACTIONS
        ============================================================ */}

        <div className="flex flex-col justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">

          <button
            type="button"
            onClick={() => navigate("/admin/farms")}
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            ← Back to Farm Management
          </button>

          <button
            type="button"
            onClick={() => navigate(`/admin/farmers/${farm.farmer}`)}
            className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            View Farmer Profile →
          </button>

        </div>

      </div>
    </DashboardLayout>
  );
}