import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getMyFarmers } from "../services/farmers";
import type { Farmer } from "../services/farmers";

export default function Farmers() {
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFarmers() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyFarmers();

      setFarmers(data);
    } catch (err) {
      console.error("Error loading farmers:", err);

      setError(
        "Unable to load farmers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFarmers();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Farmers
            </h1>

            <p className="mt-2 text-slate-500">
              Farmers registered by you on the SoilGenie platform.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/agent/register-farmer")
            }
            className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            + Register Farmer
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading farmers...
            </div>
          ) : farmers.length === 0 ? (
            <div className="p-10 text-center">

              <h2 className="text-xl font-bold text-slate-800">
                No farmers yet
              </h2>

              <p className="mt-2 text-slate-500">
                You have not registered any farmers yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/agent/register-farmer")
                }
                className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
              >
                Register Your First Farmer
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b bg-slate-50">

                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Farmer ID
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Farmer
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Location
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Primary Crop
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Farms
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Status
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y">

                  {farmers.map((farmer) => (
                    <tr
                      key={farmer.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                     <button
                        type="button"
                        onClick={() =>
                        navigate(`/agent/farmers/${farmer.id}`)
                       }
                    className="font-semibold text-green-700 hover:underline"
                    >
                    {farmer.farmer_id}
                    </button>
                      </td>

                      <td className="px-6 py-4">

                        <div className="font-semibold text-slate-900">
                          {farmer.first_name}{" "}
                          {farmer.last_name}
                        </div>

                        {farmer.email && (
                          <div className="text-sm text-slate-500">
                            {farmer.email}
                          </div>
                        )}

                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {farmer.phone_number}
                      </td>

                      <td className="px-6 py-4">

                        <div className="text-slate-800">
                          {farmer.lga}
                        </div>

                        <div className="text-sm text-slate-500">
                          {farmer.state}
                        </div>

                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {farmer.primary_crop || "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {farmer.number_of_farms}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            farmer.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {farmer.status}
                        </span>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}