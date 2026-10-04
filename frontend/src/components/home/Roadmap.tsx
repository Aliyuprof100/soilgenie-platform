import {
  CheckCircle2,
  Smartphone,
  Satellite,
  Cpu,
  MessageSquare,
} from "lucide-react";

import { SectionTitle } from "../ui";

const currentCapabilities = [
  "Farm registration and digital farm profiles",
  "GPS-enabled farm mapping",
  "Soil measurements and analysis",
  "Crop suitability screening",
  "Weather and climate intelligence",
  "Farmer-friendly and technical soil reports",
];

const nextCapabilities = [
  {
    icon: Smartphone,
    title: "Mobile Farmer Experience",
    text: "Extend SoilGenie access to farmers and field teams through a dedicated mobile experience.",
  },
  {
    icon: MessageSquare,
    title: "SMS & USSD Access",
    text: "Make essential agricultural intelligence accessible to farmers with limited smartphone or internet access.",
  },
  {
    icon: Satellite,
    title: "Satellite & Geospatial Intelligence",
    text: "Expand farm intelligence with satellite-derived field and environmental information.",
  },
];

const futureCapabilities = [
  {
    icon: Cpu,
    title: "Connected Soil Intelligence",
    text: "Integrate connected soil sensors and field devices for richer, more timely measurements.",
  },
  {
    icon: Satellite,
    title: "Advanced Agricultural Analytics",
    text: "Develop deeper spatial and temporal analytics to support agricultural planning at scale.",
  },
];

export default function Roadmap() {
  return (
    <section
      id="roadmap"
      className="relative overflow-hidden bg-white py-24"
    >
      {/* Background decoration */}

      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-green-100/40 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-emerald-100/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">

        <SectionTitle
          title="The SoilGenie Roadmap"
          subtitle="Building from practical farm and soil intelligence today toward a more connected agricultural intelligence ecosystem."
        />

        {/* ============================================================ */}
        {/* AVAILABLE TODAY */}
        {/* ============================================================ */}

        <div className="mt-14 rounded-3xl border border-green-200 bg-green-50/70 p-8">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-green-700">
                Available Today
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                SoilGenie Core Platform
              </h3>

            </div>

            <span className="inline-flex w-fit rounded-full bg-green-700 px-4 py-2 text-xs font-bold text-white">
              CURRENT
            </span>

          </div>


          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {currentCapabilities.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-green-100 bg-white p-4"
              >

                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                <span className="text-sm leading-6 text-slate-700">
                  {item}
                </span>

              </div>
            ))}

          </div>

        </div>


        {/* ============================================================ */}
        {/* NEXT */}
        {/* ============================================================ */}

        <div className="mt-10">

          <div className="mb-6">

            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Next
            </p>

            <h3 className="mt-1 text-2xl font-bold text-slate-900">
              Expanding Access & Intelligence
            </h3>

          </div>


          <div className="grid gap-6 md:grid-cols-3">

            {nextCapabilities.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                    <Icon className="h-5 w-5 text-green-700" />
                  </div>

                  <h4 className="mt-5 text-lg font-bold text-slate-900">
                    {item.title}
                  </h4>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>

                  <div className="mt-5 text-xs font-semibold text-green-700">
                    IN DEVELOPMENT
                  </div>

                </div>
              );
            })}

          </div>

        </div>


        {/* ============================================================ */}
        {/* FUTURE */}
        {/* ============================================================ */}

        <div className="mt-12 rounded-3xl bg-slate-950 p-8 text-white">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-green-400">
                Future
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                Toward Connected Agricultural Intelligence
              </h3>

            </div>

            <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-slate-300">
              ROADMAP
            </span>

          </div>


          <div className="mt-8 grid gap-5 md:grid-cols-2">

            {futureCapabilities.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10">
                    <Icon className="h-5 w-5 text-green-400" />
                  </div>

                  <h4 className="mt-5 text-lg font-bold">
                    {item.title}
                  </h4>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {item.text}
                  </p>

                </div>
              );
            })}

          </div>

        </div>

      </div>
    </section>
  );
}