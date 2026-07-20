import {
  CloudRain,
  Sprout,
  Thermometer,
  Activity,
  Satellite,
  FlaskConical,
} from "lucide-react";

export default function DashboardPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h3 className="text-xl font-bold">
            SoilGenie Dashboard
          </h3>

          <p className="text-sm text-slate-500">
            Live Farm Intelligence
          </p>

        </div>

        <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
          LIVE
        </div>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <Card
          icon={<Sprout className="text-green-700" />}
          title="Soil Health"
          value="92%"
        />

        <Card
          icon={<FlaskConical className="text-blue-600" />}
          title="Nitrogen"
          value="52 ppm"
        />

        <Card
          icon={<Thermometer className="text-orange-500" />}
          title="Temperature"
          value="27°C"
        />

        <Card
          icon={<CloudRain className="text-cyan-600" />}
          title="Rain"
          value="82%"
        />

        <Card
          icon={<Satellite className="text-purple-600" />}
          title="Satellite"
          value="Healthy"
        />

        <Card
          icon={<Activity className="text-emerald-600" />}
          title="Yield"
          value="+31%"
        />

      </div>

      <div className="mt-6 rounded-2xl bg-green-700 p-5 text-white">

        <h4 className="font-bold">
          AI Recommendation
        </h4>

        <p className="mt-2 text-green-100">
          Apply NPK 20-10-10 at 120 kg/ha during the next rainfall window.
        </p>

      </div>

    </div>
  );
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

function Card({ icon, title, value }: CardProps) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">

      <div className="mb-3">
        {icon}
      </div>

      <div className="text-sm text-slate-500">
        {title}
      </div>

      <div className="mt-1 text-xl font-bold">
        {value}
      </div>

    </div>
  );
}