import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import DashboardPreview from "./DashboardPreview";
import { Button } from "../ui";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-100">

      {/* ================================================================ */}
      {/* BACKGROUND DECORATIONS */}
      {/* ================================================================ */}

      <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-green-300/20 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-lime-200/10 blur-3xl" />


      {/* ================================================================ */}
      {/* HERO CONTENT */}
      {/* ================================================================ */}

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-between gap-16 px-6 py-16 lg:flex-row lg:gap-12 lg:py-20">

        {/* ============================================================ */}
        {/* LEFT SIDE */}
        {/* ============================================================ */}

        <motion.div
          className="w-full max-w-2xl"
          initial={{
            opacity: 0,
            x: -60,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
          }}
        >

          {/* Product Badge */}

          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-5 py-2 text-sm font-semibold text-green-700 shadow-sm backdrop-blur">

            <span className="text-base">
              🌱
            </span>

            <span>
              Soil Intelligence for Nigerian Agriculture
            </span>

          </div>


          {/* Main Heading */}

          <h1 className="mt-7 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-950 md:text-6xl lg:text-7xl">

            Every Farming
            <br />

            Decision Starts
            <br />

            <span className="text-green-700">
              with Better Data.
            </span>

          </h1>


          {/* Description */}

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">

            SoilGenie helps farmers and agricultural field teams understand
            their soil, monitor farms, interpret weather conditions and turn
            field data into practical decisions for better farming.

          </p>


          {/* CTA */}

          <div className="mt-9 flex flex-wrap items-center gap-4">

            <Link to="/register">
              <Button>
                Get Started
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="secondary">
                Sign In
              </Button>
            </Link>

          </div>


          {/* Trust Message */}

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">

            <span className="flex items-center gap-2">
              <span className="text-green-600">
                ✓
              </span>

              Built for Nigerian farms
            </span>

            <span className="flex items-center gap-2">
              <span className="text-green-600">
                ✓
              </span>

              Farm GPS intelligence
            </span>

            <span className="flex items-center gap-2">
              <span className="text-green-600">
                ✓
              </span>

              Soil & weather intelligence
            </span>

          </div>


          {/* ========================================================== */}
          {/* PRODUCT TRACTION */}
          {/* ========================================================== */}

          <div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-slate-200 pt-8">

            <div>

              <h3 className="text-2xl font-extrabold text-green-700 md:text-3xl">
                10K+
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 md:text-sm">
                People Reached
              </p>

            </div>


            <div className="border-l border-slate-200 pl-5">

              <h3 className="text-2xl font-extrabold text-green-700 md:text-3xl">
                1,000+
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 md:text-sm">
                Soil Tests
              </p>

            </div>


            <div className="border-l border-slate-200 pl-5">

              <h3 className="text-2xl font-extrabold text-green-700 md:text-3xl">
                25–30%
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 md:text-sm">
                Reported Yield Gains
              </p>

            </div>

          </div>

        </motion.div>


        {/* ============================================================ */}
        {/* RIGHT SIDE — PRODUCT PREVIEW */}
        {/* ============================================================ */}

        <motion.div
          className="relative w-full max-w-xl"
          initial={{
            opacity: 0,
            x: 60,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
        >

          {/* Decorative glow */}

          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-green-300/20 blur-3xl" />


          {/* Dashboard */}

          <div className="relative">

            <DashboardPreview />


            {/* Floating Product Badge */}

            <motion.div
              className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur sm:block"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 1,
              }}
            >

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  🌱
                </div>

                <div>

                  <p className="text-xs font-medium text-slate-500">
                    SoilGenie Intelligence
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    Data → Insight → Action
                  </p>

                </div>

              </div>

            </motion.div>


            {/* Floating Nigeria Badge */}

            <motion.div
              className="absolute -right-4 -top-5 hidden rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:block"
              initial={{
                opacity: 0,
                y: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 1.1,
              }}
            >

              <div className="flex items-center gap-2">

                <span className="text-lg">
                  🇳🇬
                </span>

                <div>

                  <p className="text-xs text-slate-500">
                    Operating Geography
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    Nigeria
                  </p>

                </div>

              </div>

            </motion.div>

          </div>

        </motion.div>

      </div>


      {/* ================================================================ */}
      {/* BOTTOM TRANSITION */}
      {/* ================================================================ */}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/70 to-transparent" />

    </section>
  );
}