import DashboardLayout from "../components/dashboard/DashboardLayout";

export default function AgentDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">

        <div>
          <h2 className="text-3xl font-bold">
            Good Morning 👋
          </h2>

          <p className="text-slate-500">
            Welcome back to SoilGenie.
          </p>
        </div>

        {/* Statistics */}

        <div className="grid grid-cols-4 gap-6">

          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-sm text-slate-500">
              Farmers
            </h3>

            <p className="mt-3 text-4xl font-bold text-green-700">
              250
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-sm text-slate-500">
              Farms
            </h3>

            <p className="mt-3 text-4xl font-bold text-green-700">
              489
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-sm text-slate-500">
              Soil Samples
            </h3>

            <p className="mt-3 text-4xl font-bold text-green-700">
              138
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-sm text-slate-500">
              Pending Reports
            </h3>

            <p className="mt-3 text-4xl font-bold text-green-700">
              19
            </p>
          </div>

        </div>

        {/* Quick Actions */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <h3 className="mb-5 text-xl font-bold">
            Quick Actions
          </h3>

          <div className="grid grid-cols-4 gap-5">

            <button className="rounded-xl bg-green-700 p-4 font-semibold text-white hover:bg-green-800">
              Register Farmer
            </button>

            <button className="rounded-xl bg-blue-600 p-4 font-semibold text-white hover:bg-blue-700">
              Register Farm
            </button>

            <button className="rounded-xl bg-orange-500 p-4 font-semibold text-white hover:bg-orange-600">
              Record Soil Sample
            </button>

            <button className="rounded-xl bg-purple-600 p-4 font-semibold text-white hover:bg-purple-700">
              Generate Report
            </button>

          </div>

        </div>

        {/* Recent Activities */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <h3 className="mb-5 text-xl font-bold">
            Recent Activities
          </h3>

          <ul className="space-y-3 text-slate-600">

            <li>✅ Farmer Musa registered successfully.</li>

            <li>✅ Soil Sample #103 uploaded.</li>

            <li>✅ AI recommendation generated.</li>

            <li>✅ Weather forecast updated.</li>

            <li>✅ Farm inspection completed.</li>

          </ul>

        </div>

      </div>
    </DashboardLayout>
  );
}