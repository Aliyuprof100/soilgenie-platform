import { Search, FlaskConical, Bot, Sprout } from "lucide-react";
import { Card, SectionTitle } from "../ui";

const steps = [
  {
    icon: Search,
    title: "Collect Soil Sample",
    text: "Farmer or agent inserts the SoilGenie portable device into the soil.",
  },
  {
    icon: FlaskConical,
    title: "Instant Analysis",
    text: "The device measures soil nutrients, moisture, pH and electrical conductivity.",
  },
  {
    icon: Bot,
    title: "AI Recommendation",
    text: "Our AI engine combines laboratory data, satellite imagery and weather forecasts.",
  },
  {
    icon: Sprout,
    title: "Grow Better",
    text: "Receive fertilizer recommendations and expected yield improvements.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-green-50 py-24">

      <div className="mx-auto max-w-7xl px-6">

        <SectionTitle
          title="How SoilGenie Works"
          subtitle="Four simple steps to smarter farming."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card key={step.title}>
                <Icon className="mb-5 h-12 w-12 text-green-700" />

                <h3 className="text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-4 text-slate-600">
                  {step.text}
                </p>
              </Card>
            );
          })}

        </div>

      </div>

    </section>
  );
}