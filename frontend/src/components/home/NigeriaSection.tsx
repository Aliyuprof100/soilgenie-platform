import {
  MapPinned,
  Wheat,
  CloudSun,
  ShieldCheck,
} from "lucide-react";

import { SectionTitle } from "../ui";

const highlights = [
  {
    icon: MapPinned,
    title: "GPS-Enabled Farms",
    text: "Capture and manage farm locations to build a digital picture of agricultural activity.",
  },
  {
    icon: Wheat,
    title: "Built Around Local Agriculture",
    text: "Designed for the realities of Nigerian farmers, field agents and agricultural organisations.",
  },
  {
    icon: CloudSun,
    title: "Climate-Aware Decisions",
    text: "Bring weather conditions and forecasts into the context of farm and soil information.",
  },
  {
    icon: ShieldCheck,
    title: "Designed for Responsible Intelligence",
    text: "SoilGenie presents agricultural intelligence as decision support alongside field observations and appropriate agronomic advice.",
  },
];

export default function NigeriaSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-slate-950 py-24 text-white"
    >
      {/* Background decoration */}

      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-green-700/20 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />


      <div className="relative mx-auto max-w-7xl px-6">

        <SectionTitle
          title="Built for Nigerian Agriculture"
          subtitle="SoilGenie is designed around the realities of Nigerian farms and the people who work with them."
        />


        {/* Main content */}

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">

          {/* Nigeria visual */}

          <div className="relative">

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">

              {/* Nigeria-inspired visual */}

              <div className="flex min-h-[360px] items-center justify-center">

                <div className="relative flex h-64 w-64 items-center justify-center rounded-[45%_55%_50%_50%/55%_45%_55%_45%] border border-green-400/30 bg-gradient-to-br from-green-900/70 via-green-800/40 to-emerald-700/20 shadow-[0_0_80px_rgba(34,197,94,0.12)]">

                  {/* Grid */}

                  <div className="absolute inset-8 rounded-full border border-dashed border-green-400/20" />

                  <div className="absolute inset-16 rounded-full border border-dashed border-green-400/20" />


                  {/* Farm markers */}

                  <span className="absolute left-[28%] top-[34%] flex h-4 w-4 animate-pulse rounded-full bg-green-400 ring-4 ring-green-400/20" />

                  <span className="absolute left-[53%] top-[23%] flex h-4 w-4 animate-pulse rounded-full bg-green-400 ring-4 ring-green-400/20" />

                  <span className="absolute left-[65%] top-[48%] flex h-4 w-4 animate-pulse rounded-full bg-green-400 ring-4 ring-green-400/20" />

                  <span className="absolute left-[43%] top-[64%] flex h-4 w-4 animate-pulse rounded-full bg-green-400 ring-4 ring-green-400/20" />

                  <span className="absolute left-[27%] top-[58%] flex h-4 w-4 animate-pulse rounded-full bg-green-400 ring-4 ring-green-400/20" />


                  {/* Center */}

                  <div className="text-center">

                    <div className="text-5xl">
                      🇳🇬
                    </div>

                    <p className="mt-3 text-sm font-bold text-white">
                      Nigeria
                    </p>

                    <p className="mt-1 text-xs text-green-200">
                      SoilGenie Operating Geography
                    </p>

                  </div>

                </div>

              </div>


              {/* Bottom label */}

              <div className="border-t border-white/10 pt-5 text-center">

                <p className="text-sm font-semibold text-white">
                  Designed for Nigeria. Built to scale.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  GPS-enabled agricultural intelligence for farms and field teams.
                </p>

              </div>

            </div>

          </div>


          {/* Highlights */}

          <div>

            <h3 className="text-3xl font-bold tracking-tight">
              Local context.
              <br />
              Practical intelligence.
            </h3>

            <p className="mt-5 max-w-xl leading-8 text-slate-300">
              Agricultural decisions depend on more than a single soil
              measurement. SoilGenie is designed to help farmers and field
              teams connect farm information, soil measurements and weather
              conditions within one platform.
            </p>


            <div className="mt-8 space-y-5">

              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-green-400/30 hover:bg-white/10"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10">

                      <Icon className="h-5 w-5 text-green-400" />

                    </div>

                    <div>

                      <h4 className="font-bold text-white">
                        {item.title}
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {item.text}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}