import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";

import { getFarmerStatistics } from "../services/farmers";

export default function AgentDashboard() {
  const [myFarmers, setMyFarmers] = useState(0);
  const [totalFarmers, setTotalFarmers] = useState(0);

  const [loadingFarmers, setLoadingFarmers] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadFarmerStatistics() {
      try {
        const data = await getFarmerStatistics();

        setMyFarmers(data.my_farmers_count);
        setTotalFarmers(data.total_farmers_count);
      } catch (error) {
        console.error(
          "Failed to load farmer statistics:",
          error
        );
      } finally {
        setLoadingFarmers(false);
      }
    }

    loadFarmerStatistics();
  }, []);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold">
          Good Morning 👋
        </h1>

        <p className="text-slate-500">
          Welcome back to SoilGenie.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="My Farmers"
          value={
            loadingFarmers
              ? "..."
              : String(myFarmers)
          }
        />

        <StatCard
          title="Total Farmers"
          value={
            loadingFarmers
              ? "..."
              : String(totalFarmers)
          }
        />

        <StatCard
          title="Farms"
          value="489"
        />

        <StatCard
          title="Soil Samples"
          value="138"
        />
      </div>

      {/* Pending Reports */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Pending Reports"
          value="19"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold">
          Quick Actions
        </h2>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* Register Farmer */}
          <button
            type="button"
            onClick={() =>
              navigate("/agent/farmers/register")
            }
            className="rounded-xl bg-green-700 p-4 font-semibold text-white hover:bg-green-800"
          >
            Register Farmer
          </button>


          {/* Register Farm */}
          <button
            type="button"
            onClick={() =>
              navigate("/farms/register")
            }
            className="rounded-xl bg-blue-600 p-4 font-semibold text-white hover:bg-blue-700"
          >
            Register Farm
          </button>


          {/* Record Soil Sample */}
          <button
            type="button"
            onClick={() =>
              navigate("/soil-samples/register")
            }
            className="rounded-xl bg-orange-500 p-4 font-semibold text-white hover:bg-orange-600"
          >
            Record Soil Sample
          </button>


          {/* Generate Report */}
          <button
            type="button"
            onClick={() =>
              navigate("/reports")
            }
            className="rounded-xl bg-purple-600 p-4 font-semibold text-white hover:bg-purple-700"
          >
            Generate Report
          </button>

        </div>
      </div>
    </DashboardLayout>
  );
}