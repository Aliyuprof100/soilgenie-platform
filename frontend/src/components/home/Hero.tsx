import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import DashboardPreview from "./DashboardPreview";
import { Button } from "../ui";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-100">
      {/* Background Decorations */}
      <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-green-300/20 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl"></div>

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-between gap-16 px-6 py-20 lg:flex-row">

        {/* Left Side */}
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
            🌱 AI-Powered Precision Agriculture Platform
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl lg:text-7xl">
            Know Your Soil.
            <br />
            Predict Your Harvest.
            <br />
            Maximize Every Acre.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">
            SoilGenie combines artificial intelligence, portable soil testing,
            satellite monitoring, weather intelligence and precision agriculture
            into one smart platform that helps farmers increase yields while
            reducing production costs.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">

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

          {/* Statistics */}
          <div className="mt-14 grid grid-cols-3 gap-8">

            <div>
              <h3 className="text-3xl font-bold text-green-700">
                10K+
              </h3>

              <p className="text-sm text-slate-600">
                Farmers Reached
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-green-700">
                1,000+
              </h3>

              <p className="text-sm text-slate-600">
                Soil Tests
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-green-700">
                25%
              </h3>

              <p className="text-sm text-slate-600">
                Average Yield Increase
              </p>
            </div>

          </div>

        </motion.div>

        {/* Right Side */}
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
        >
          <DashboardPreview />
        </motion.div>

      </div>
    </section>
  );
}