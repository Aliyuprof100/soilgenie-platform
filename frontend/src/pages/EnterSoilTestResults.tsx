import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  createSoilTestResult,
  getSoilAnalyses,
  getSoilTest,
} from "../services/soil";

import type {
  SoilTest,
  SoilAnalysis,
  CreateSoilTestResultPayload,
} from "../services/soil";

export default function EnterSoilTestResults() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [test, setTest] =
    useState<SoilTest | null>(null);

  const [analysis, setAnalysis] =
    useState<SoilAnalysis | null>(null);

  const [ph, setPh] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [moisture, setMoisture] = useState("");
  const [electricalConductivity, setElectricalConductivity] =
    useState("");
  const [organicMatter, setOrganicMatter] =
    useState("");
  const [temperature, setTemperature] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [loadingAnalysis, setLoadingAnalysis] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Load the soil test.
   */
  useEffect(() => {
    async function loadTest() {
      if (!id) {
        setError(
          "No soil test was selected."
        );

        setLoading(false);
        return;
      }

      const numericId = Number(id);

      if (Number.isNaN(numericId)) {
        setError(
          "The soil test ID is invalid."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await getSoilTest(numericId);

        setTest(data);
      } catch (err: any) {
        console.error(
          "Unable to load soil test:",
          err
        );

        setError(
          err?.message ||
            "Unable to load the selected soil test."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTest();
  }, [id]);

  /*
   * Convert empty fields to null.
   */
  function numberOrNull(
    value: string
  ): number | null {
    if (!value.trim()) {
      return null;
    }

    const number =
      Number(value);

    return Number.isNaN(number)
      ? null
      : number;
  }

  /*
   * Submit soil test results.
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!test) {
      setError(
        "No soil test is available."
      );

      return;
    }

    /*
     * At least one measurement should
     * be entered.
     */
    const hasMeasurement =
      ph.trim() ||
      nitrogen.trim() ||
      phosphorus.trim() ||
      potassium.trim() ||
      moisture.trim() ||
      electricalConductivity.trim() ||
      organicMatter.trim() ||
      temperature.trim();

    if (!hasMeasurement) {
      setError(
        "Please enter at least one soil measurement before submitting."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setAnalysis(null);

      const payload:
        CreateSoilTestResultPayload = {
        /*
         * IMPORTANT:
         *
         * SoilTestResult.test is a ForeignKey
         * to SoilTest, so we send the database
         * ID here, not the UUID test_id.
         */
        test: test.id,

        ph: numberOrNull(ph),

        nitrogen_mg_kg:
          numberOrNull(nitrogen),

        phosphorus_mg_kg:
          numberOrNull(phosphorus),

        potassium_mg_kg:
          numberOrNull(potassium),

        moisture_percent:
          numberOrNull(moisture),

        electrical_conductivity_ds_m:
          numberOrNull(
            electricalConductivity
          ),

        organic_matter_percent:
          numberOrNull(
            organicMatter
          ),

        temperature_celsius:
          numberOrNull(
            temperature
          ),
      };

      console.log(
        "Submitting soil test results:",
        payload
      );

      /*
       * ============================================================
       * STEP 1
       * Create the SoilTestResult.
       * ============================================================
       */
      const result =
        await createSoilTestResult(
          payload
        );

      console.log(
        "Soil test result created successfully:",
        result
      );

      /*
       * ============================================================
       * STEP 2
       * Retrieve the SoilGenie analysis generated
       * by the backend.
       *
       * The backend should create SoilAnalysis
       * after the SoilTestResult is saved.
       * ============================================================
       */
      try {
        setLoadingAnalysis(true);

        console.log(
          "Retrieving generated SoilGenie analysis for test:",
          test.id
        );

        const analyses =
          await getSoilAnalyses(
            test.id
          );

        console.log(
          "Generated SoilGenie analysis:",
          analyses
        );

        /*
         * The endpoint returns an array.
         *
         * Since SoilAnalysis has a OneToOneField
         * with SoilTest, we normally expect one
         * analysis for this test.
         */
        if (
          analyses &&
          analyses.length > 0
        ) {
          const generatedAnalysis =
            analyses[0];

          setAnalysis(
            generatedAnalysis
          );

          console.log(
            "Generated analysis details:",
            generatedAnalysis
          );
        } else {
          console.warn(
            "No SoilGenie analysis was returned for this soil test."
          );
        }
      } catch (analysisError: any) {
        /*
         * The soil result has already been saved.
         *
         * Therefore, failure to retrieve the analysis
         * should not make us report that saving failed.
         */
        console.error(
          "Unable to retrieve generated soil analysis:",
          analysisError
        );
      } finally {
        setLoadingAnalysis(false);
      }

      /*
       * ============================================================
       * STEP 3
       * Refresh the soil test so that the frontend
       * gets the latest status/result information.
       * ============================================================
       */
      try {
        const updatedTest =
          await getSoilTest(
            test.id
          );

        setTest(
          updatedTest
        );

        console.log(
          "Updated soil test after result submission:",
          updatedTest
        );
      } catch (refreshError) {
        console.warn(
          "Soil result was saved, but the soil test could not be refreshed:",
          refreshError
        );
      }

      /*
       * ============================================================
       * STEP 4
       * Navigate to the Soil Test Details page.
       * ============================================================
       */
      navigate(
        `/agent/soil/tests/${test.id}`
      );

    } catch (err: any) {
      console.error(
        "Unable to save soil test results:",
        err
      );

      setError(
        err?.message ||
          "Unable to save soil test results."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-700" />

            <p className="mt-4 text-sm text-slate-500">
              Loading soil test...
            </p>

          </div>
        </div>
      </DashboardLayout>
    );
  }

  /*
   * Error state.
   */
  if (error && !test) {
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

            <h1 className="text-xl font-bold text-red-900">
              Unable to load soil test
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

          </div>

        </div>
      </DashboardLayout>
    );
  }

  if (!test) {
    return null;
  }

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
                `/agent/soil/tests/${test.id}`
              )
            }
            className="mb-4 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Soil Test
          </button>

          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Soil Intelligence
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Enter Soil Test Results
          </h1>

          <p className="mt-2 text-slate-500">
            Record the measured soil parameters
            obtained from the laboratory, sensor,
            or manual analysis.
          </p>

        </div>


        {/* ============================================================
            TEST INFORMATION
        ============================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Soil Test
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            These measurements will be attached
            to this soil test.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">

            <div className="rounded-xl bg-green-50 p-5">

              <p className="text-sm text-green-700">
                Test ID
              </p>

              <p className="mt-2 break-all text-sm font-bold text-green-900">
                {test.test_id}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Sample ID
              </p>

              <p className="mt-2 text-sm font-bold text-slate-900">
                {test.sample_id}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Farm
              </p>

              <p className="mt-2 text-sm font-bold text-slate-900">
                {test.farm_name}
              </p>

            </div>

          </div>

        </section>


        {/* ============================================================
            ANALYSIS STATUS
        ============================================================ */}

        {loadingAnalysis && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">

            <div className="flex items-center gap-3">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />

              <div>

                <p className="font-semibold text-blue-900">
                  Generating SoilGenie analysis...
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  Your soil measurements have been
                  saved. SoilGenie is retrieving the
                  interpretation and recommendations.
                </p>

              </div>

            </div>

          </div>
        )}


        {analysis && (
          <section className="rounded-2xl border border-green-200 bg-green-50 p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                  SoilGenie Analysis Generated
                </p>

                <h2 className="mt-1 text-xl font-bold text-green-900">
                  {analysis.overall_status}
                </h2>

              </div>

              <span className="rounded-full bg-green-700 px-4 py-2 text-xs font-bold text-white">
                Analysis Ready
              </span>

            </div>

            {analysis.summary && (
              <div className="mt-5">

                <p className="text-sm font-semibold text-green-900">
                  Summary
                </p>

                <p className="mt-2 text-sm leading-6 text-green-800">
                  {analysis.summary}
                </p>

              </div>
            )}

            {analysis.recommendations && (
              <div className="mt-5">

                <p className="text-sm font-semibold text-green-900">
                  Recommendations
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-green-800">
                  {analysis.recommendations}
                </p>

              </div>
            )}

          </section>
        )}


        {/* ============================================================
            ERROR
        ============================================================ */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">

            <p className="font-semibold text-red-900">
              Unable to save soil test results
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

          </div>
        )}


        {/* ============================================================
            RESULTS FORM
        ============================================================ */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-white p-8 shadow-sm"
        >

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Soil Measurements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the measured values below.
              Leave a field empty if the parameter
              was not measured.
            </p>

          </div>


          {/* ========================================================
              BASIC SOIL PARAMETERS
          ======================================================== */}

          <div className="mt-8">

            <h3 className="text-lg font-bold text-slate-900">
              Soil Chemistry
            </h3>

            <div className="mt-5 grid gap-6 md:grid-cols-2">

              {/* pH */}

              <div>

                <label
                  htmlFor="ph"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Soil pH
                </label>

                <input
                  id="ph"
                  type="number"
                  step="0.01"
                  min="0"
                  max="14"
                  value={ph}
                  onChange={(event) =>
                    setPh(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 6.50"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Typical scale: 0–14
                </p>

              </div>


              {/* Nitrogen */}

              <div>

                <label
                  htmlFor="nitrogen"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Nitrogen
                  <span className="font-normal text-slate-500">
                    {" "}
                    (mg/kg)
                  </span>
                </label>

                <input
                  id="nitrogen"
                  type="number"
                  step="0.01"
                  min="0"
                  value={nitrogen}
                  onChange={(event) =>
                    setNitrogen(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 25.00"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

              </div>


              {/* Phosphorus */}

              <div>

                <label
                  htmlFor="phosphorus"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Phosphorus
                  <span className="font-normal text-slate-500">
                    {" "}
                    (mg/kg)
                  </span>
                </label>

                <input
                  id="phosphorus"
                  type="number"
                  step="0.01"
                  min="0"
                  value={phosphorus}
                  onChange={(event) =>
                    setPhosphorus(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 18.00"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

              </div>


              {/* Potassium */}

              <div>

                <label
                  htmlFor="potassium"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Potassium
                  <span className="font-normal text-slate-500">
                    {" "}
                    (mg/kg)
                  </span>
                </label>

                <input
                  id="potassium"
                  type="number"
                  step="0.01"
                  min="0"
                  value={potassium}
                  onChange={(event) =>
                    setPotassium(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 120.00"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

              </div>

            </div>

          </div>


          {/* ========================================================
              PHYSICAL PARAMETERS
          ======================================================== */}

          <div className="mt-10">

            <h3 className="text-lg font-bold text-slate-900">
              Soil Physical Properties
            </h3>

            <div className="mt-5 grid gap-6 md:grid-cols-2">

              {/* Moisture */}

              <div>

                <label
                  htmlFor="moisture"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Moisture
                  <span className="font-normal text-slate-500">
                    {" "}
                    (%)
                  </span>
                </label>

                <input
                  id="moisture"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={moisture}
                  onChange={(event) =>
                    setMoisture(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 22.50"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

              </div>


              {/* Electrical Conductivity */}

              <div>

                <label
                  htmlFor="electrical_conductivity"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Electrical Conductivity
                  <span className="font-normal text-slate-500">
                    {" "}
                    (dS/m)
                  </span>
                </label>

                <input
                  id="electrical_conductivity"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={
                    electricalConductivity
                  }
                  onChange={(event) =>
                    setElectricalConductivity(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 0.85"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

              </div>


              {/* Organic Matter */}

              <div>

                <label
                  htmlFor="organic_matter"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Organic Matter
                  <span className="font-normal text-slate-500">
                    {" "}
                    (%)
                  </span>
                </label>

                <input
                  id="organic_matter"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={organicMatter}
                  onChange={(event) =>
                    setOrganicMatter(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 2.40"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

              </div>


              {/* Temperature */}

              <div>

                <label
                  htmlFor="temperature"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Temperature
                  <span className="font-normal text-slate-500">
                    {" "}
                    (°C)
                  </span>
                </label>

                <input
                  id="temperature"
                  type="number"
                  step="0.01"
                  value={temperature}
                  onChange={(event) =>
                    setTemperature(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 28.50"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

              </div>

            </div>

          </div>


          {/* ========================================================
              INFORMATION NOTE
          ======================================================== */}

          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">

            <p className="font-semibold text-green-900">
              SoilGenie measurement record
            </p>

            <p className="mt-1 text-sm leading-6 text-green-800">
              Enter the values exactly as reported
              by the soil sensor, laboratory, or
              approved manual test. You may leave
              parameters blank when they were not
              measured.
            </p>

          </div>


          {/* ========================================================
              ACTIONS
          ======================================================== */}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/agent/soil/tests/${test.id}`
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingAnalysis
              }
              className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving Results..."
                : loadingAnalysis
                ? "Generating Analysis..."
                : "Save Test Results"}
            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}