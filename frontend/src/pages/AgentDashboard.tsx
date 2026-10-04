import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  FlaskConical,
  Leaf,
  Loader2,
  MapPinned,
  Plus,
  RefreshCw,
  Sprout,
  TestTube2,
  UserPlus,
  Users,
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  getFarmerStatistics,
} from "../services/farmers";

import {
  getFarms,
  type Farm,
} from "../services/farms";

import {
  getSoilSamples,
  getSoilTests,
  type SoilSample,
  type SoilTest,
} from "../services/soil";


interface FarmerStatistics {
  my_farmers_count: number;
  total_farmers_count: number;
}


interface DashboardData {
  farmerStatistics: FarmerStatistics;
  farms: Farm[];
  samples: SoilSample[];
  tests: SoilTest[];
}


const initialDashboardData: DashboardData = {
  farmerStatistics: {
    my_farmers_count: 0,
    total_farmers_count: 0,
  },
  farms: [],
  samples: [],
  tests: [],
};


function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


function formatLabel(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


function getTestStatusClasses(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-50 text-green-700 ring-green-600/20";

    case "PROCESSING":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";

    case "FAILED":
      return "bg-red-50 text-red-700 ring-red-600/20";

    case "PENDING":
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }
}


function getSampleStatusClasses(status: string) {
  switch (status) {
    case "TESTED":
      return "bg-green-50 text-green-700 ring-green-600/20";

    case "TESTING":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";

    case "REJECTED":
      return "bg-red-50 text-red-700 ring-red-600/20";

    case "RECEIVED":
      return "bg-purple-50 text-purple-700 ring-purple-600/20";

    case "COLLECTED":
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }
}


