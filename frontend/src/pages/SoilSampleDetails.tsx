import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  getSoilSample,
} from "../services/soil";

import type {
  SoilSample,
} from "../services/soil";

export default function SoilSampleDetails() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const [sample, setSample] =
    useState<SoilSample | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * Load soil sample
   */

  useEffect(() => {
    async function loadSoilSample() {
      if (!id) {
        setError(
          "No soil sample ID was provided."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getSoilSample(
            Number(id)
          );

        setSample(data);
      } catch (err: any) {
        console.error(
          "Unable to load soil sample:",
          err
        );

        setError(
          err?.message ||
            "Unable to load soil sample."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSoilSample();
  }, [id]);

  /*
   * Format date
   */

  function formatDate(
    date: string
  ) {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-NG",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  /*
   * Safely convert API numeric values.
   *
   * Django / PostgreSQL may sometimes return
   * DecimalField values as strings.
   *
   * Example:
   *
   * "11.123456"
   *
   * needs to become:
   *
   * 11.123456
   */

  function toNumber(
    value: unknown
  ): number | null {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const numericValue =
      typeof value === "number"
        ? value
        : Number(value);

    if (
      Number.isNaN(numericValue)
    ) {
      return null;
    }

    return numericValue;
  }

  /*
   * Format numeric value safely.
   */

  function formatNumber(
    value: unknown,
    decimalPlaces: number
  ): string {
    const numericValue =
      toNumber(value);

    if (numericValue === null) {
      return "Not recorded";
    }

    return numericValue.toFixed(
      decimalPlaces
    );
  }

  /*
   * Format collection method
   */

  function formatCollectionMethod(
    method:
      | "MANUAL"
      | "SENSOR"
      | "LAB"
  ) {
    switch (method) {
      case "MANUAL":
        return "Manual Collection";

      case "SENSOR":
        return "SoilGenie Sensor";

      case "LAB":
        return "Laboratory Collection";

      default:
        return method;
    }
  }

  /*
   * Status styling
   */

  function getStatusClass(
    status: string
  ) {
    switch (
      status?.toUpperCase()
    ) {
      case "COLLECTED":
      case "COMPLETED":
      case "TESTED":
      case "ACTIVE":
        return "bg-green-100 text-green-700";

      case "PENDING":
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-700";

      case "FAILED":
      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  /*
   * Loading screen
   */

  if (loading) {
    return (
      <DashboardLayout>

        <div className="mx-auto max-w-5xl">

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

  /*
   * Error screen
   */

  if (error || !sample) {
    return (
      <DashboardLayout>

        <div className="mx-auto max-w-5xl">

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
                    "The requested soil sample could not be found."}
                </p>

              </div>

            </div>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  /*
   * Safely convert numeric API values.
   */

  const latitude =
    toNumber(sample.latitude);

  const longitude =
    toNumber(sample.longitude);

  const gpsAccuracy =
    toNumber(
      sample.gps_accuracy
    );

  const samplingDepth =
    toNumber(
      sample.sampling_depth_cm
    );

  /*
   * GPS availability
   */

  const hasGPS =
    latitude !== null &&
    longitude !== null;

  return (
    <DashboardLayout>

      <div className="mx-auto max-w-5xl space-y-8">

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/agent/soil/samples"
              )
            }
            className="mb-4 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Soil Samples
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                Soil Intelligence
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Soil Sample Details
              </h1>

              <p className="mt-2 text-slate-500">
                Detailed information about this
                registered soil sample.
              </p>

            </div>

            <span
              className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                sample.status
              )}`}
            >
              {sample.status}
            </span>

          </div>

        </div>

        {/* ============================================================
            SAMPLE IDENTIFICATION
        ============================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Sample ID
              </p>

              <h2 className="mt-2 text-2xl font-bold text-green-700">
                {sample.sample_id}
              </h2>

            </div>

            <div className="rounded-xl bg-green-50 px-5 py-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Registration Status
              </p>

              <p className="mt-1 font-bold text-green-900">
                {sample.status}
              </p>

            </div>

          </div>

        </section>

        {/* ============================================================
            FARM INFORMATION
        ============================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Farm & Sampling Zone
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Information about where the soil
            sample was collected.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Farm
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {sample.farm_name ||
                  "—"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {sample.farm_id ||
                  "—"}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Sampling Zone
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {sample.sampling_zone_name ||
                  "No sampling zone"}
              </p>

              {sample.sampling_zone && (
                <p className="mt-1 text-sm text-slate-500">
                  Zone ID:{" "}
                  {sample.sampling_zone}
                </p>
              )}

            </div>

          </div>

        </section>

        {/* ============================================================
            COLLECTION INFORMATION
        ============================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Sample Collection
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Information about how the sample
            was collected.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Collection Method
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {formatCollectionMethod(
                  sample.collection_method
                )}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Sampling Depth
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {samplingDepth !== null
                  ? `${samplingDepth.toFixed(
                      2
                    )} cm`
                  : "Not recorded"}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Collection Date
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {formatDate(
                  sample.collection_date
                )}
              </p>

            </div>

          </div>

        </section>

        {/* ============================================================
            GPS LOCATION
        ============================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            GPS Location
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Geographic location recorded when
            the sample was collected.
          </p>

          {hasGPS ? (

            <div className="mt-6 grid gap-6 md:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-5">

                <p className="text-sm text-slate-500">
                  Latitude
                </p>

                <p className="mt-2 font-bold text-slate-900">
                  {formatNumber(
                    latitude,
                    7
                  )}
                </p>

              </div>

              <div className="rounded-xl bg-slate-50 p-5">

                <p className="text-sm text-slate-500">
                  Longitude
                </p>

                <p className="mt-2 font-bold text-slate-900">
                  {formatNumber(
                    longitude,
                    7
                  )}
                </p>

              </div>

              <div className="rounded-xl bg-slate-50 p-5">

                <p className="text-sm text-slate-500">
                  GPS Accuracy
                </p>

                <p className="mt-2 font-bold text-slate-900">
                  {gpsAccuracy !== null
                    ? `±${gpsAccuracy.toFixed(
                        1
                      )} m`
                    : "Not recorded"}
                </p>

              </div>

            </div>

          ) : (

            <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5">

              <p className="font-semibold text-yellow-900">
                GPS location was not captured
              </p>

              <p className="mt-1 text-sm text-yellow-800">
                No latitude and longitude
                information was recorded for
                this sample.
              </p>

            </div>

          )}

        </section>

        {/* ============================================================
            COLLECTION AGENT
        ============================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Collection Agent
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Information about the person who
            registered or collected the sample.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              Collected By
            </p>

            <p className="mt-2 font-bold text-slate-900">
              {sample.collected_by_name ||
                "Not recorded"}
            </p>

            {sample.collected_by && (
              <p className="mt-1 text-sm text-slate-500">
                User ID:{" "}
                {sample.collected_by}
              </p>
            )}

          </div>

        </section>

        {/* ============================================================
            NOTES
        ============================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Field Notes
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Observations recorded during
            sample collection.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-5">

            {sample.notes ? (

              <p className="whitespace-pre-wrap text-slate-700">
                {sample.notes}
              </p>

            ) : (

              <p className="text-slate-500">
                No notes were recorded for
                this sample.
              </p>

            )}

          </div>

        </section>

        {/* ============================================================
            RECORD TIMESTAMPS
        ============================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Record Information
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Created At
              </p>

              <p className="mt-2 font-medium text-slate-900">
                {formatDate(
                  sample.created_at
                )}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Last Updated
              </p>

              <p className="mt-2 font-medium text-slate-900">
                {formatDate(
                  sample.updated_at
                )}
              </p>

            </div>

          </div>

        </section>

        {/* ============================================================
            ACTIONS
        ============================================================ */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/agent/soil/samples"
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Soil Samples
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/agent/soil/samples/register"
              )
            }
            className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
          >
            + Register Another Sample
          </button>

        </div>

      </div>

    </DashboardLayout>
  );
}