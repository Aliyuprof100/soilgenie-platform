import {
  Mail,
  MapPin,
  ArrowUpRight,
  Sprout,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">

      {/* ============================================================ */}
      {/* MAIN FOOTER */}
      {/* ============================================================ */}

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">

        {/* ======================================================== */}
        {/* BRAND */}
        {/* ======================================================== */}

        <div className="lg:col-span-2">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 shadow-lg shadow-green-900/20">
              <Sprout className="h-6 w-6 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                SoilGenie
              </h2>

              <p className="text-xs font-medium text-green-400">
                AI Precision Agriculture
              </p>
            </div>

          </div>


          <p className="mt-6 max-w-md leading-7 text-slate-400">
            Soil intelligence and farm decision support helping farmers,
            field teams and agricultural organisations make better-informed
            decisions across Nigeria.
          </p>


          {/* Operating Geography */}

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">

            <span>
              🇳🇬
            </span>

            <span>
              Built for Nigerian Agriculture
            </span>

          </div>

        </div>


        {/* ======================================================== */}
        {/* PLATFORM */}
        {/* ======================================================== */}

        <div>

          <h3 className="font-bold text-white">
            Platform
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-slate-400">

            <li>
              <a
                href="#platform"
                className="transition hover:text-green-400"
              >
                Solutions
              </a>
            </li>

            <li>
              <a
                href="#roadmap"
                className="transition hover:text-green-400"
              >
                Roadmap
              </a>
            </li>

            <li>
              <a
                href="#platform"
                className="transition hover:text-green-400"
              >
                How It Works
              </a>
            </li>

            <li>
              <a
                href="#"
                className="transition hover:text-green-400"
              >
                Get Started
              </a>
            </li>

          </ul>

        </div>


        {/* ======================================================== */}
        {/* CONTACT */}
        {/* ======================================================== */}

        <div>

          <h3 className="font-bold text-white">
            Contact
          </h3>

          <div className="mt-5 space-y-4 text-sm text-slate-400">

            <p className="flex items-start gap-3">

              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />

              <span>
                Contact SoilGenie
              </span>

            </p>


            <p className="flex items-start gap-3">

              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />

              <span>
                Nigeria
              </span>

            </p>

          </div>

        </div>

      </div>


      {/* ============================================================ */}
      {/* HAIDARSOFT ATTRIBUTION */}
      {/* ============================================================ */}

      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-7 text-sm md:flex-row md:items-center md:justify-between">

          <div className="text-slate-500">

            © {new Date().getFullYear()} SoilGenie. All rights reserved.

          </div>


          <div className="flex flex-wrap items-center gap-2 text-slate-400">

            <span>
              Designed and developed by
            </span>

            <a
              href="https://www.haidarsoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-white transition hover:text-green-400"
            >
              HaidarSoft Technologies Ltd.
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

          </div>


          <div className="text-xs italic text-slate-600">
            Innovative Solutions. Real Impact.
          </div>

        </div>

      </div>

    </footer>
  );
}