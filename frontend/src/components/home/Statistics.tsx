import { SectionTitle, StatCard } from "../ui";

export default function Statistics() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24">

      {/* Background decoration */}

      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-green-100/50 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />


      <div className="relative mx-auto max-w-7xl px-6">

        <SectionTitle
          title="SoilGenie in Numbers"
          subtitle="Our growing field experience reflects the people, farms and soil assessments reached through the SoilGenie ecosystem."
        />


        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            number="10,800+"
            label="People Reached"
          />

          <StatCard
            number="9,400+"
            label="Active Users"
          />

          <StatCard
            number="1,000+"
            label="Soil Tests"
          />

          <StatCard
            number="300+"
            label="MSMEs & Agricultural Businesses Supported"
          />

        </div>


        {/* Supporting message */}

        <div className="mx-auto mt-12 max-w-3xl text-center">

          <p className="text-sm leading-7 text-slate-500">

            SoilGenie is being developed to make agricultural data more
            accessible to farmers, field agents, agribusinesses and
            organisations working to improve productivity and resilience
            across Nigeria.

          </p>

        </div>

      </div>

    </section>
  );
}