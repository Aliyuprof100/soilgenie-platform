import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#08240f] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <div className="inline-flex rounded-2xl bg-[#061d0b] p-3 ring-1 ring-white/10">
            <img src="/soilgenie-full-logo.jpg" alt="SoilGenie Ltd" className="h-24 w-40 object-cover object-center" />
          </div>
          <p className="mt-6 max-w-md text-sm leading-7 text-green-100/75">
            Soil and farm intelligence designed to help farmers, field teams and agricultural organisations make better-informed decisions.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-green-100">
            <MapPin className="h-4 w-4 text-[#4ab985]" />
            Built for Nigerian agriculture
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Explore</h3>
          <ul className="mt-5 space-y-3 text-sm text-green-100/70">
            <li><a href="#platform" className="transition hover:text-white">Solutions</a></li>
            <li><a href="#how-it-works" className="transition hover:text-white">How it works</a></li>
            <li><a href="#roadmap" className="transition hover:text-white">Roadmap</a></li>
            <li><Link to="/register" className="transition hover:text-white">Create an account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Get in touch</h3>
          <div className="mt-5 space-y-4 text-sm text-green-100/70">
            <p className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[#4ab985]" />
              <a href="mailto:hello@soilgenie.com.ng" className="transition hover:text-white">Contact SoilGenie</a>
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-[#4ab985]" />
              Nigeria
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-green-100/55 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} SoilGenie Ltd. All rights reserved.</span>
          <a href="https://www.haidarsoft.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition hover:text-white">
            Designed and developed by HaidarSoft Technologies Ltd. <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}