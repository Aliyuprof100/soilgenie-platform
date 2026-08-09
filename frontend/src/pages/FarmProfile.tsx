import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getFarm } from "../services/farms";

interface FarmProfileData {
  id: number;
  farm_id: string;

  farmer: number;
  farmer_name: string;

  registered_by: number;
  registered_by_name: string;

  farm_name: string;
  farm_size: number;
  primary_crop?: string | null;

  farming_type: string;
  irrigation_type: string;
  ownership_type: string;

  state: string;
  lga: string;
  ward?: string | null;
  village?: string | null;
  address?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  gps_accuracy?: number | null;

  status: string;

  created_at: string;
  updated_at: string;
}

export default function FarmProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [farm, setFarm] = useState<FarmProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFarm() {
      if (!id) {
        setError("Farm ID was not provided.");
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
          "Unable to load this farm. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFarm();
  }, [id]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-lg font-semibold text-slate-500">
            Loading farm profile...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !farm) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/agent")}
            className="mb-6 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Dashboard
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Farm not found."}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div>
          <button
            type="button"
            onClick={() => navigate("/agent")}
            className="mb-4 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Dashboard
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                Farm Profile
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                {farm.farm_name}
              </h1>

              <p className="mt-2 text-slate-500">
                {farm.farm_id}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                farm.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {farm.status}
            </span>
          </div>
        </div>

        {/* Farmer */}
        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Farmer
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <p className="text-sm text-slate-500">
                Farmer Name
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900">
                {farm.farmer_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Farmer ID
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(`/agent/farmers/${farm.farmer}`)
                }
                className="mt-1 font-semibold text-green-700 hover:underline"
              >
                View Farmer Profile
              </button>
            </div>

          </div>
        </section>

        {/* Farm Information */}
        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Farm Information
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <p className="text-sm text-slate-500">
                Farm Size
              </p>

              <p className="mt-1 text-lg font-semibold">
                {farm.farm_size} hectares
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Primary Crop
              </p>

              <p className="mt-1 text-lg font-semibold">
                {farm.primary_crop || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Farming Type
              </p>

              <p className="mt-1 text-lg font-semibold">
                {farm.farming_type}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Irrigation
              </p>

              <p className="mt-1 text-lg font-semibold">
                {farm.irrigation_type}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Ownership
              </p>

              <p className="mt-1 text-lg font-semibold">
                {farm.ownership_type}
              </p>
            </div>

          </div>
        </section>

        {/* Location */}
        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Farm Location
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <p className="text-sm text-slate-500">
                State
              </p>

              <p className="mt-1 font-semibold">
                {farm.state}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                LGA
              </p>

              <p className="mt-1 font-semibold">
                {farm.lga}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Ward
              </p>

              <p className="mt-1 font-semibold">
                {farm.ward || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Village
              </p>

              <p className="mt-1 font-semibold">
                {farm.village || "Not specified"}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-slate-500">
                Address
              </p>

              <p className="mt-1 font-semibold">
                {farm.address || "Not specified"}
              </p>
            </div>

          </div>
        </section>

        {/* GPS */}
        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              GPS Location
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Precise geographic coordinates captured for this farm.
            </p>
          </div>

          {farm.latitude !== null &&
          farm.latitude !== undefined &&
          farm.longitude !== null &&
          farm.longitude !== undefined ? (
            <div className="grid gap-6 md:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Latitude
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {farm.latitude}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Longitude
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {farm.longitude}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  GPS Accuracy
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {farm.gps_accuracy
                    ? `${farm.gps_accuracy} m`
                    : "Not available"}
                </p>
              </div>

            </div>
          ) : (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
              GPS coordinates were not captured for this farm.
            </div>
          )}
        </section>

        {/* Registration Details */}
        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Registration Details
          </h2>

          <div className="grid gap-6 md:grid-cols-3">

            <div>
              <p className="text-sm text-slate-500">
                Registered By
              </p>

              <p className="mt-1 font-semibold">
                {farm.registered_by_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Registered On
              </p>

              <p className="mt-1 font-semibold">
                {formatDate(farm.created_at)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Last Updated
              </p>

              <p className="mt-1 font-semibold">
                {formatDate(farm.updated_at)}
              </p>
            </div>

          </div>
        </section>

        {/* Future Features */}
        <section className="rounded-2xl border border-green-200 bg-green-50 p-8">
          <h2 className="text-xl font-bold text-green-900">
            SoilGenie Farm Intelligence
          </h2>

          <p className="mt-2 text-green-800">
            Soil samples, soil test results, AI recommendations,
            crop history and yield records will appear here as
            this farm builds its digital agricultural history.
          </p>
        </section>

      </div>
    </DashboardLayout>
  );
}