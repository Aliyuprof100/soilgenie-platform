import { SectionTitle, StatCard } from "../ui";

export default function Statistics() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          title="Trusted by Farmers"
          subtitle="Helping farmers increase productivity using AI-powered soil intelligence."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard number="10,800+" label="Farmers" />
          <StatCard number="1,000+" label="Soil Tests" />
          <StatCard number="25%" label="Average Yield Increase" />
          <StatCard number="8" label="States Covered" />
        </div>
      </div>
    </section>
  );
}