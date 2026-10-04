import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  getSoilTests,
  downloadSoilReportPdf,
} from "../services/soil";

import type {
  SoilTest,
} from "../services/soil";


// ============================================================================
// TYPES
// ============================================================================

type StatusFilter =
  | "ALL"
  | "READY"
  | "AWAITING"
  | "PROCESSING"
  | "FAILED";

type SortOrder =
  | "NEWEST"
  | "OLDEST";

interface SampleGroup {
  sampleId: string;
  farmName: string;
  tests: SoilTest[];
  latestTest: SoilTest;
  readyCount: number;
  awaitingCount: number;
}


// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Reports() {
  const navigate = useNavigate();

  const [tests, setTests] = useState<SoilTest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [farmFilter, setFarmFilter] =
    useState("ALL");

  const [sortOrder, setSortOrder] =
    useState<SortOrder>("NEWEST");

  const [downloadingId, setDownloadingId] =
    useState<number | null>(null);

  const [expandedSamples, setExpandedSamples] =
    useState<Record<string, boolean>>({});


  // ==========================================================================
  // LOAD REPORTS
  // ==========================================================================

  async function loadReports(
    showRefreshState = false
  ) {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data =
        await getSoilTests();

      setTests(data);
    } catch (err: any) {
      console.error(
        "Unable to load reports:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to load soil reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  useEffect(() => {
    loadReports();
  }, []);


  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  const totalTests =
    tests.length;

  const reportsReady =
    tests.filter(
      (test) =>
        test.status === "COMPLETED" &&
        Boolean(test.result)
    ).length;

  const awaitingResults =
    tests.filter(
      (test) =>
        test.status !== "COMPLETED" ||
        !test.result
    ).length;

  const failedTests =
    tests.filter(
      (test) =>
        test.status === "FAILED"
    ).length;


  const uniqueSampleCount =
    new Set(
      tests
        .map(
          (test) =>
            test.sample_id
        )
        .filter(Boolean)
    ).size;


  // ==========================================================================
  // FARM LIST
  // ==========================================================================

  const farmOptions =
    useMemo(() => {
      const farms = new Set<string>();

      tests.forEach((test) => {
        if (test.farm_name) {
          farms.add(test.farm_name);
        }
      });

      return Array.from(farms).sort(
        (a, b) =>
          a.localeCompare(b)
      );
    }, [tests]);


  // ==========================================================================
  // DATE HELPER
  // ==========================================================================

  function getTestDate(
    test: SoilTest
  ): number {
    const value =
      test.tested_at ||
      test.created_at;

    if (!value) {
      return 0;
    }

    const timestamp =
      new Date(value).getTime();

    return Number.isNaN(timestamp)
      ? 0
      : timestamp;
  }


  // ==========================================================================
  // STATUS FILTER
  // ==========================================================================

  function matchesStatus(
    test: SoilTest
  ): boolean {
    switch (statusFilter) {
      case "READY":
        return (
          test.status ===
            "COMPLETED" &&
          Boolean(test.result)
        );

      case "AWAITING":
        return (
          test.status !==
            "COMPLETED" ||
          !test.result
        );

      case "PROCESSING":
        return (
          test.status ===
          "PROCESSING"
        );

      case "FAILED":
        return (
          test.status ===
          "FAILED"
        );

      case "ALL":
      default:
        return true;
    }
  }


  // ==========================================================================
  // FILTER + GROUP BY SAMPLE
  // ==========================================================================

  const sampleGroups =
    useMemo<SampleGroup[]>(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      const filtered =
        tests.filter((test) => {

          // ---------------------------------------------------------------
          // STATUS
          // ---------------------------------------------------------------

          if (
            !matchesStatus(test)
          ) {
            return false;
          }


          // ---------------------------------------------------------------
          // FARM
          // ---------------------------------------------------------------

          if (
            farmFilter !== "ALL" &&
            test.farm_name !==
              farmFilter
          ) {
            return false;
          }


          // ---------------------------------------------------------------
          // SEARCH
          // ---------------------------------------------------------------

          if (
            !normalizedSearch
          ) {
            return true;
          }

          const searchable = [
            test.sample_id,
            test.test_id,
            test.farm_name,
            test.status,
            test.test_method,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            normalizedSearch
          );
        });


      // ---------------------------------------------------------------
      // GROUP BY SAMPLE
      // ---------------------------------------------------------------

      const groups =
        new Map<
          string,
          SoilTest[]
        >();

      filtered.forEach(
        (test) => {
          const sampleId =
            test.sample_id ||
            `TEST-${test.id}`;

          const existing =
            groups.get(sampleId) ||
            [];

          existing.push(test);

          groups.set(
            sampleId,
            existing
          );
        }
      );


      // ---------------------------------------------------------------
      // CONVERT TO GROUP OBJECTS
      // ---------------------------------------------------------------

      const result: SampleGroup[] =
        Array.from(
          groups.entries()
        ).map(
          ([sampleId, groupTests]) => {

            const sortedTests =
              [...groupTests].sort(
                (a, b) =>
                  getTestDate(b) -
                  getTestDate(a)
              );


            const latestTest =
              sortedTests[0];


            const readyCount =
              groupTests.filter(
                (test) =>
                  test.status ===
                    "COMPLETED" &&
                  Boolean(test.result)
              ).length;


            const awaitingCount =
              groupTests.filter(
                (test) =>
                  test.status !==
                    "COMPLETED" ||
                  !test.result
              ).length;


            return {
              sampleId,
              farmName:
                latestTest.farm_name ||
                "Unknown farm",
              tests: sortedTests,
              latestTest,
              readyCount,
              awaitingCount,
            };
          }
        );


      // ---------------------------------------------------------------
      // SORT GROUPS
      // ---------------------------------------------------------------

      result.sort(
        (a, b) => {
          const difference =
            getTestDate(
              b.latestTest
            ) -
            getTestDate(
              a.latestTest
            );

          return sortOrder ===
            "NEWEST"
            ? difference
            : -difference;
        }
      );


      return result;
    }, [
      tests,
      search,
      statusFilter,
      farmFilter,
      sortOrder,
    ]);


  // ==========================================================================
  // FORMAT DATE
  // ==========================================================================

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

    return parsedDate.toLocaleDateString(
      "en-NG",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }


  // ==========================================================================
  // FORMAT TEST METHOD
  // ==========================================================================

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


  // ==========================================================================
  // STATUS
  // ==========================================================================

  function getStatusStyle(
    test: SoilTest
  ) {
    if (
      test.status ===
        "COMPLETED" &&
      test.result
    ) {
      return {
        label: "Report Ready",
        className:
          "border-green-200 bg-green-100 text-green-800",
        icon: "✓",
      };
    }


    if (
      test.status ===
      "PROCESSING"
    ) {
      return {
        label: "Processing",
        className:
          "border-blue-200 bg-blue-100 text-blue-800",
        icon: "•",
      };
    }


    if (
      test.status ===
      "FAILED"
    ) {
      return {
        label: "Test Failed",
        className:
          "border-red-200 bg-red-100 text-red-800",
        icon: "!",
      };
    }


    return {
      label: "Awaiting Results",
      className:
        "border-yellow-200 bg-yellow-100 text-yellow-800",
      icon: "○",
    };
  }


  // ==========================================================================
  // TOGGLE SAMPLE HISTORY
  // ==========================================================================

  function toggleSample(
    sampleId: string
  ) {
    setExpandedSamples(
      (current) => ({
        ...current,
        [sampleId]:
          !current[sampleId],
      })
    );
  }


  // ==========================================================================
  // PDF DOWNLOAD
  // ==========================================================================

  async function downloadPdf(
    test: SoilTest
  ) {
    if (!test.id) {
      return;
    }

    try {
      setDownloadingId(
        test.id
      );

      const blob =
        await downloadSoilReportPdf(
          test.id
        );


      const url =
        window.URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href = url;


      link.download =
        `SoilGenie-${test.sample_id || test.id}-Soil-Report.pdf`;


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      window.URL.revokeObjectURL(
        url
      );
    } catch (error) {
      console.error(
        "Unable to download PDF:",
        error
      );

      alert(
        "Unable to download the PDF report. Please try again."
      );
    } finally {
      setDownloadingId(null);
    }
  }


  // ==========================================================================
  // NAVIGATION
  // ==========================================================================

  function openFarmerReport(
    test: SoilTest
  ) {
    navigate(
      `/agent/reports/soil/${test.id}`
    );
  }


  function openTechnicalAnalysis(
    test: SoilTest
  ) {
    navigate(
      `/agent/soil/tests/${test.id}`
    );
  }


  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <DashboardLayout>

        <div className="mx-auto max-w-7xl">

          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-700" />

            <p className="mt-4 text-sm text-slate-500">
              Loading SoilGenie reports...
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }


  // ==========================================================================
  // ERROR
  // ==========================================================================

  if (error) {
    return (
      <DashboardLayout>

        <div className="mx-auto max-w-7xl">

          <button
            type="button"
            onClick={() =>
              navigate("/agent")
            }
            className="mb-6 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Dashboard
          </button>


          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">

            <h1 className="text-xl font-bold text-red-900">
              Unable to load reports
            </h1>


            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>


            <button
              type="button"
              onClick={() =>
                loadReports()
              }
              className="mt-5 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try Again
            </button>

          </div>

        </div>

      </DashboardLayout>
    );
  }


  // ==========================================================================
  // PAGE
  // ==========================================================================

  return (
    <DashboardLayout>

      <div className="mx-auto max-w-7xl space-y-8">


        {/* ================================================================
            HEADER
        ================================================================ */}

        <div>

          <button
            type="button"
            onClick={() =>
              navigate("/agent")
            }
            className="mb-5 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to Dashboard
          </button>


          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                Soil Intelligence
              </p>


              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Report Centre
              </h1>


              <p className="mt-2 max-w-2xl text-slate-500">
                Manage soil assessments, review report history,
                download farmer reports and access technical analysis.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                loadReports(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <span
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              >
                ↻
              </span>


              {refreshing
                ? "Refreshing..."
                : "Refresh Reports"}

            </button>

          </div>

        </div>


        {/* ================================================================
            STATISTICS
        ================================================================ */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <ReportStatCard
            title="Soil Samples"
            value={
              uniqueSampleCount
            }
            description="Unique registered samples"
            icon="🌱"
          />


          <ReportStatCard
            title="Total Tests"
            value={
              totalTests
            }
            description="All registered soil tests"
            icon="🧪"
          />


          <ReportStatCard
            title="Reports Ready"
            value={
              reportsReady
            }
            description="Completed tests with results"
            icon="✓"
            highlight
          />


          <ReportStatCard
            title="Awaiting Results"
            value={
              awaitingResults
            }
            description="Tests requiring completion"
            icon="⌛"
          />

        </div>


        {/* ================================================================
            REPORT CENTRE
        ================================================================ */}

        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">


          {/* ============================================================
              FILTER HEADER
          ============================================================ */}

          <div className="border-b p-6 sm:p-8">

            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">


              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Soil Assessment Registry
                </h2>


                <p className="mt-1 text-sm text-slate-500">
                  Tests are grouped by soil sample so you can see
                  the latest assessment and its complete test history.
                </p>

              </div>


              <div className="flex w-full flex-col gap-3 lg:flex-row xl:w-auto">


                {/* SEARCH */}

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ⌕
                  </span>


                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search sample, farm or test..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 lg:w-80"
                  />

                </div>


                {/* STATUS */}

                <select
                  value={
                    statusFilter
                  }
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as StatusFilter
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >

                  <option value="ALL">
                    All Status
                  </option>

                  <option value="READY">
                    Reports Ready
                  </option>

                  <option value="AWAITING">
                    Awaiting Results
                  </option>

                  <option value="PROCESSING">
                    Processing
                  </option>

                  <option value="FAILED">
                    Failed Tests
                  </option>

                </select>


                {/* FARM */}

                <select
                  value={
                    farmFilter
                  }
                  onChange={(event) =>
                    setFarmFilter(
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >

                  <option value="ALL">
                    All Farms
                  </option>

                  {farmOptions.map(
                    (farm) => (
                      <option
                        key={farm}
                        value={farm}
                      >
                        {farm}
                      </option>
                    )
                  )}

                </select>


                {/* SORT */}

                <select
                  value={
                    sortOrder
                  }
                  onChange={(event) =>
                    setSortOrder(
                      event.target.value as SortOrder
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >

                  <option value="NEWEST">
                    Newest First
                  </option>

                  <option value="OLDEST">
                    Oldest First
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* ============================================================
              EMPTY STATE
          ============================================================ */}

          {sampleGroups.length === 0 ? (

            <div className="p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
                📄
              </div>


              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No reports found
              </h3>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

                {search ||
                statusFilter !== "ALL" ||
                farmFilter !== "ALL"
                  ? "No soil samples match the current search or filters."
                  : "Soil reports will appear here after soil tests are registered."}

              </p>


              {!search &&
                statusFilter ===
                  "ALL" &&
                farmFilter ===
                  "ALL" && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/agent/soil/samples"
                      )
                    }
                    className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
                  >
                    View Soil Samples
                  </button>
                )}

            </div>

          ) : (

            <div className="divide-y divide-slate-100">


              {/* ==========================================================
                  SAMPLE GROUPS
              ========================================================== */}

              {sampleGroups.map(
                (group) => {

                  const expanded =
                    Boolean(
                      expandedSamples[
                        group.sampleId
                      ]
                    );

                  const latestStatus =
                    getStatusStyle(
                      group.latestTest
                    );

                  const latestReady =
                    group.latestTest
                      .status ===
                      "COMPLETED" &&
                    Boolean(
                      group.latestTest
                        .result
                    );

                  const latestDownloading =
                    downloadingId ===
                    group.latestTest.id;


                  return (
                    <div
                      key={
                        group.sampleId
                      }
                      className="bg-white"
                    >


                      {/* ==================================================
                          SAMPLE HEADER
                      ================================================== */}

                      <div className="p-6 sm:p-8">

                        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">


                          {/* SAMPLE ID / FARM */}

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl">
                              🌱
                            </div>


                            <div>

                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Soil Sample
                              </p>


                              <h3 className="mt-1 break-all text-lg font-bold text-green-700">
                                {
                                  group.sampleId
                                }
                              </h3>


                              <p className="mt-1 font-semibold text-slate-900">
                                {
                                  group.farmName
                                }
                              </p>


                              <div className="mt-3 flex flex-wrap gap-2">

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  {
                                    group.tests
                                      .length
                                  }{" "}
                                  {group.tests
                                    .length ===
                                  1
                                    ? "test"
                                    : "tests"}
                                </span>


                                {group.readyCount >
                                  0 && (
                                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                                    {
                                      group.readyCount
                                    }{" "}
                                    ready
                                  </span>
                                )}


                                {group.awaitingCount >
                                  0 && (
                                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                                    {
                                      group.awaitingCount
                                    }{" "}
                                    awaiting
                                  </span>
                                )}

                              </div>

                            </div>

                          </div>


                          {/* LATEST STATUS */}

                          <div className="flex flex-col items-start gap-3 xl:items-end">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Latest Assessment
                            </p>


                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${latestStatus.className}`}
                            >

                              <span>
                                {
                                  latestStatus.icon
                                }
                              </span>

                              {
                                latestStatus.label
                              }

                            </span>


                            <p className="text-sm text-slate-500">
                              {
                                formatDate(
                                  group
                                    .latestTest
                                    .tested_at ||
                                    group
                                      .latestTest
                                      .created_at
                                )
                              }
                            </p>

                          </div>

                        </div>


                        {/* ==================================================
                            LATEST TEST CARD
                        ================================================== */}

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">

                          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">


                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Latest Test
                                </span>


                                <span className="text-xs text-slate-400">
                                  •
                                </span>


                                <span className="text-xs font-medium text-slate-500">
                                  {
                                    formatTestMethod(
                                      group
                                        .latestTest
                                        .test_method
                                    )
                                  }
                                </span>

                              </div>


                              <p className="mt-2 break-all font-mono text-xs text-slate-500">
                                {
                                  group
                                    .latestTest
                                    .test_id
                                }
                              </p>


                              <p className="mt-2 text-sm text-slate-600">
                                Tested{" "}
                                <span className="font-semibold">
                                  {
                                    formatDate(
                                      group
                                        .latestTest
                                        .tested_at ||
                                        group
                                          .latestTest
                                          .created_at
                                    )
                                  }
                                </span>
                              </p>

                            </div>


                            {/* ACTIONS */}

                            <div className="flex flex-col gap-2 sm:flex-row">

                              {latestReady && (
                                <>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openFarmerReport(
                                        group.latestTest
                                      )
                                    }
                                    className="rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                                  >
                                    View Report
                                  </button>


                                  <button
                                    type="button"
                                    disabled={
                                      latestDownloading
                                    }
                                    onClick={() =>
                                      downloadPdf(
                                        group.latestTest
                                      )
                                    }
                                    className="rounded-xl border border-green-300 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {latestDownloading
                                      ? "Downloading..."
                                      : "Download PDF"}
                                  </button>

                                </>
                              )}


                              <button
                                type="button"
                                onClick={() =>
                                  openTechnicalAnalysis(
                                    group.latestTest
                                  )
                                }
                                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                Technical Analysis
                              </button>

                            </div>

                          </div>

                        </div>


                        {/* ==================================================
                            HISTORY TOGGLE
                        ================================================== */}

                        {group.tests
                          .length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              toggleSample(
                                group.sampleId
                              )
                            }
                            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
                          >

                            <span
                              className={`transition-transform ${
                                expanded
                                  ? "rotate-180"
                                  : ""
                              }`}
                            >
                              ▼
                            </span>

                            {expanded
                              ? "Hide Test History"
                              : `View Test History (${group.tests.length - 1} previous)`}

                          </button>
                        )}


                        {/* ==================================================
                            TEST HISTORY
                        ================================================== */}

                        {expanded &&
                          group.tests
                            .length >
                            1 && (

                          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">

                            <div className="border-b bg-slate-50 px-5 py-4">

                              <h4 className="text-sm font-bold text-slate-800">
                                Test History
                              </h4>


                              <p className="mt-1 text-xs text-slate-500">
                                Previous and current tests associated
                                with this soil sample.
                              </p>

                            </div>


                            <div className="divide-y divide-slate-100">

                              {group.tests
                                .map(
                                  (
                                    test,
                                    index
                                  ) => {

                                    const status =
                                      getStatusStyle(
                                        test
                                      );

                                    const ready =
                                      test.status ===
                                        "COMPLETED" &&
                                      Boolean(
                                        test.result
                                      );

                                    const downloading =
                                      downloadingId ===
                                      test.id;


                                    return (
                                      <div
                                        key={
                                          test.id
                                        }
                                        className={`p-5 ${
                                          index ===
                                          0
                                            ? "bg-green-50/40"
                                            : "bg-white"
                                        }`}
                                      >

                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">


                                          <div className="flex items-start gap-4">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-500 shadow-sm">
                                              {index +
                                                1}
                                            </div>


                                            <div>

                                              <div className="flex flex-wrap items-center gap-2">

                                                {index ===
                                                  0 && (
                                                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-800">
                                                    Latest
                                                  </span>
                                                )}


                                                <span
                                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                                                >
                                                  {
                                                    status.icon
                                                  }{" "}
                                                  {
                                                    status.label
                                                  }
                                                </span>

                                              </div>


                                              <p className="mt-2 break-all font-mono text-xs text-slate-500">
                                                {
                                                  test.test_id
                                                }
                                              </p>


                                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

                                                <span>
                                                  {
                                                    formatDate(
                                                      test.tested_at ||
                                                        test.created_at
                                                    )
                                                  }
                                                </span>


                                                <span>
                                                  {
                                                    formatTestMethod(
                                                      test.test_method
                                                    )
                                                  }
                                                </span>

                                              </div>

                                            </div>

                                          </div>


                                          {/* HISTORY ACTIONS */}

                                          <div className="flex flex-col gap-2 sm:flex-row">

                                            {ready && (
                                              <>

                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    openFarmerReport(
                                                      test
                                                    )
                                                  }
                                                  className="rounded-lg bg-green-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-green-800"
                                                >
                                                  View Report
                                                </button>


                                                <button
                                                  type="button"
                                                  disabled={
                                                    downloading
                                                  }
                                                  onClick={() =>
                                                    downloadPdf(
                                                      test
                                                    )
                                                  }
                                                  className="rounded-lg border border-green-300 bg-white px-4 py-2.5 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                  {downloading
                                                    ? "Downloading..."
                                                    : "PDF"}
                                                </button>

                                              </>
                                            )}


                                            <button
                                              type="button"
                                              onClick={() =>
                                                openTechnicalAnalysis(
                                                  test
                                                )
                                              }
                                              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                              Technical
                                            </button>

                                          </div>

                                        </div>

                                      </div>
                                    );
                                  }
                                )}

                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}


          {/* ================================================================
              FOOTER
          ================================================================ */}

          {sampleGroups.length >
            0 && (

            <div className="border-t bg-slate-50 px-6 py-4 sm:px-8">

              <div className="flex flex-col justify-between gap-2 text-sm text-slate-500 sm:flex-row sm:items-center">

                <p>

                  Showing{" "}

                  <span className="font-semibold text-slate-700">
                    {
                      sampleGroups.length
                    }
                  </span>

                  {" "}samples containing{" "}

                  <span className="font-semibold text-slate-700">
                    {
                      sampleGroups.reduce(
                        (
                          total,
                          group
                        ) =>
                          total +
                          group.tests
                            .length,
                        0
                      )
                    }
                  </span>

                  {" "}tests

                </p>


                <p className="text-xs text-slate-400">
                  Tests are grouped by sample; no records are deleted or merged.
                </p>

              </div>

            </div>
          )}

        </section>


        {/* ================================================================
            INFORMATION
        ================================================================ */}

        <section className="rounded-2xl border border-green-200 bg-green-50 p-6 sm:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
              🌱
            </div>


            <div>

              <h2 className="font-bold text-green-950">
                About SoilGenie Reports
              </h2>


              <p className="mt-2 max-w-4xl text-sm leading-6 text-green-800">
                A farmer report becomes available after a soil test
                has been completed and verified measurements have been
                recorded. SoilGenie translates the technical soil
                analysis and crop screening into practical guidance
                for farmers and field agents.
              </p>


              <div className="mt-5 grid gap-3 sm:grid-cols-3">


                <div className="rounded-xl bg-white/70 p-4">

                  <p className="text-sm font-bold text-green-900">
                    View
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-800">
                    Open the complete farmer-friendly soil report.
                  </p>

                </div>


                <div className="rounded-xl bg-white/70 p-4">

                  <p className="text-sm font-bold text-green-900">
                    Download
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-800">
                    Save a PDF copy for sharing or farm records.
                  </p>

                </div>


                <div className="rounded-xl bg-white/70 p-4">

                  <p className="text-sm font-bold text-green-900">
                    Technical
                  </p>

                  <p className="mt-1 text-xs leading-5 text-green-800">
                    Review the underlying measurements, analysis
                    and crop suitability information.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </DashboardLayout>
  );
}


// ============================================================================
// STAT CARD
// ============================================================================

function ReportStatCard({
  title,
  value,
  description,
  icon,
  highlight = false,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        highlight
          ? "border-green-200 bg-green-50"
          : "bg-white"
      }`}
    >

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>


          <p
            className={`mt-2 text-3xl font-bold ${
              highlight
                ? "text-green-800"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>


          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>

        </div>


        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${
            highlight
              ? "bg-white"
              : "bg-slate-50"
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}