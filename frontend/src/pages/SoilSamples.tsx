import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  getSoilSamples,
} from "../services/soil";

import type {
  SoilSample,
} from "../services/soil";

export default function SoilSamples() {
  const navigate = useNavigate();

  const [samples, setSamples] =
    useState<SoilSample[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * Load soil samples
   */
  useEffect(() => {
    async function loadSoilSamples() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getSoilSamples();

        setSamples(data);
      } catch (err: any) {
        console.error(
          "Unable to load soil samples:",
          err
        );

        setError(
          err?.message ||
            "Unable to load soil samples."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSoilSamples();
  }, []);

  /*
   * Format collection method
   */
  function formatCollectionMethod(
    method: SoilSample["collection_method"]
  ) {
    switch (method) {
      case "MANUAL":
        return "Manual";

      case "SENSOR":
        return "SoilGenie Sensor";

      case "LAB":
        return "Laboratory";

      default:
        return method;
    }
  }

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
        month: "short",
        day: "numeric",
      }
    );
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
      case "RECEIVED":
      case "TESTING":
        return "bg-yellow-100 text-yellow-700";

      case "FAILED":
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  /*
   * Open soil sample details
   */
  function handleViewSample(
    sample: SoilSample
  ) {
    navigate(
      `/agent/soil/samples/${sample.id}`
    );
  }

  /*
   * Register a soil test for this sample
   */
  function handleRegisterTest(
    sample: SoilSample
  ) {
    navigate(
      `/agent/soil/tests/register?sample=${sample.id}`
    );
  }

  return (
    <DashboardLayout>

      <div className="mx-auto max-w-7xl space-y-8">

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <button
              type="button"
              onClick={() =>
                navigate("/agent")
              }
              className="mb-4 text-sm font-semibold text-green-700 hover:text-green-800"
            >
              ← Back to Dashboard
            </button>

            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Soil Intelligence
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Soil Samples
            </h1>

            <p className="mt-2 text-slate-500">
              View and manage soil samples
              registered in SoilGenie.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/agent/soil/samples/register"
              )
            }
            className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            + Register Soil Sample
          </button>

        </div>


        {/* ============================================================
            ERROR
        ============================================================ */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

            <div className="flex items-start gap-3">

              <div className="mt-0.5 text-lg">
                ⚠️
              </div>

              <div>

                <p className="font-semibold">
                  Unable to load soil samples
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>

              </div>

            </div>

          </div>
        )}


        {/* ============================================================
            SUMMARY
        ============================================================ */}

        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Total Samples
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading
                ? "..."
                : samples.length}
            </p>

          </div>


          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              With GPS
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading
                ? "..."
                : samples.filter(
                    (sample) =>
                      sample.latitude !==
                        null &&
                      sample.latitude !==
                        undefined &&
                      sample.longitude !==
                        null &&
                      sample.longitude !==
                        undefined
                  ).length}
            </p>

          </div>


          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Manual Samples
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading
                ? "..."
                : samples.filter(
                    (sample) =>
                      sample.collection_method ===
                      "MANUAL"
                  ).length}
            </p>

          </div>

        </div>


        {/* ============================================================
            SAMPLES TABLE
        ============================================================ */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <div className="border-b p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Registered Soil Samples
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Samples recently registered
              through SoilGenie.
            </p>

          </div>


          {/* ==========================================================
              LOADING
          ========================================================== */}

          {loading ? (

            <div className="p-10 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-green-700" />

              <p className="mt-4 text-sm text-slate-500">
                Loading soil samples...
              </p>

            </div>


          ) : samples.length === 0 ? (

            /* ========================================================
               EMPTY STATE
            ======================================================== */

            <div className="p-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🌱
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No soil samples yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Register your first soil
                sample to start building
                your soil intelligence
                records.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/agent/soil/samples/register"
                  )
                }
                className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
              >
                Register Soil Sample
              </button>

            </div>


          ) : (

            /* ========================================================
               TABLE
            ======================================================== */

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sample ID
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Farm
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Sampling Zone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Method
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Depth
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Collection Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y">

                  {samples.map(
                    (sample) => (

                      <tr
                        key={sample.id}
                        className="hover:bg-slate-50"
                      >

                        {/* ==================================================
                            SAMPLE ID
                        ================================================== */}

                        <td className="px-6 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              handleViewSample(
                                sample
                              )
                            }
                            className="font-semibold text-green-700 hover:text-green-800"
                          >
                            {sample.sample_id}
                          </button>

                        </td>


                        {/* ==================================================
                            FARM
                        ================================================== */}

                        <td className="px-6 py-5">

                          <p className="font-medium text-slate-900">
                            {sample.farm_name ||
                              "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {sample.farm_id ||
                              "—"}
                          </p>

                        </td>


                        {/* ==================================================
                            SAMPLING ZONE
                        ================================================== */}

                        <td className="px-6 py-5 text-sm text-slate-700">

                          {sample.sampling_zone_name ||
                            "No zone"}

                        </td>


                        {/* ==================================================
                            METHOD
                        ================================================== */}

                        <td className="px-6 py-5 text-sm text-slate-700">

                          {formatCollectionMethod(
                            sample.collection_method
                          )}

                        </td>


                        {/* ==================================================
                            DEPTH
                        ================================================== */}

                        <td className="px-6 py-5 text-sm text-slate-700">

                          {sample.sampling_depth_cm !==
                            null &&
                          sample.sampling_depth_cm !==
                            undefined
                            ? `${sample.sampling_depth_cm} cm`
                            : "—"}

                        </td>


                        {/* ==================================================
                            COLLECTION DATE
                        ================================================== */}

                        <td className="px-6 py-5 text-sm text-slate-700">

                          {formatDate(
                            sample.collection_date
                          )}

                        </td>


                        {/* ==================================================
                            STATUS
                        ================================================== */}

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              sample.status
                            )}`}
                          >
                            {sample.status ||
                              "Unknown"}
                          </span>

                        </td>


                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <td className="px-6 py-5">

                          <div className="flex flex-col gap-2">

                            {/* View Details */}

                            <button
                              type="button"
                              onClick={() =>
                                handleViewSample(
                                  sample
                                )
                              }
                              className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              View Details
                            </button>


                            {/* Register Test */}

                            <button
                              type="button"
                              onClick={() =>
                                handleRegisterTest(
                                  sample
                                )
                              }
                              className="whitespace-nowrap rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800"
                            >
                              Register Test
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </DashboardLayout>
  );
}