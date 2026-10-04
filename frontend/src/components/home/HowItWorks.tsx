import {
  MapPin,
  FlaskConical,
  BrainCircuit,
  Sprout,
} from "lucide-react";

import { Card, SectionTitle } from "../ui";

const steps = [
  {
    icon: MapPin,
    number: "01",
    title: "Register Your Farm",
    text:
      "Create a digital farm profile with farmer information, farm details, location and GPS coordinates.",
  },

  {
    icon: FlaskConical,
    number: "02",
    title: "Test Your Soil",
    text:
      "Record important soil measurements such as pH, nitrogen, phosphorus, potassium, moisture, organic matter and electrical conductivity.",
  },

  {
    icon: BrainCircuit,
    number: "03",
    title: "Get Soil Intelligence",
    text:
      "SoilGenie interprets available measurements and provides soil-condition assessments, crop suitability screening and practical decision support.",
  },

  {
    icon: Sprout,
    number: "04",
    title: "Make Better Decisions",
    text:
      "Use soil, farm and weather information together to guide crop planning and field management decisions.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-green-50 py-24">

      {/* Background decoration */}

      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-green-200/30 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />


      <div className="relative mx-auto max-w-7xl px-6">

        <SectionTitle
          title="How SoilGenie Works"
          subtitle="From farm data to practical agricultural intelligence in four simple steps."
        />


        {/* Steps */}

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card key={step.title}>

                {/* Step number */}

                <div className="mb-6 flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">

                    <Icon className="h-6 w-6 text-green-700" />

                  </div>


                  <span className="text-sm font-bold tracking-wider text-green-600">
                    {step.number}
                  </span>

                </div>


                {/* Title */}

                <h3 className="text-xl font-bold text-slate-900">
                  {step.title}
                </h3>


                {/* Description */}

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {step.text}
                </p>

              </Card>
            );
          })}

        </div>


        {/* Connecting message */}

        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-green-200 bg-white/80 p-6 text-center shadow-sm backdrop-blur">

          <p className="text-sm leading-7 text-slate-600">

            SoilGenie brings together{" "}
            <span className="font-semibold text-green-700">
              farm information
            </span>
            ,{" "}
            <span className="font-semibold text-green-700">
              soil measurements
            </span>
            , and{" "}
            <span className="font-semibold text-green-700">
              weather intelligence
            </span>
            {" "}to help turn field data into more informed agricultural decisions.

          </p>

        </div>

      </div>

    </section>
  );
}