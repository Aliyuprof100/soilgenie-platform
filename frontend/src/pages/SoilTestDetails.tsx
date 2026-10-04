import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  getSoilTest,
  getSoilAnalyses,
  getSoilRecommendation,
} from "../services/soil";

import type {
  SoilTest,
  SoilAnalysis,
  SoilRecommendation,
  CropRecommendation,
} from "../services/soil";


export default function SoilTestDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [test, setTest] =
    useState<SoilTest | null>(null);

  const [analysis, setAnalysis] =
    useState<SoilAnalysis | null>(null);

  const [recommendation, setRecommendation] =
    useState<SoilRecommendation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);

  const [
    recommendationLoading,
    setRecommendationLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    recommendationError,
    setRecommendationError,
  ] = useState("");


  useEffect(() => {
    async function loadSoilTest() {
      if (!id) {
        setError(
          "No soil test was specified."
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

        const testData =
          await getSoilTest(
            numericId
          );

        setTest(testData);

        if (testData.result) {
          setAnalysisLoading(true);
          setRecommendationLoading(true);

          const [
            analysisResult,
            recommendationResult,
          ] = await Promise.allSettled([
            getSoilAnalyses(
              numericId
            ),
            getSoilRecommendation(
              testData.result.id
            ),
          ]);

          if (
            analysisResult.status ===
            "fulfilled"
          ) {
            const analyses =
              analysisResult.value;

            if (
              analyses &&
              analyses.length > 0
            ) {
              setAnalysis(
                analyses[0]
              );
            } else {
              setAnalysis(null);
            }
          } else {
            console.error(
              "Unable to load SoilGenie analysis:",
              analysisResult.reason
            );

            setAnalysis(null);
          }

          if (
            recommendationResult.status ===
            "fulfilled"
          ) {
            setRecommendation(
              recommendationResult.value
            );

            setRecommendationError("");
          } else {
            console.error(
              "Unable to load SoilGenie recommendation:",
              recommendationResult.reason
            );

            setRecommendation(null);

            setRecommendationError(
              recommendationResult.reason
                ?.message ||
                "Unable to load crop intelligence."
            );
          }

          setAnalysisLoading(false);
          setRecommendationLoading(false);
        } else {
          setAnalysis(null);
          setRecommendation(null);
        }
      } catch (err: any) {
        console.error(
          "Unable to load soil test:",
          err
        );

        setError(
          err?.message ||
            "Unable to load the soil test."
        );
      } finally {
        setLoading(false);
        setAnalysisLoading(false);
        setRecommendationLoading(false);
      }
    }

    loadSoilTest();
  }, [id]);


  function formatTestMethod(
    method: SoilTest["test_method"]
  ) {
    switch (method) {
      case "SOILGENIE_SENSOR":
        return "SoilGenie Sensor";

      case "LABORATORY":
        return "Laboratory";

      case "MANUAL":
        return "Manual Entry";

      default:
        return method;
    }
  }


  function getStatusClass(
    status: SoilTest["status"]
  ) {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "PROCESSING":
        return "bg-blue-100 text-blue-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }


  function getAnalysisStatusClass(
    status?: string | null
  ) {
    switch (
      status?.toUpperCase()
    ) {
      case "GOOD":
      case "OPTIMAL":
      case "ADEQUATE":
      case "VALID":
      case "NORMAL":
      case "AVAILABLE":
        return "bg-green-100 text-green-800 border-green-200";

      case "MODERATE":
      case "WARNING":
      case "CONDITIONAL":
      case "LIMITED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";

      case "POOR":
      case "LOW":
      case "MARGINAL":
      case "INCOMPLETE":
        return "bg-orange-100 text-orange-800 border-orange-200";

      case "CRITICAL":
      case "CRITICAL_CONSTRAINT":
      case "BLOCKED":
      case "UNSUITABLE":
        return "bg-red-100 text-red-800 border-red-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  }


  function getAnalysisIcon(
    status?: string | null
  ) {
    switch (
      status?.toUpperCase()
    ) {
      case "GOOD":
      case "OPTIMAL":
      case "ADEQUATE":
      case "VALID":
      case "NORMAL":
      case "AVAILABLE":
        return "✓";

      case "MODERATE":
      case "WARNING":
      case "CONDITIONAL":
      case "LIMITED":
      case "INCOMPLETE":
        return "⚠";

      case "POOR":
      case "LOW":
      case "MARGINAL":
        return "!";

      case "CRITICAL":
      case "CRITICAL_CONSTRAINT":
      case "BLOCKED":
      case "UNSUITABLE":
        return "⚠";

      default:
        return "•";
    }
  }


  function getCropCardClass(
    crop: CropRecommendation
  ) {
    if (
      crop.automatic_recommendation
    ) {
      return "border-green-200 bg-green-50";
    }

    switch (
      crop.decision
    ) {
      case "CONDITIONAL":
        return "border-yellow-200 bg-yellow-50";

      case "HOLD":
        return "border-orange-200 bg-orange-50";

      case "VERIFY_MEASUREMENTS":
        return "border-blue-200 bg-blue-50";

      case "DO_NOT_RECOMMEND":
        return "border-red-200 bg-red-50";

      default:
        return "border-slate-200 bg-slate-50";
    }
  }


  function getCropDecisionLabel(
    crop: CropRecommendation
  ) {
    if (
      crop.automatic_recommendation
    ) {
      return "Recommended";
    }

    switch (
      crop.decision
    ) {
      case "CONDITIONAL":
        return "Conditional";

      case "HOLD":
        return "Hold";

      case "VERIFY_MEASUREMENTS":
        return "Verify Measurements";

      case "DO_NOT_RECOMMEND":
        return "Not Recommended";

      default:
        return crop.decision
          .replace(/_/g, " ");
    }
  }


  function formatSuitability(
    value?: string | null
  ) {
    if (!value) {
      return "Not assessed";
    }

    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  }


  function formatDate(
    date?: string | null
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

    return parsedDate.toLocaleString(
      "en-NG",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }


  function displayValue(
    value?: number | null
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    return value;
  }


  const allCropRecommendations =
    recommendation
      ? [
          ...recommendation
            .crop_recommendations
            .recommended,
          ...recommendation
            .crop_recommendations
            .conditional,
          ...recommendation
            .crop_recommendations
            .hold,
          ...recommendation
            .crop_recommendations
            .avoid,
        ]
      : [];


  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-6xl">
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


  if (error || !test) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-6xl">
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
              {error ||
                "The requested soil test could not be found."}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ================================================================
            PAGE HEADER
           ================================================================ */}

        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/agent/soil/samples/${test.sample}`
              )
            }
            className="mb-4 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Soil Sample
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                Soil Intelligence
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Soil Test
              </h1>

              <p className="mt-2 max-w-3xl text-slate-500">
                View soil measurements,
                SoilGenie analysis, crop
                suitability and practical
                decision-support guidance.
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                test.status
              )}`}
            >
              {test.status}
            </span>
          </div>
        </div>


        {/* ================================================================
            TEST SUMMARY
           ================================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm text-slate-500">
                Test ID
              </p>

              <h2 className="mt-1 break-all text-xl font-bold text-green-700">
                {test.test_id}
              </h2>
            </div>

            <div className="text-left md:text-right">
              <p className="text-sm text-slate-500">
                Registered
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(
                  test.created_at
                )}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Sample ID
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {test.sample_id}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Farm
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {test.farm_name}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Test Method
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {formatTestMethod(
                  test.test_method
                )}
              </p>
            </div>
          </div>
        </section>


        {/* ================================================================
            TEST STATUS
           ================================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Test Status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current processing status of
            this soil analysis.
          </p>

          <div className="mt-6 rounded-xl border bg-slate-50 p-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${getStatusClass(
                  test.status
                )}`}
              >
                {test.status ===
                "COMPLETED"
                  ? "✓"
                  : test.status ===
                      "FAILED"
                    ? "!"
                    : "•"}
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  {test.status}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {test.status ===
                    "PENDING" &&
                    "This soil test has been registered and is waiting for measurements."}

                  {test.status ===
                    "PROCESSING" &&
                    "The soil test is currently being processed."}

                  {test.status ===
                    "COMPLETED" &&
                    "Soil measurements have been recorded and SoilGenie intelligence has been generated."}

                  {test.status ===
                    "FAILED" &&
                    "The soil test could not be completed. Please review the test information."}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ================================================================
            NOTES
           ================================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Test Notes
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Additional information recorded
            during test registration.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-6">
            {test.notes ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {test.notes}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400">
                No notes were added for
                this soil test.
              </p>
            )}
          </div>
        </section>


        {/* ================================================================
            MEASUREMENTS
           ================================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Soil Test Results
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Measured soil parameters
                recorded for this test.
              </p>
            </div>

            {!test.result && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/agent/soil/tests/${test.id}/results`
                  )
                }
                className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
              >
                Enter Test Results
              </button>
            )}
          </div>

          {test.result ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MeasurementCard
                name="pH"
                value={displayValue(
                  test.result.ph
                )}
                highlight
              />

              <MeasurementCard
                name="Nitrogen"
                value={displayValue(
                  test.result
                    .nitrogen_mg_kg
                )}
                unit="mg/kg"
              />

              <MeasurementCard
                name="Phosphorus"
                value={displayValue(
                  test.result
                    .phosphorus_mg_kg
                )}
                unit="mg/kg"
              />

              <MeasurementCard
                name="Potassium"
                value={displayValue(
                  test.result
                    .potassium_mg_kg
                )}
                unit="mg/kg"
              />

              <MeasurementCard
                name="Moisture"
                value={displayValue(
                  test.result
                    .moisture_percent
                )}
                unit="%"
              />

              <MeasurementCard
                name="Organic Matter"
                value={displayValue(
                  test.result
                    .organic_matter_percent
                )}
                unit="%"
              />

              <MeasurementCard
                name="Electrical Conductivity"
                value={displayValue(
                  test.result
                    .electrical_conductivity_ds_m
                )}
                unit="dS/m"
              />

              <MeasurementCard
                name="Temperature"
                value={displayValue(
                  test.result
                    .temperature_celsius
                )}
                unit="°C"
              />
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                🧪
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                No test results yet
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                The soil test has been
                registered, but no
                measurements have been
                recorded yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/agent/soil/tests/${test.id}/results`
                  )
                }
                className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
              >
                Enter Test Results
              </button>
            </div>
          )}
        </section>


        {/* ================================================================
            ORIGINAL SOIL ANALYSIS
           ================================================================ */}

        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                SoilGenie Intelligence
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Soil Analysis
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Initial interpretation of
                the measured soil
                parameters using the
                SoilGenie rule engine.
              </p>
            </div>

            {analysis && (
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${getAnalysisStatusClass(
                  analysis.overall_status
                )}`}
              >
                <span>
                  {getAnalysisIcon(
                    analysis.overall_status
                  )}
                </span>

                {analysis.overall_status}
              </span>
            )}
          </div>

          {analysisLoading && (
            <LoadingPanel text="Loading SoilGenie analysis..." />
          )}

          {!analysisLoading &&
            analysis && (
              <div className="mt-8 space-y-6">
                <div
                  className={`rounded-2xl border p-6 ${getAnalysisStatusClass(
                    analysis.overall_status
                  )}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                      {getAnalysisIcon(
                        analysis.overall_status
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide">
                        Overall Soil Condition
                      </p>

                      <h3 className="mt-1 text-2xl font-bold">
                        {
                          analysis.overall_status
                        }
                      </h3>

                      {analysis.summary && (
                        <p className="mt-3 text-sm leading-6">
                          {
                            analysis.summary
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Parameter Assessment
                  </h3>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        name: "pH",
                        status:
                          analysis.ph_status,
                      },
                      {
                        name: "Nitrogen",
                        status:
                          analysis
                            .nitrogen_status,
                      },
                      {
                        name: "Phosphorus",
                        status:
                          analysis
                            .phosphorus_status,
                      },
                      {
                        name: "Potassium",
                        status:
                          analysis
                            .potassium_status,
                      },
                      {
                        name: "Moisture",
                        status:
                          analysis
                            .moisture_status,
                      },
                      {
                        name:
                          "Organic Matter",
                        status:
                          analysis
                            .organic_matter_status,
                      },
                    ].map(
                      (parameter) => (
                        <div
                          key={
                            parameter.name
                          }
                          className="rounded-xl border bg-slate-50 p-5"
                        >
                          <p className="text-sm font-semibold text-slate-600">
                            {
                              parameter.name
                            }
                          </p>

                          <p
                            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-bold ${getAnalysisStatusClass(
                              parameter.status
                            )}`}
                          >
                            {parameter.status ||
                              "Not assessed"}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    General Soil Guidance
                  </h3>

                  <div className="mt-4 grid gap-5 md:grid-cols-2">
                    <AnalysisCard
                      title="General Recommendations"
                      text={
                        analysis.recommendations ||
                        "No general recommendation was generated."
                      }
                    />

                    <AnalysisCard
                      title="Fertilizer Recommendation"
                      text={
                        analysis.fertilizer_recommendation ||
                        "No fertilizer recommendation was generated."
                      }
                    />

                    <AnalysisCard
                      title="Soil Amendment"
                      text={
                        analysis.amendment_recommendation ||
                        "No amendment recommendation was generated."
                      }
                    />

                    <AnalysisCard
                      title="Irrigation Recommendation"
                      text={
                        analysis.irrigation_recommendation ||
                        "No irrigation recommendation was generated."
                      }
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Generated By
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {analysis.generated_by ||
                          "SoilGenie Rule Engine"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Analysis Generated
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatDate(
                          analysis.created_at
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {!analysisLoading &&
            !analysis &&
            test.result && (
              <EmptyPanel
                icon="🧠"
                title="Analysis not available"
                text="Soil measurements have been recorded, but SoilGenie has not returned an analysis for this test yet."
              />
            )}

          {!analysisLoading &&
            !test.result && (
              <EmptyPanel
                icon="🧪"
                title="Analysis will appear here"
                text="Enter the soil measurements first. SoilGenie will automatically generate the analysis."
              />
            )}
        </section>


        {/* ================================================================
            ADVANCED RECOMMENDATION ENGINE
           ================================================================ */}

        {test.result && (
          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b bg-gradient-to-r from-green-50 via-white to-emerald-50 p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                SoilGenie Crop Intelligence
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Crop Suitability &
                Decision Support
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                SoilGenie evaluates
                measurement quality,
                soil constraints and
                provisional crop
                suitability to support
                better field decisions.
              </p>
            </div>

            <div className="p-8">
              {recommendationLoading && (
                <LoadingPanel text="Generating crop intelligence..." />
              )}

              {!recommendationLoading &&
                recommendationError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <h3 className="font-bold text-red-900">
                      Crop intelligence
                      unavailable
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-red-700">
                      {
                        recommendationError
                      }
                    </p>
                  </div>
                )}

              {!recommendationLoading &&
                recommendation && (
                  <div className="space-y-8">

                    {/* Validation status */}

                    <div className="grid gap-5 lg:grid-cols-3">
                      <div
                        className={`rounded-2xl border p-6 ${getAnalysisStatusClass(
                          recommendation
                            .measurement_validation
                            .overall_status
                        )}`}
                      >
                        <p className="text-xs font-bold uppercase tracking-wide">
                          Measurement Quality
                        </p>

                        <h3 className="mt-2 text-2xl font-bold">
                          {
                            recommendation
                              .measurement_validation
                              .overall_status
                          }
                        </h3>

                        <p className="mt-3 text-sm leading-6">
                          {
                            recommendation
                              .measurement_validation
                              .summary
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                        <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                          Best Safe Crop
                        </p>

                        <h3 className="mt-2 text-2xl font-bold text-green-950">
                          {recommendation.best_crop ||
                            "Not available"}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-green-800">
                          {recommendation.best_crop
                            ? "This crop currently has the strongest safe recommendation among the crops assessed."
                            : "SoilGenie has not identified a crop that can currently be presented as an automatic recommendation."}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                          Provisional Best Fit
                        </p>

                        <h3 className="mt-2 text-2xl font-bold text-blue-950">
                          {recommendation.provisional_best_crop ||
                            "Not available"}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-blue-800">
                          Informational
                          ranking only. A
                          provisional best
                          fit is not
                          necessarily a
                          planting
                          recommendation.
                        </p>
                      </div>
                    </div>


                    {/* Farmer summary */}

                    <div className="rounded-2xl border border-green-200 bg-green-50 p-7">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                          🌱
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                            Farmer Summary
                          </p>

                          <h3 className="mt-1 text-xl font-bold text-green-950">
                            What this soil
                            result means
                          </h3>

                          <p className="mt-3 text-sm leading-7 text-green-900">
                            {
                              recommendation.farmer_summary
                            }
                          </p>
                        </div>
                      </div>
                    </div>


                    {/* Soil conditions */}

                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Soil Condition
                        Breakdown
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Key strengths,
                        limitations, risks
                        and suggested next
                        actions identified
                        from the current
                        measurements.
                      </p>

                      <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <ListCard
                          title="Strengths"
                          icon="✓"
                          items={
                            recommendation
                              .soil_conditions
                              .strengths
                          }
                          emptyText="No specific strengths were identified."
                          className="border-green-200 bg-green-50"
                          titleClassName="text-green-900"
                        />

                        <ListCard
                          title="Limitations"
                          icon="!"
                          items={
                            recommendation
                              .soil_conditions
                              .limitations
                          }
                          emptyText="No major soil limitations were identified."
                          className="border-orange-200 bg-orange-50"
                          titleClassName="text-orange-900"
                        />

                        <ListCard
                          title="Risks"
                          icon="⚠"
                          items={
                            recommendation
                              .soil_conditions
                              .risks
                          }
                          emptyText="No major risks were identified."
                          className="border-red-200 bg-red-50"
                          titleClassName="text-red-900"
                        />

                        <ListCard
                          title="Recommended Next Steps"
                          icon="→"
                          items={
                            recommendation
                              .soil_conditions
                              .actions
                          }
                          emptyText="No additional actions were generated."
                          className="border-blue-200 bg-blue-50"
                          titleClassName="text-blue-900"
                        />
                      </div>
                    </div>


                    {/* Missing / warning measurements */}

                    {(
                      recommendation
                        .measurement_validation
                        .missing_measurements
                        .length > 0 ||
                      recommendation
                        .measurement_validation
                        .warning_measurements
                        .length > 0 ||
                      recommendation
                        .measurement_validation
                        .critical_measurements
                        .length > 0
                    ) && (
                      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
                        <h3 className="font-bold text-yellow-950">
                          Measurements
                          Requiring Attention
                        </h3>

                        <div className="mt-4 space-y-3">
                          {[
                            ...recommendation
                              .measurement_validation
                              .critical_measurements,
                            ...recommendation
                              .measurement_validation
                              .warning_measurements,
                            ...recommendation
                              .measurement_validation
                              .missing_measurements,
                          ].map(
                            (
                              measurement,
                              index
                            ) => (
                              <div
                                key={`${measurement.parameter}-${index}`}
                                className="rounded-xl bg-white p-4"
                              >
                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                  <p className="font-semibold text-slate-900">
                                    {
                                      measurement.parameter
                                    }
                                  </p>

                                  <span
                                    className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${getAnalysisStatusClass(
                                      measurement.severity
                                    )}`}
                                  >
                                    {
                                      measurement.status
                                    }
                                  </span>
                                </div>

                                {measurement.message && (
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {
                                      measurement.message
                                    }
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}


                    {/* Crop recommendations */}

                    <div>
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            Crop Suitability
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Provisional
                            screening of
                            crops against
                            the available
                            soil
                            measurements.
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-slate-500">
                          {
                            allCropRecommendations.length
                          }{" "}
                          crops assessed
                        </span>
                      </div>

                      {allCropRecommendations.length >
                      0 ? (
                        <div className="mt-5 grid gap-5 lg:grid-cols-2">
                          {allCropRecommendations.map(
                            (
                              crop,
                              index
                            ) => (
                              <div
                                key={`${crop.crop}-${index}`}
                                className={`rounded-2xl border p-6 ${getCropCardClass(
                                  crop
                                )}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Crop
                                    </p>

                                    <h4 className="mt-1 text-xl font-bold text-slate-900">
                                      {
                                        crop.crop
                                      }
                                    </h4>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Score
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                      {
                                        crop.score
                                      }
                                      <span className="text-sm font-medium text-slate-500">
                                        /100
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                  <span
                                    className={`rounded-full border px-3 py-1 text-xs font-bold ${getAnalysisStatusClass(
                                      crop.suitability
                                    )}`}
                                  >
                                    {formatSuitability(
                                      crop.suitability
                                    )}
                                  </span>

                                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                                    {getCropDecisionLabel(
                                      crop
                                    )}
                                  </span>

                                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                                    {
                                      crop.confidence
                                    }{" "}
                                    confidence
                                  </span>
                                </div>

                                {crop.reason && (
                                  <p className="mt-4 text-sm leading-6 text-slate-700">
                                    {
                                      crop.reason
                                    }
                                  </p>
                                )}

                                {crop.strengths
                                  .length >
                                  0 && (
                                  <CropDetailList
                                    title="Strengths"
                                    items={
                                      crop.strengths
                                    }
                                  />
                                )}

                                {crop.warnings
                                  .length >
                                  0 && (
                                  <CropDetailList
                                    title="Warnings"
                                    items={
                                      crop.warnings
                                    }
                                  />
                                )}

                                {crop
                                  .critical_constraints
                                  .length >
                                  0 && (
                                  <CropDetailList
                                    title="Critical Constraints"
                                    items={
                                      crop
                                        .critical_constraints
                                    }
                                  />
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                          <p className="font-semibold text-slate-800">
                            No crop
                            suitability
                            results are
                            available.
                          </p>
                        </div>
                      )}
                    </div>


                    {/* Safety note */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Decision-Support
                        Notice
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        SoilGenie crop
                        suitability is a
                        preliminary
                        decision-support
                        screening based on
                        the available soil
                        measurements and
                        configured crop
                        profiles. Important
                        planting,
                        fertilizer and soil
                        amendment decisions
                        should be confirmed
                        using reliable soil
                        testing and locally
                        appropriate
                        agronomic advice.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </section>
        )}


        {/* ================================================================
            FOOTER ACTIONS
           ================================================================ */}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/agent/soil/samples/${test.sample}`
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Soil Sample
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            {test.result && (
              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="rounded-xl border border-green-700 bg-white px-6 py-3 font-semibold text-green-700 hover:bg-green-50"
              >
                Refresh Intelligence
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/agent/soil/samples"
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              All Soil Samples
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


/* ==========================================================================
   LOCAL PRESENTATIONAL COMPONENTS
   ========================================================================== */

function MeasurementCard({
  name,
  value,
  unit,
  highlight = false,
}: {
  name: string;
  value: number | string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 ${
        highlight
          ? "bg-green-50"
          : "bg-slate-50"
      }`}
    >
      <p
        className={`text-sm ${
          highlight
            ? "text-green-700"
            : "text-slate-500"
        }`}
      >
        {name}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          highlight
            ? "text-green-900"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>

      {unit && (
        <p className="mt-1 text-xs text-slate-500">
          {unit}
        </p>
      )}
    </div>
  );
}


function LoadingPanel({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mt-8 rounded-xl border bg-slate-50 p-8 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-green-700" />

      <p className="mt-3 text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}


function EmptyPanel({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}


function AnalysisCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h4 className="font-bold text-slate-900">
        {title}
      </h4>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {text}
      </p>
    </div>
  );
}


function ListCard({
  title,
  icon,
  items,
  emptyText,
  className,
  titleClassName,
}: {
  title: string;
  icon: string;
  items: string[];
  emptyText: string;
  className: string;
  titleClassName: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-bold shadow-sm">
          {icon}
        </div>

        <h4
          className={`font-bold ${titleClassName}`}
        >
          {title}
        </h4>
      </div>

      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map(
            (item, index) => (
              <li
                key={`${title}-${index}`}
                className="flex gap-3 text-sm leading-6 text-slate-700"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />

                <span>
                  {item}
                </span>
              </li>
            )
          )}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-600">
          {emptyText}
        </p>
      )}
    </div>
  );
}


function CropDetailList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="mt-4 rounded-xl bg-white/70 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <ul className="mt-2 space-y-2">
        {items.map(
          (item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex gap-2 text-sm leading-6 text-slate-700"
            >
              <span>•</span>

              <span>
                {item}
              </span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}