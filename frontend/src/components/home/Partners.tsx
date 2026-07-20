import { technologies } from "../../constants/technologies";
import { SectionTitle } from "../ui";

export default function Partners() {
  

  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title="Powered By World-Class Technologies"
          subtitle="SoilGenie leverages industry-leading open-source frameworks, cloud platforms, artificial intelligence, geospatial technologies, and IoT standards to deliver precision agriculture at scale."
        />

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">

          {technologies.map((tech) => (
  <div
    key={tech.name}
    className="flex flex-col items-center rounded-2xl border bg-slate-50 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
  >
    <img
      src={tech.logo}
      alt={tech.name}
      className="h-14 w-auto object-contain"
    />

    <p className="mt-5 text-center font-semibold text-slate-700">
      {tech.name}
    </p>
  </div>
))}

        </div>

      </div>

    </section>
  );
}