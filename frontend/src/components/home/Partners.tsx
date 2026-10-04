import { technologies } from "../../constants/technologies";
import { SectionTitle } from "../ui";

export default function Partners() {
  return (
    <section className="relative overflow-hidden bg-white py-24">

      {/* Background decoration */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-green-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">

        <SectionTitle
          title="Technology & Intelligence Ecosystem"
          subtitle="SoilGenie brings together modern software, cloud infrastructure, weather intelligence, geospatial capabilities and agricultural knowledge to build a practical platform for Nigerian agriculture."
        />

        <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">

          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="group flex min-h-[165px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:bg-white hover:shadow-lg"
            >

              <div className="flex h-14 items-center justify-center">
                <img
                  src={tech.logo}
                  alt={`${tech.name} logo`}
                  className="max-h-12 w-auto max-w-[130px] object-contain transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <p className="mt-5 font-semibold text-slate-800 transition group-hover:text-green-700">
                {tech.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {tech.category}
              </p>

            </div>
          ))}

        </div>

        <div className="mx-auto mt-12 max-w-3xl text-center">

          <p className="text-sm leading-7 text-slate-500">
            SoilGenie is designed as an extensible agricultural intelligence
            platform. Its technology ecosystem will continue to evolve as
            additional data, geospatial, artificial intelligence and sensing
            capabilities are integrated.
          </p>

        </div>

      </div>

    </section>
  );
}