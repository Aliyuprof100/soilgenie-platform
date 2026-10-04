import {
  CloudRain,
  Sprout,
  Thermometer,
  FlaskConical,
  MapPin,
  Droplets,
} from "lucide-react";

export default function DashboardPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">

      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}

      <div className="mb-5 flex items-start justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
              SoilGenie Dashboard
            </h3>

            <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
              Live
            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            Farm Intelligence
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
          🌱
        </div>

      </div>


      {/* ============================================================ */}
      {/* FARM */}
      {/* ============================================================ */}

      <div className="mb-5 rounded-2xl border border-green-100 bg-green-50/70 p-4">

        <div className="flex items-start justify-between gap-3">

          <div>

            <p className="text-xs font-medium uppercase tracking-wide text-green-700">
              Registered Farm
            </p>

            <h4 className="mt-1 text-base font-bold text-slate-900">
              Daniski Farm
            </h4>

            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">

              <MapPin className="h-3.5 w-3.5" />

              Nangere, Yobe

            </div>

          </div>

          <div className="text-right">

            <p className="text-xs text-slate-500">
              Farm Size
            </p>

            <p className="font-bold text-slate-900">
              3.00 ha
            </p>

          </div>

        </div>

      </div>


      {/* ============================================================ */}
      {/* SOIL + WEATHER CARDS */}
      {/* ============================================================ */}

      <div className="grid grid-cols-2 gap-3">

        <Card
          icon={<Sprout className="h-5 w-5 text-green-700" />}
          title="Soil Condition"
          value="Good"
          accent="green"
        />

        <Card
          icon={<FlaskConical className="h-5 w-5 text-blue-600" />}
          title="Soil pH"
          value="6.0"
          accent="blue"
        />

        <Card
          icon={<Droplets className="h-5 w-5 text-cyan-600" />}
          title="Moisture"
          value="20%"
          accent="cyan"
        />

        <Card
          icon={<Thermometer className="h-5 w-5 text-orange-500" />}
          title="Temperature"
          value="30°C"
          accent="orange"
        />

      </div>


      {/* ============================================================ */}
      {/* WEATHER SUMMARY */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">

              <CloudRain className="h-5 w-5 text-cyan-600" />

            </div>

            <div>

              <p className="text-xs text-slate-500">
                Weather Intelligence
              </p>

              <p className="text-sm font-bold text-slate-900">
                Rain-fed conditions
              </p>

            </div>

          </div>

          <div className="text-right">

            <p className="text-lg font-bold text-slate-900">
              27°C
            </p>

            <p className="text-xs text-slate-500">
              Current
            </p>

          </div>

        </div>

      </div>


      {/* ============================================================ */}
      {/* SOILGENIE INTELLIGENCE */}
      {/* ============================================================ */}

      <div className="mt-4 rounded-2xl bg-green-700 p-5 text-white">

        <div className="flex items-center justify-between gap-3">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-green-200">
              SoilGenie Intelligence
            </p>

            <h4 className="mt-1 font-bold">
              Crop Suitability
            </h4>

          </div>

          <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Screening
          </div>

        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 p-3">

          <div className="flex items-center gap-2">

            <Sprout className="h-5 w-5 text-green-100" />

            <span className="text-sm font-semibold">
              Cowpea
            </span>

          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
            Highly Suitable
          </span>

        </div>

        <p className="mt-3 text-xs leading-5 text-green-100">
          SoilGenie uses available soil measurements to provide
          preliminary crop suitability and decision-support insights.
        </p>

      </div>


      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}

      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">

        <span>
          Soil + Farm + Weather
        </span>

        <span>
          SoilGenie
        </span>

      </div>

    </div>
  );
}


/* ================================================================== */
/* CARD */
/* ================================================================== */

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  accent?: "green" | "blue" | "cyan" | "orange";
}

function Card({
  icon,
  title,
  value,
  accent = "green",
}: CardProps) {

  const backgrounds = {
    green: "bg-green-50",
    blue: "bg-blue-50",
    cyan: "bg-cyan-50",
    orange: "bg-orange-50",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm">

      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${backgrounds[accent]}`}
      >
        {icon}
      </div>

      <div className="text-xs text-slate-500">
        {title}
      </div>

      <div className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </div>

    </div>
  );
}