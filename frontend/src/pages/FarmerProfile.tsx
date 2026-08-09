import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import api from "../api/api";

import type { Farmer } from "../services/farmers";

export default function FarmerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFarmer() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/farmers/${id}/`);

      setFarmer(response.data);
    } catch (err) {
      console.error("Error loading farmer:", err);

      setError(
        "Unable to load this farmer. The farmer may not exist or you may not have permission to view the profile."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadFarmer();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-slate-500">
            Loading farmer profile...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !farmer) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl">

          <button
            type="button"
            onClick={() => navigate("/agent/farmers")}
            className="mb-6 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Farmers
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Farmer not found."}
          </div>

        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/agent/farmers")}
          className="text-sm font-semibold text-green-700 hover:text-green-800"
        >
          ← Back to Farmers
        </button>

        {/* Profile Header */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
                {farmer.first_name.charAt(0)}
                {farmer.last_name.charAt(0)}
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-3xl font-bold text-slate-900">
                    {farmer.first_name} {farmer.last_name}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      farmer.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {farmer.status}
                  </span>

                </div>

                <p className="mt-1 font-medium text-green-700">
                  {farmer.farmer_id}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Registered by {farmer.registered_by_name}
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(`/agent/farmers/${farmer.id}/edit`)
              }
              className="rounded-xl border px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Edit Farmer
            </button>

          </div>

        </div>

        {/* Personal Information */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Personal Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              label="First Name"
              value={farmer.first_name}
            />

            <InfoItem
              label="Last Name"
              value={farmer.last_name}
            />

            <InfoItem
              label="Gender"
              value={formatValue(farmer.gender)}
            />

            <InfoItem
              label="Phone Number"
              value={farmer.phone_number}
            />

            <InfoItem
              label="Alternative Phone"
              value={farmer.alternative_phone}
            />

            <InfoItem
              label="Email"
              value={farmer.email}
            />

            <InfoItem
              label="Date of Birth"
              value={farmer.date_of_birth}
            />

          </div>

        </div>

        {/* Location */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Location
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <InfoItem
              label="State"
              value={farmer.state}
            />

            <InfoItem
              label="LGA"
              value={farmer.lga}
            />

            <InfoItem
              label="Ward"
              value={farmer.ward}
            />

            <InfoItem
              label="Village"
              value={farmer.village}
            />

          </div>

          {farmer.address && (
            <div className="mt-6">

              <p className="mb-1 text-sm font-medium text-slate-500">
                Address
              </p>

              <p className="text-slate-800">
                {farmer.address}
              </p>

            </div>
          )}

        </div>

        {/* Farming Information */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Farming Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <InfoItem
              label="Primary Crop"
              value={farmer.primary_crop}
            />

            <InfoItem
              label="Farm Size"
              value={
                farmer.farm_size !== null &&
                farmer.farm_size !== undefined
                  ? `${farmer.farm_size} hectares`
                  : undefined
              }
            />

            <InfoItem
              label="Number of Farms"
              value={String(farmer.number_of_farms)}
            />

            <InfoItem
              label="Farming Type"
              value={formatValue(farmer.farming_type)}
            />

          </div>

        </div>

        {/* Farms */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Farms
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Farms belonging to this farmer.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(`/agent/farmers/${farmer.id}/farms`)
              }
              className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              + Add Farm
            </button>

          </div>

          <div className="mt-6 rounded-xl border border-dashed bg-slate-50 p-8 text-center">

            <div className="text-4xl">
              🌾
            </div>

            <h3 className="mt-3 font-bold text-slate-800">
              Farm records coming next
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              We will connect this farmer to their farms,
              GPS coordinates, farm boundaries and crops.
            </p>

          </div>

        </div>

        {/* Soil Samples */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Soil Samples
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Soil testing history for this farmer.
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
            >
              + Record Soil Sample
            </button>

          </div>

          <div className="mt-6 rounded-xl border border-dashed bg-slate-50 p-8 text-center">

            <div className="text-4xl">
              🧪
            </div>

            <h3 className="mt-3 font-bold text-slate-800">
              No soil samples yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Soil test records will appear here once samples
              are collected and analyzed.
            </p>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

interface InfoItemProps {
  label: string;
  value?: string | null;
}

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function formatValue(value?: string | null) {
  if (!value) {
    return undefined;
  }

  return value
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}