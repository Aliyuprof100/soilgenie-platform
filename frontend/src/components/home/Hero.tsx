import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, FlaskConical, MapPinned, CloudSun } from "lucide-react";

import DashboardPreview from "./DashboardPreview";
import { Button } from "../ui";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f7faf6]">
      <div className="pointer-events-none absolute -left-32 top-12 h-96 w-96 rounded-full bg-[#c9ead7]/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#d8f1ed]/60 blur-3xl" />

      <div className="relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b8dfc8] bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#176b45] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#16a36a]" />
            Soil intelligence for better farming decisions
          </div>

          <h1 className="mt-7 text-5xl font-black leading-[1.04] tracking-[-0.045em] text-[#102417] sm:text-6xl lg:text-[4.35rem]">
            Understand your soil.
            <span className="mt-2 block text-[#168b5b]">Make every decision count.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            SoilGenie brings soil measurements, farm information and weather context together to help farmers and agricultural teams make more informed decisions.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/register">
              <Button>Get started <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Sign in</Button>
            </Link>
          </div>

          <div className="mt-9 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-[#168b5b]" />
              <span className="text-sm font-semibold leading-5 text-slate-700">Soil assessment</span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-[#168b5b]" />
              <span className="text-sm font-semibold leading-5 text-slate-700">Farm profiles and location</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CloudSun className="mt-0.5 h-5 w-5 shrink-0 text-[#168b5b]" />
              <span className="text-sm font-semibold leading-5 text-slate-700">Weather context</span>
            </div>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-slate-500">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#168b5b]" />
            Designed around the needs of Nigerian farmers and field teams.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="relative mx-auto w-full max-w-[620px]"
        >
          <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-[#b9e4ca]/60 to-[#d9f1ec]/50 blur-2xl" />
          <div className="rounded-[1.8rem] border border-white bg-white/90 p-2 shadow-[0_28px_80px_-35px_rgba(13,65,36,0.35)] sm:p-4">
            <DashboardPreview />
          </div>
          <div className="absolute -bottom-5 left-4 hidden rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">SoilGenie workflow</p>
            <p className="mt-1 text-sm font-bold text-[#102417]">Data <span className="text-[#168b5b]">→</span> Insight <span className="text-[#168b5b]">→</span> Action</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}