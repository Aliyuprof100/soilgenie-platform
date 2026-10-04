import {
  MapPinned,
  FlaskConical,
  CloudSun,
  BarChart3,
} from "lucide-react";

import { Card, SectionTitle } from "../ui";

const features = [
  {
    icon: MapPinned,
    title: "Farm Intelligence",
    description:
      "Create digital farm profiles, capture GPS locations and manage important farm information from one place.",
    items: [
      "Farmer and farm profiles",
      "GPS-enabled farm mapping",
      "Farm size and crop information",
      "Farming and irrigation details",
    ],
  },

  {
    icon: FlaskConical,
    title: "Soil Intelligence",
    description:
      "Turn soil measurements into understandable assessments that help farmers and field teams better understand their soil.",
    items: [
      "pH assessment",
      "Nitrogen, phosphorus and potassium",
      "Moisture and organic matter",
      "Electrical conductivity",
    ],
  },

  {
    icon: CloudSun,
    title: "Weather Intelligence",
    description:
      "Combine farm location with weather information to better understand current conditions and upcoming weather patterns.",
    items: [
      "Current weather conditions",
      "Rainfall forecasts",
      "Temperature outlook",
      "Reference ET₀",
    ],
  },

  {
    icon: BarChart3,
    title: "Decision Support",
    description:
      "Transform field information into practical reports and preliminary agricultural insights for better-informed decisions.",
    items: [
      "Soil assessment reports",
      "Crop suitability screening",
      "Farmer-friendly summaries",
      "Technical analysis",
    ],
  },
];

export default function PlatformFeatures() {
  return (
    <section
      id="platform"
      className="relative overflow-hidden bg-white py-24"
    >
      {/* Background decoration */}

      <div className="pointer-events-none absolute left-0 top-20 h-72 w-72 rounded-full bg-green-100/40 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />


      <div className="relative mx-auto max-w-7xl px-6">

        <SectionTitle
          title="One Platform. Multiple Intelligence Layers."
          subtitle="SoilGenie brings farm, soil and weather information together to help turn agricultural data into practical decision support."
        />


        {/* Feature Cards */}

        <div className="mt-14 grid gap-6 md:grid-cols-2">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title}>

                {/* Icon */}

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <Icon className="h-6 w-6 text-green-700" />
                </div>


                {/* Title */}

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {feature.title}
                </h3>


                {/* Description */}

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>


                {/* Capabilities */}

                <ul className="mt-6 space-y-3">

                  {feature.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-slate-600"
                    >

                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                        ✓
                      </span>

                      <span>
                        {item}
                      </span>

                    </li>
                  ))}

                </ul>

              </Card>
            );
          })}

        </div>


        {/* Bottom statement */}

        <div className="mx-auto mt-14 max-w-3xl text-center">

          <p className="text-sm leading-7 text-slate-500">

            SoilGenie is designed to bring these intelligence layers
            together rather than treating soil, farms and weather as
            disconnected sources of information.

          </p>

        </div>

      </div>
    </section>
  );
}