import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { createFarmer } from "../services/farmers";
import type { FarmerFormData } from "../services/farmers";

const initialForm: FarmerFormData = {
  first_name: "",
  last_name: "",
  phone_number: "",
  alternative_phone: "",
  email: "",

  gender: "",
  date_of_birth: "",

  state: "",
  lga: "",
  ward: "",
  village: "",
  address: "",

  primary_crop: "",
  farm_size: "",
  number_of_farms: "1",
  farming_type: "SMALLHOLDER",
};

export default function RegisterFarmer() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<FarmerFormData>(initialForm);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.first_name.trim() ||
      !form.last_name.trim()
    ) {
      setError(
        "First name and last name are required."
      );
      return;
    }

    if (!form.phone_number.trim()) {
      setError(
        "Phone number is required."
      );
      return;
    }

    if (!form.gender) {
      setError("Please select the farmer's gender.");
      return;
    }

    if (!form.state.trim() || !form.lga.trim()) {
      setError(
        "State and LGA are required."
      );
      return;
    }

    setLoading(true);

    try {
      const farmer = await createFarmer(form);

      setSuccess(
        `Farmer registered successfully. Farmer ID: ${farmer.farmer_id}`
      );

      setForm(initialForm);

      setTimeout(() => {
        navigate("/agent");
      }, 1500);

    } catch (err: any) {
      console.error(
        "Farmer registration error:",
        err
      );

      if (err.response?.data) {
        const data = err.response.data;

        if (typeof data === "object") {
          const messages = Object.entries(data)
            .map(
              ([field, message]) =>
                `${field}: ${message}`
            )
            .join("\n");

          setError(messages);
        } else {
          setError(String(data));
        }
      } else {
        setError(
          "Unable to register farmer. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">

          <button
            type="button"
            onClick={() => navigate("/agent")}
            className="mb-4 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-slate-900">
            Register Farmer
          </h1>

          <p className="mt-2 text-slate-500">
            Add a new farmer to the SoilGenie platform.
          </p>

        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border bg-white p-8 shadow-sm"
        >

          {/* Personal Information */}
          <section>

            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Personal Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  First Name *
                </label>

                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Last Name *
                </label>

                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone Number *
                </label>

                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="08012345678"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Alternative Phone
                </label>

                <input
                  name="alternative_phone"
                  value={form.alternative_phone}
                  onChange={handleChange}
                  placeholder="Alternative phone number"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="farmer@example.com"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Gender *
                </label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
                  required
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="MALE">
                    Male
                  </option>

                  <option value="FEMALE">
                    Female
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />
              </div>

            </div>

          </section>

          {/* Location */}
          <section>

            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Location
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  State *
                </label>

                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Yobe"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  LGA *
                </label>

                <input
                  name="lga"
                  value={form.lga}
                  onChange={handleChange}
                  placeholder="e.g. Potiskum"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ward
                </label>

                <input
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  placeholder="Ward"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Village
                </label>

                <input
                  name="village"
                  value={form.village}
                  onChange={handleChange}
                  placeholder="Village"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />
              </div>

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium">
                  Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Full residential address"
                  rows={3}
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />

              </div>

            </div>

          </section>

          {/* Farming Information */}
          <section>

            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Farming Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Primary Crop
                </label>

                <input
                  name="primary_crop"
                  value={form.primary_crop}
                  onChange={handleChange}
                  placeholder="e.g. Millet, Maize, Rice"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Farm Size (Hectares)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="farm_size"
                  value={form.farm_size}
                  onChange={handleChange}
                  placeholder="e.g. 2.5"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Number of Farms
                </label>

                <input
                  type="number"
                  min="1"
                  name="number_of_farms"
                  value={form.number_of_farms}
                  onChange={handleChange}
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Farming Type
                </label>

                <select
                  name="farming_type"
                  value={form.farming_type}
                  onChange={handleChange}
                  className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
                >
                  <option value="SMALLHOLDER">
                    Smallholder
                  </option>

                  <option value="COMMERCIAL">
                    Commercial
                  </option>

                  <option value="COOPERATIVE">
                    Cooperative
                  </option>
                </select>
              </div>

            </div>

          </section>

          {/* Buttons */}
          <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row">

            <button
              type="button"
              onClick={() => navigate("/agent")}
              className="rounded-xl border px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Registering Farmer..."
                : "Register Farmer"}
            </button>

          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}