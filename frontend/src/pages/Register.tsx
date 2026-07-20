import AuthLayout from "../layouts/AuthLayout";

export default function Register() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join SoilGenie today"
    >
      <div className="space-y-6">

        <h3 className="text-center text-lg font-semibold">
          Choose your role
        </h3>

        <div className="grid gap-4">

          <button className="rounded-2xl border p-5 text-left transition hover:border-green-600 hover:bg-green-50">
            <div className="text-3xl">🌾</div>

            <h4 className="mt-2 font-bold">
              Farmer
            </h4>

            <p className="text-sm text-slate-600">
              View soil reports, receive AI recommendations,
              and monitor your farms.
            </p>
          </button>

          <button className="rounded-2xl border p-5 text-left transition hover:border-green-600 hover:bg-green-50">
            <div className="text-3xl">👨‍🌾</div>

            <h4 className="mt-2 font-bold">
              Field Agent
            </h4>

            <p className="text-sm text-slate-600">
              Register farmers, collect soil samples,
              and generate reports.
            </p>
          </button>

        </div>

      </div>
    </AuthLayout>
  );
}