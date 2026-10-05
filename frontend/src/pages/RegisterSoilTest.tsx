import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  createSoilTest,
  getSoilSample,
} from "../services/soil";

import type {
  SoilSample,
} from "../services/soil";

export default function RegisterSoilTest() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const sampleId =
    searchParams.get("sample");

  const [sample, setSample] =
    useState<SoilSample | null>(null);

  const [testMethod, setTestMethod] =
    useState<
      | "SOILGENIE_SENSOR"
      | "LABORATORY"
      | "MANUAL"
    >("MANUAL");

  const [notes, setNotes] =
    useState("");

  const [loadingSample, setLoadingSample] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadSample() {
      if (!sampleId) {
        setError(
          "No soil sample was selected."
        );

        setLoadingSample(false);
        return;
      }

      const numericId =
        Number(sampleId);

      if (
        Number.isNaN(numericId) ||
        numericId <= 0
      ) {
        setError(
          "The soil sample ID is invalid."
        );

        setLoadingSample(false);
        return;
      }

      try {
        setLoadingSample(true);
        setError("");

        const data =
          await getSoilSample(
            numericId
          );

        setSample(data);
      } catch (err: any) {
        console.error(
          "Unable to load soil sample:",
          err
        );

        setError(
          err?.message ||
            "Unable to load the selected soil sample."
        );
      } finally {
        setLoadingSample(false);
      }
    }

    loadSample();
  }, [sampleId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!sample) {
      setError(
        "No soil sample is available."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const test =
        await createSoilTest({
          sample: sample.id,
          test_method: testMethod,
          notes:
            notes.trim() ||
            null,
        });

      console.log(
        "Soil test created successfully:",
        test
      );

      navigate(
        `/agent/soil/tests/${test.id}`
      );
    } catch (err: any) {
      console.error(
        "Unable to register soil test:",
        err
      );

      setError(
        err?.message ||
          "Unable to register soil test."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingSample) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-700" />

            <p className="mt-4 text-sm text-slate-500">
              Loading soil sample...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !sample) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/agent/soil/samples"
              )
            }
            className="mb-6 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Soil Samples
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">

            <div className="flex items-start gap-4">

              <div className="text-2xl">
                ⚠️
              </div>

              <div>

                <h1 className="text-xl font-bold text-red-900">
                  Unable to load soil sample
                </h1>

                <p className="mt-2 text-sm text-red-700">
                  {error ||
                    "The selected soil sample could not be found."}
                </p>

              </div>

            </div>

          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!sample) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">

        <div>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/agent/soil/samples/${sample.id}`
              )
            }
            className="mb-4 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Soil Sample
          </button>

          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Soil Intelligence
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Register Soil Test
          </h1>

          <p className="mt-2 text-slate-500">
            Create an analysis record for
            this registered soil sample.
          </p>

        </div>

        <section className="rounded-2xl border bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Soil Sample
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            The soil test will be associated
            with this registered sample.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div className="rounded-xl bg-green-50 p-5">

              <p className="text-sm font-medium text-green-700">
                Sample ID
              </p>

              <p className="mt-2 break-all text-xl font-bold text-green-900">
                {sample.sample_id}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Farm
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {sample.farm_name || "—"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {sample.farm_id || "—"}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Sampling Zone
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {sample.sampling_zone_name ||
                  "No sampling zone"}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Sample Collection Method
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {sample.collection_method ===
                "MANUAL"
                  ? "Manual Collection"
                  : sample.collection_method ===
                    "SENSOR"
                  ? "SoilGenie Sensor"
                  : "Laboratory Collection"}
              </p>

            </div>

          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">

            <div className="flex items-start gap-3">

              <div className="text-xl">
                ⚠️
              </div>

              <div>

                <p className="font-semibold text-red-900">
                  Unable to register soil test
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

              </div>

            </div>

          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-white p-8 shadow-sm"
        >

          <h2 className="text-xl font-bold text-slate-900">
            Test Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select how the soil analysis will
            be performed.
          </p>

          <div className="mt-6">

            <label
              htmlFor="test_method"
              className="block text-sm font-semibold text-slate-700"
            >
              Test Method
            </label>

            <select
              id="test_method"
              value={testMethod}
              onChange={(event) =>
                setTestMethod(
                  event.target.value as
                    | "SOILGENIE_SENSOR"
                    | "LABORATORY"
                    | "MANUAL"
                )
              }
              disabled={submitting}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >

              <option value="MANUAL">
                Manual Entry
              </option>

              <option value="SOILGENIE_SENSOR">
                SoilGenie Sensor
              </option>

              <option value="LABORATORY">
                Laboratory
              </option>

            </select>

            <p className="mt-2 text-xs text-slate-500">
              Choose the method that will be
              used to obtain the soil test
              measurements.
            </p>

          </div>

          <div className="mt-6">

            <label
              htmlFor="notes"
              className="block text-sm font-semibold text-slate-700"
            >
              Test Notes
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              disabled={submitting}
              rows={5}
              placeholder="Enter any relevant information about this soil test..."
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <p className="mt-2 text-xs text-slate-500">
              Optional. You can record
              observations, laboratory references,
              sensor information, or other
              relevant details.
            </p>

          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">

            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                navigate(
                  `/agent/soil/samples/${sample.id}`
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Registering Test..."
                : "Register Soil Test"}
            </button>

          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}