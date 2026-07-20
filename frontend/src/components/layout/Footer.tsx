import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-4">

        <div>

          <h2 className="text-2xl font-bold">
            SoilGenie
          </h2>

          <p className="mt-5 text-slate-400">
            AI-powered soil intelligence helping farmers improve productivity,
            sustainability and profitability.
          </p>

        </div>

        <div>

          <h3 className="font-bold">
            Company
          </h3>

          <ul className="mt-5 space-y-3 text-slate-400">

            <li>About</li>
            <li>Solutions</li>
            <li>Pricing</li>
            <li>Blog</li>

          </ul>

        </div>

        <div>

          <h3 className="font-bold">
            Resources
          </h3>

          <ul className="mt-5 space-y-3 text-slate-400">

            <li>Documentation</li>
            <li>Developers</li>
            <li>Support</li>
            <li>FAQ</li>

          </ul>

        </div>

        <div>

          <h3 className="font-bold">
            Contact
          </h3>

          <div className="mt-5 space-y-4 text-slate-400">

            <p className="flex items-center gap-3">
              <Mail size={18} />
              info@soilgenie.ai
            </p>

            <p className="flex items-center gap-3">
              <Phone size={18} />
              +234 XXX XXX XXXX
            </p>

            <p className="flex items-center gap-3">
              <MapPin size={18} />
              Abuja, Nigeria
            </p>

          </div>

        </div>

      </div>

      <div className="border-t border-slate-700 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} SoilGenie. All rights reserved.
      </div>

    </footer>
  );
}