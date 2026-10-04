import { ArrowRight, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../ui";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-green-700 py-24">

      {/* Decorative elements */}

      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-950/20 blur-3xl" />


      <div className="relative mx-auto max-w-4xl px-6 text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <Sprout className="h-7 w-7 text-white" />
        </div>


        <h2 className="mt-7 text-4xl font-extrabold tracking-tight text-white md:text-5xl">

          Better Data.
          <br />

          Better Decisions.
          <br />

          Better Farms.

        </h2>


        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-green-100">

          Start building a clearer picture of your farms, soil and
          weather with SoilGenie.

        </p>


        <div className="mt-9 flex flex-wrap justify-center gap-4">

          <Link to="/register">

            <Button>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

          </Link>


          <Link to="/login">

            <button
              type="button"
              className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Sign In
            </button>

          </Link>

        </div>

      </div>

    </section>
  );
}