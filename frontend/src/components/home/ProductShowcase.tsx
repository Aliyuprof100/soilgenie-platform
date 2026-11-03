import {
  ArrowUpRight,
  ClipboardCheck,
  FileText,
  FlaskConical,
  MapPinned,
  Sprout,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../ui";

const capabilities = [
  {
    icon: MapPinned,
    number: "01",
    title: "Understand every farm",
    description:
      "Keep farmer and farm profiles, GPS locations, farm size and crop information organised in one place.",
    points: ["Farmer and farm records", "GPS-enabled farm locations", "Farm and crop details"],
  },
  {
    icon: FlaskConical,
    number: "02",
    title: "Make sense of soil data",
    description:
      "Bring recorded soil measurements together in an assessment that is easier for farmers and field teams to interpret.",
    points: ["pH and NPK measurements", "Moisture and other soil indicators", "Preliminary crop suitability screening"],
  },
  {
    icon: FileText,
    number: "03",
    title: "Turn findings into action",
    description:
      "Use clear soil reports and farm context to support better-informed conversations and agricultural decisions.",
    points: ["Soil assessment summaries", "Farmer-friendly reports", "Technical information for field teams"],
  },
];

function InterfacePreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -inset-5 rounded-[2rem] bg-green-200/50 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">SoilGenie workspace</p>
              <p className="text-xs text-slate-500">Farm and soil intelligence</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Interface preview
          </span>
        </div>

        <div className="space-y-4 bg-slate-50/80 p-4 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Farm management</p>
                <p className="mt-1 text-base font-bold text-slate-900">Digital farm profile</p>
              </div>
              <MapPinned className="h-5 w-5 text-green-700" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Farm location</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">GPS coordinates</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Farm information</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">Size · Crops · Details</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Soil assessment</p>
                <FlaskConical className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-4 space-y-3">
                {["pH", "Nitrogen (N)", "Phosphorus (P)", "Potassium (K)"].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs text-slate-600">{item}</span>
                    <span className="text-[10px] font-semibold text-slate-400">Recorded value</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Soil report</p>
                <ClipboardCheck className="h-4 w-4 text-green-700" />
              </div>
              <div className="mt-4 rounded-xl bg-green-50 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-700" />
                  <span className="text-xs font-semibold text-green-900">Assessment summary</span>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-green-800">
                  Soil indicators, assessment notes and preliminary decision-support information.
                </p>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100" />
              <div className="mt-2 h-2 w-4/5 rounded-full bg-slate-100" />
              <div className="mt-2 h-2 w-2/3 rounded-full bg-slate-100" />
            </div>
          </div>
          <p className="text-center text-[10px] leading-4 text-slate-400">
            Illustrative interface — values and farm records are not live customer data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section id="product-showcase" className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-green-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-green-800">
            Explore the platform
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            From farm records to clearer soil insights.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            SoilGenie brings farm information, soil measurements and assessment reports into one connected workspace for farmers and agricultural field teams.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="space-y-8">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.number} className="flex gap-4 sm:gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-green-100 bg-green-50 text-green-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold tracking-widest text-green-700">{item.number}</span>
                      <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{item.title}</h3>
                    </div>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{item.description}</p>
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
            <div className="pt-1">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-green-800 transition hover:text-green-950">
                Explore the platform
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <InterfacePreview />
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-3xl bg-slate-950 px-6 py-8 text-center sm:flex-row sm:px-9 sm:text-left">
          <div>
            <p className="text-lg font-bold text-white">A clearer view of your farm starts with better information.</p>
            <p className="mt-1 text-sm text-slate-300">Bring your farm and soil records together with SoilGenie.</p>
          </div>
          <Link to="/register" className="shrink-0">
            <Button>
              Get Started
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