export default function AgentDashboard() {
  const navigate = useNavigate();

  const [data, setData] =
    useState<DashboardData>(
      initialDashboardData
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        /*
         * These endpoints are already role-aware on
         * the backend.
         *
         * For an AGENT:
         *
         * farmers -> farmers registered by agent
         * farms   -> farms registered by agent
         * samples -> samples from agent's farms
         * tests   -> tests from agent's farms
         */

        const [
          farmerStatistics,
          farms,
          samples,
          tests,
        ] = await Promise.all([
          getFarmerStatistics(),
          getFarms(),
          getSoilSamples(),
          getSoilTests(),
        ]);

        setData({
          farmerStatistics,
          farms,
          samples,
          tests,
        });
      } catch (err) {
        console.error(
          "Failed to load Agent Dashboard:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load the Agent Dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  /*
   * ----------------------------------------------------------
   * DASHBOARD STATISTICS
   * ----------------------------------------------------------
   */

  const completedTests = useMemo(
    () =>
      data.tests.filter(
        (test) =>
          test.status === "COMPLETED" &&
          Boolean(test.result)
      ),
    [data.tests]
  );


  const pendingTests = useMemo(
    () =>
      data.tests.filter(
        (test) =>
          test.status === "PENDING" ||
          test.status === "PROCESSING"
      ),
    [data.tests]
  );


  /*
   * A sample needs attention when it does not yet
   * have any test associated with it.
   */

  const samplesAwaitingTest = useMemo(
    () => {
      const testedSampleIds =
        new Set(
          data.tests.map(
            (test) => test.sample
          )
        );

      return data.samples.filter(
        (sample) =>
          sample.status !== "REJECTED" &&
          !testedSampleIds.has(sample.id)
      );
    },
    [data.samples, data.tests]
  );


  const failedTests = useMemo(
    () =>
      data.tests.filter(
        (test) =>
          test.status === "FAILED"
      ),
    [data.tests]
  );


  const totalFarmArea = useMemo(
    () =>
      data.farms.reduce(
        (total, farm) =>
          total +
          (Number(farm.farm_size) || 0),
        0
      ),
    [data.farms]
  );


  /*
   * ----------------------------------------------------------
   * RECENT ACTIVITY
   * ----------------------------------------------------------
   */

  const recentTests = useMemo(
    () =>
      [...data.tests]
        .sort((a, b) => {
          const dateA = new Date(
            a.tested_at ||
              a.created_at
          ).getTime();

          const dateB = new Date(
            b.tested_at ||
              b.created_at
          ).getTime();

          return dateB - dateA;
        })
        .slice(0, 6),
    [data.tests]
  );


  const recentSamples = useMemo(
    () =>
      [...data.samples]
        .sort(
          (a, b) =>
            new Date(
              b.collection_date ||
                b.created_at
            ).getTime() -
            new Date(
              a.collection_date ||
                a.created_at
            ).getTime()
        )
        .slice(0, 5),
    [data.samples]
  );


  /*
   * ----------------------------------------------------------
   * LOADING STATE
   * ----------------------------------------------------------
   */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-green-700" />

            <p className="mt-4 font-medium text-slate-700">
              Loading your SoilGenie workspace...
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Preparing farmers, farms, samples and
              soil-test activity.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <section className="rounded-3xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-7 text-white shadow-sm md:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-green-100">
                <Leaf className="h-4 w-4" />
                SoilGenie Agent Portal
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Field Operations Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 md:text-base">
                Manage your farmers, farms, soil samples,
                tests and reports from one operational
                workspace.
              </p>
            </div>

            <button
              type="button"
              disabled={refreshing}
              onClick={() =>
                loadDashboard(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-green-800 shadow-sm transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Dashboard"}
            </button>

          </div>
        </section>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <h2 className="font-semibold text-red-900">
                  Some dashboard information could not
                  be loaded
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadDashboard(true)
                  }
                  className="mt-3 text-sm font-semibold text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </section>
        )}


        {/* ======================================================
            PRIMARY STATISTICS
        ====================================================== */}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              My Field Operations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Live operational data linked to your
              SoilGenie agent account.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <DashboardStatCard
              title="My Farmers"
              value={String(
                data.farmerStatistics
                  .my_farmers_count
              )}
              subtitle="Farmers registered by you"
              icon={
                <Users className="h-5 w-5" />
              }
              onClick={() =>
                navigate("/agent/farmers")
              }
            />

            <DashboardStatCard
              title="My Farms"
              value={String(
                data.farms.length
              )}
              subtitle={`${totalFarmArea.toFixed(
                2
              )} ha registered`}
              icon={
                <MapPinned className="h-5 w-5" />
              }
              onClick={() =>
                navigate("/agent/farms")
              }
            />

            <DashboardStatCard
              title="Soil Samples"
              value={String(
                data.samples.length
              )}
              subtitle="Samples collected"
              icon={
                <FlaskConical className="h-5 w-5" />
              }
              onClick={() =>
                navigate(
                  "/agent/soil/samples"
                )
              }
            />

            <DashboardStatCard
              title="Reports Ready"
              value={String(
                completedTests.length
              )}
              subtitle="Completed assessments"
              icon={
                <FileText className="h-5 w-5" />
              }
              onClick={() =>
                navigate("/agent/reports")
              }
            />

          </div>
        </section>


        {/* ======================================================
            WORK REQUIRING ATTENTION
        ====================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Work Requiring Attention
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tasks that may need your next field or
                data-entry action.
              </p>
            </div>

            {pendingTests.length === 0 &&
              samplesAwaitingTest.length === 0 &&
              failedTests.length === 0 && (
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Nothing urgent
                </span>
              )}
          </div>


          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <AttentionCard
              title="Tests Awaiting Results"
              value={pendingTests.length}
              description="Pending or processing soil tests."
              icon={
                <TestTube2 className="h-5 w-5" />
              }
              actionLabel="View Samples"
              onClick={() =>
                navigate(
                  "/agent/soil/samples"
                )
              }
            />

            <AttentionCard
              title="Samples Awaiting Testing"
              value={
                samplesAwaitingTest.length
              }
              description="Collected samples without a soil test."
              icon={
                <ClipboardList className="h-5 w-5" />
              }
              actionLabel="Review Samples"
              onClick={() =>
                navigate(
                  "/agent/soil/samples"
                )
              }
            />

            <AttentionCard
              title="Failed Tests"
              value={failedTests.length}
              description="Tests that may require review or repetition."
              icon={
                <AlertCircle className="h-5 w-5" />
              }
              actionLabel="Review Activity"
              onClick={() =>
                navigate(
                  "/agent/soil/samples"
                )
              }
            />

          </div>
        </section>


        {/* ======================================================
            QUICK ACTIONS
        ====================================================== */}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Start the most common SoilGenie field
              workflows.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

            <QuickAction
              title="Register Farmer"
              description="Add a new farmer to your field portfolio."
              icon={
                <UserPlus className="h-5 w-5" />
              }
              onClick={() =>
                navigate(
                  "/agent/farmers/register"
                )
              }
            />

            <QuickAction
              title="Register Farm"
              description="Create a farm for an existing farmer."
              icon={
                <Sprout className="h-5 w-5" />
              }
              onClick={() =>
                navigate(
                  "/agent/farms/register"
                )
              }
            />

            <QuickAction
              title="Record Soil Sample"
              description="Register a newly collected soil sample."
              icon={
                <FlaskConical className="h-5 w-5" />
              }
              onClick={() =>
                navigate(
                  "/agent/soil/samples/register"
                )
              }
            />

            <QuickAction
              title="Soil Samples"
              description="Review samples and continue testing."
              icon={
                <TestTube2 className="h-5 w-5" />
              }
              onClick={() =>
                navigate(
                  "/agent/soil/samples"
                )
              }
            />

            <QuickAction
              title="Reports"
              description="Open completed soil assessments."
              icon={
                <FileText className="h-5 w-5" />
              }
              onClick={() =>
                navigate(
                  "/agent/reports"
                )
              }
            />

          </div>
        </section>


        {/* ======================================================
            ACTIVITY
        ====================================================== */}

        <div className="grid gap-6 xl:grid-cols-5">

          {/* RECENT TESTS */}

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-3">

            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center justify-between gap-4">

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Recent Soil Test Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your most recently created or
                    completed soil tests.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/agent/soil/samples"
                    )
                  }
                  className="hidden items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 sm:flex"
                >
                  View samples
                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>
            </div>


            {recentTests.length === 0 ? (
              <EmptyState
                icon={
                  <TestTube2 className="h-6 w-6" />
                }
                title="No soil tests yet"
                description="Once you create soil tests, your latest activity will appear here."
              />
            ) : (
              <div className="divide-y divide-slate-100">

                {recentTests.map(
                  (test) => (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() =>
                        navigate(
                          `/agent/soil/tests/${test.id}`
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                    >

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">

                          <p className="truncate font-semibold text-slate-900">
                            {test.sample_id}
                          </p>

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getTestStatusClasses(
                              test.status
                            )}`}
                          >
                            {formatLabel(
                              test.status
                            )}
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {test.farm_name}
                          {" · "}
                          {formatLabel(
                            test.test_method
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(
                            test.tested_at ||
                              test.created_at
                          )}
                        </p>
                      </div>

                      <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" />

                    </button>
                  )
                )}

              </div>
            )}

          </section>


          {/* RECENT SAMPLES */}

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Samples
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest soil samples collected from
                your farms.
              </p>
            </div>


            {recentSamples.length === 0 ? (
              <EmptyState
                icon={
                  <FlaskConical className="h-6 w-6" />
                }
                title="No samples yet"
                description="Record your first soil sample to begin the testing workflow."
              />
            ) : (
              <div className="divide-y divide-slate-100">

                {recentSamples.map(
                  (sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() =>
                        navigate(
                          `/agent/soil/samples/${sample.id}`
                        )
                      }
                      className="block w-full px-6 py-4 text-left transition hover:bg-slate-50"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {sample.sample_id}
                          </p>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {sample.farm_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(
                              sample.collection_date
                            )}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getSampleStatusClasses(
                            sample.status
                          )}`}
                        >
                          {formatLabel(
                            sample.status
                          )}
                        </span>

                      </div>

                    </button>
                  )
                )}

              </div>
            )}

          </section>

        </div>


        {/* ======================================================
            COMPLETED REPORTS
        ====================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Soil Assessment Progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                A quick view of your soil-testing
                workflow.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/agent/reports")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              <FileText className="h-4 w-4" />
              View Reports
            </button>

          </div>


          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <ProgressItem
              label="Samples Collected"
              value={data.samples.length}
            />

            <ProgressItem
              label="Tests Created"
              value={data.tests.length}
            />

            <ProgressItem
              label="Awaiting Results"
              value={pendingTests.length}
            />

            <ProgressItem
              label="Assessments Ready"
              value={completedTests.length}
            />

          </div>

        </section>


        {/* ======================================================
            AGENT NOTE
        ====================================================== */}

        <section className="rounded-2xl border border-green-100 bg-green-50 p-5">

          <div className="flex gap-3">
            <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

            <div>
              <h2 className="font-semibold text-green-900">
                SoilGenie field workflow
              </h2>

              <p className="mt-1 text-sm leading-6 text-green-800">
                Register the farmer and farm, collect
                and register a soil sample, create a
                soil test, enter verified measurements,
                and review the generated soil assessment
                before sharing guidance with the farmer.
              </p>
            </div>
          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}


/* ============================================================
   DASHBOARD STAT CARD
============================================================ */

function DashboardStatCard({
  title,
  value,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-green-50 p-3 text-green-700">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-sm text-slate-500">
        {subtitle}
      </p>
    </button>
  );
}


/* ============================================================
   ATTENTION CARD
============================================================ */

function AttentionCard({
  title,
  value,
  description,
  icon,
  actionLabel,
  onClick,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  actionLabel: string;
  onClick: () => void;
}) {
  const hasItems = value > 0;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        hasItems
          ? "border-amber-200 bg-amber-50/60"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">

        <div
          className={`rounded-xl p-2.5 ${
            hasItems
              ? "bg-amber-100 text-amber-700"
              : "bg-white text-slate-500"
          }`}
        >
          {icon}
        </div>

        <span
          className={`text-3xl font-bold ${
            hasItems
              ? "text-amber-800"
              : "text-slate-700"
          }`}
        >
          {value}
        </span>

      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 min-h-[40px] text-sm leading-5 text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}


/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700 transition group-hover:bg-green-700 group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-5 text-slate-500">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-700">
        Open
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}


/* ============================================================
   PROGRESS ITEM
============================================================ */

function ProgressItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-600">
        {label}
      </p>
    </div>
  );
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}