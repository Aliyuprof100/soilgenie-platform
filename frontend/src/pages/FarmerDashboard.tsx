import {



  useCallback,



  useEffect,



  useMemo,



  useState,



  type ReactNode,



} from "react";







import { useNavigate } from "react-router-dom";







import api from "../api/api";







import {



  AlertTriangle,



  ArrowRight,



  CheckCircle2,



  Clock3,



  Download,



  FileText,



  Leaf,



  Loader2,



  MapPin,



  RefreshCw,



  Sprout,



  TestTube2,



  Tractor,



  UserRound,



} from "lucide-react";







import {



  type Farmer,



  getCurrentFarmer,



} from "../services/farmers";







import {



  type Farm,



  getFarms,



} from "../services/farms";







import {



  type SoilSample,



  type SoilTest,



  type SoilTestResult,



  type SoilAnalysis,



  type SoilRecommendation,



  getSoilSamples,



  getSoilTests,



  getSoilAnalysisByTest,



  getSoilRecommendation,



} from "../services/soil";











/* ==========================================================================



   TYPES



   ========================================================================== */







interface DashboardSoilRecord {



  farm: Farm;



  sample: SoilSample;



  test: SoilTest;



  result: SoilTestResult | null;



  analysis: SoilAnalysis | null;



  recommendation: SoilRecommendation | null;



}











/* ==========================================================================



   HELPERS



   ========================================================================== */







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











function formatNumber(



  value?: number | string | null,



  decimals = 1



) {



  if (



    value === null ||



    value === undefined ||



    value === ""



  ) {



    return "—";



  }







  const numericValue = Number(value);







  if (Number.isNaN(numericValue)) {



    return String(value);



  }







  return numericValue.toFixed(decimals);



}











function formatLabel(value?: string | null) {



  if (!value) {



    return "Not specified";



  }







  return value



    .replace(/\_/g, " ")



    .toLowerCase()



    .replace(/\b\w/g, (letter) =>



      letter.toUpperCase()



    );



}











function formatState(value?: string | null) {



  if (!value) {



    return "";



  }







  const normalized =



    value.trim().toUpperCase();







  const states: Record<string, string> = {



    "NG-YO": "Yobe State",



    YO: "Yobe State",



    YOBE: "Yobe State",



  };







  return states[normalized] ?? value;



}











function getFarmLocation(farm: Farm) {



  const parts = [



    farm.village,



    farm.ward,



    farm.lga,



    formatState(farm.state),



  ].filter(Boolean);







  return parts.length > 0



    ? parts.join(", ")



    : "Location not specified";



}











function getFarmerLocation(



  farmer: Farmer | null



) {



  if (!farmer) {



    return "—";



  }







  const parts = [



    farmer.lga,



    formatState(farmer.state),



  ].filter(Boolean);







  return parts.join(", ");



}











function getAnalysisBadge(



  status?: string | null



) {



  switch (status?.toUpperCase()) {



    case "GOOD":



      return "border-emerald-200 bg-emerald-100 text-emerald-800";







    case "MODERATE":



      return "border-amber-200 bg-amber-100 text-amber-800";







    case "POOR":



      return "border-orange-200 bg-orange-100 text-orange-800";







    case "CRITICAL":



      return "border-red-200 bg-red-100 text-red-800";







    default:



      return "border-slate-200 bg-slate-100 text-slate-700";



  }



}











function getTestStatusClass(



  status?: string | null



) {



  switch (status?.toUpperCase()) {



    case "COMPLETED":



      return "bg-emerald-100 text-emerald-700";







    case "PROCESSING":



      return "bg-blue-100 text-blue-700";







    case "PENDING":



      return "bg-amber-100 text-amber-700";







    case "FAILED":



      return "bg-red-100 text-red-700";







    default:



      return "bg-slate-100 text-slate-600";



  }



}











/* ==========================================================================



   PAGE



   ========================================================================== */







export default function FarmerDashboard() {



  const navigate = useNavigate();







  const [farmer, setFarmer] =



    useState<Farmer | null>(null);







  const [farms, setFarms] =



    useState<Farm[]>([]);







  const [soilRecords, setSoilRecords] =



    useState<DashboardSoilRecord[]>([]);







  const [loading, setLoading] =



    useState(true);







  const [refreshing, setRefreshing] =



    useState(false);







  const [downloadingPdfId, setDownloadingPdfId] =



    useState<number | null>(null);







  const [pdfError, setPdfError] =



    useState<string | null>(null);







  const [error, setError] =



    useState<string | null>(null);











  /* ==========================================================================



     LOAD DASHBOARD



     ========================================================================== */







  const loadDashboard = useCallback(



    async (isRefresh = false) => {



      try {



        if (isRefresh) {



          setRefreshing(true);



        } else {



          setLoading(true);



        }







        setError(null);











        /* ----------------------------------------------------------------------



           FARMER + FARMS



           ---------------------------------------------------------------------- */







        const [



          farmerData,



          farmData,



        ] = await Promise.all([



          getCurrentFarmer(),



          getFarms(),



        ]);







        setFarmer(farmerData);



        setFarms(farmData);











        /* ----------------------------------------------------------------------



           SOIL RECORDS



           ---------------------------------------------------------------------- */







        const records:



          DashboardSoilRecord[] = [];











        for (const farm of farmData) {



          let samples: SoilSample[] = [];







          try {



            samples =



              await getSoilSamples(



                farm.id



              );



          } catch (sampleError) {



            console.error(



              `Unable to load samples for farm ${farm.id}:`,



              sampleError



            );







            continue;



          }











          for (const sample of samples) {



            let tests: SoilTest[] = [];







            try {



              tests =



                await getSoilTests(



                  sample.id



                );



            } catch (testError) {



              console.error(



                `Unable to load tests for sample ${sample.id}:`,



                testError



              );







              continue;



            }











            for (const test of tests) {



              const result =



                test.result ?? null;







              let analysis:



                SoilAnalysis | null = null;







              let recommendation:



                SoilRecommendation | null =



                null;











              /* --------------------------------------------------------------



                 ANALYSIS



                 -------------------------------------------------------------- */







              if (



                test.status ===



                "COMPLETED"



              ) {



                try {



                  analysis =



                    await getSoilAnalysisByTest(



                      test.id



                    );



                } catch (analysisError) {



                  console.error(



                    `Unable to load analysis for test ${test.id}:`,



                    analysisError



                  );



                }



              }











              /* --------------------------------------------------------------



                 RECOMMENDATION



                 -------------------------------------------------------------- */







              if (result) {



                try {



                  recommendation =



                    await getSoilRecommendation(



                      result.id



                    );



                } catch (



                  recommendationError



                ) {



                  console.error(



                    `Unable to load recommendation for result ${result.id}:`,



                    recommendationError



                  );



                }



              }











              records.push({



                farm,



                sample,



                test,



                result,



                analysis,



                recommendation,



              });



            }



          }



        }











        /* ----------------------------------------------------------------------



           NEWEST FIRST



           ---------------------------------------------------------------------- */







        records.sort(



          (a, b) => {



            const dateA =



              new Date(



                a.test.tested_at ??



                  a.test.created_at



              ).getTime();







            const dateB =



              new Date(



                b.test.tested_at ??



                  b.test.created_at



              ).getTime();







            return dateB - dateA;



          }



        );











        setSoilRecords(records);







      } catch (dashboardError: unknown) {



        console.error(



          "Unable to load farmer dashboard:",



          dashboardError



        );







        const message =



          dashboardError instanceof Error



            ? dashboardError.message



            : "Unable to load your SoilGenie dashboard.";







        setError(message);







      } finally {



        setLoading(false);



        setRefreshing(false);



      }



    },



    []



  );











  const downloadSoilReportPdf = useCallback(



    async (record: DashboardSoilRecord) => {



      if (!record.test.id) {

        return;

      }







      try {

        setPdfError(null);

        setDownloadingPdfId(record.test.id);







        const response = await api.get(

          `/reports/soil/${record.test.id}/pdf/`,

          {

            responseType: "blob",

          }

        );







        const contentType =
          typeof response.headers["content-type"] === "string"
            ? response.headers["content-type"]
            : "application/pdf";

        const blob = new Blob([response.data], {
          type: contentType,
        });







        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");







        link.href = url;

        link.download = `SoilGenie-${

          record.farm.farm_id || record.farm.farm_name

        }-${record.sample.sample_id}.pdf`;







        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

      } catch (pdfDownloadError) {

        console.error(

          "Unable to download SoilGenie PDF report:",

          pdfDownloadError

        );







        setPdfError(

          "Unable to download the PDF report. Please try again."

        );

      } finally {

        setDownloadingPdfId(null);

      }

    },



    []

  );







  useEffect(() => {



    void loadDashboard();



  }, [loadDashboard]);











  /* ==========================================================================



     DERIVED DATA



     ========================================================================== */







  const completedRecords =



    useMemo(



      () =>



        soilRecords.filter(



          (record) =>



            record.test.status ===



              "COMPLETED" &&



            record.result !== null



        ),



      [soilRecords]



    );











  /*



   \* This is deliberately NOT simply soilRecords[0].



   \*



   \* The main farmer assessment should show the newest



   \* completed soil assessment that has actual measurements.



   */







  const latestCompletedAssessment =



    useMemo(



      () =>



        completedRecords.length > 0



          ? completedRecords[0]



          : null,



      [completedRecords]



    );











  const pendingRecords =



    useMemo(



      () =>



        soilRecords.filter(



          (record) =>



            record.test.status ===



              "PENDING" ||



            record.test.status ===



              "PROCESSING"



        ),



      [soilRecords]



    );











  /*



   \* Determine how many unfinished tests are newer than



   \* the latest completed assessment.



   */







  const newerPendingRecords =



    useMemo(() => {



      if (!latestCompletedAssessment) {



        return pendingRecords;



      }







      const completedDate =



        new Date(



          latestCompletedAssessment



            .test



            .tested_at ??



            latestCompletedAssessment



              .test



              .created_at



        ).getTime();







      return pendingRecords.filter(



        (record) => {



          const pendingDate =



            new Date(



              record.test.tested_at ??



                record.test.created_at



            ).getTime();







          return (



            pendingDate >



            completedDate



          );



        }



      );



    }, [



      latestCompletedAssessment,



      pendingRecords,



    ]);











  const totalFarmArea =



    useMemo(



      () =>



        farms.reduce(



          (total, farm) =>



            total +



            (Number(



              farm.farm_size



            ) || 0),



          0



        ),



      [farms]



    );











  const latestValidation =



    latestCompletedAssessment



      ?.recommendation



      ?.measurement_validation ??



    null;











  const recommendationBlocked =



    latestValidation



      ?.recommendation_blocked ===



    true;











  const bestCrop =



    latestCompletedAssessment



      ?.recommendation



      ?.best_crop ??



    null;











  const provisionalBestCrop =



    latestCompletedAssessment



      ?.recommendation



      ?.provisional_best_crop ??



    null;











  const nextActions =



    latestCompletedAssessment



      ?.recommendation



      ?.soil_conditions



      ?.actions ??



    [];











  /* ==========================================================================



     LOADING



     ========================================================================== */







  if (loading) {



    return (



      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">







        <div className="text-center">







          <Loader2 className="mx-auto h-10 w-10 animate-spin text-green-700" />







          <h2 className="mt-4 text-xl font-bold text-slate-900">



            Loading your SoilGenie dashboard



          </h2>







          <p className="mt-2 text-sm text-slate-500">



            Preparing your farm and soil information.



          </p>







        </div>







      </div>



    );



  }











  /* ==========================================================================



     ERROR



     ========================================================================== */







  if (error) {



    return (



      <div className="min-h-screen bg-slate-50 px-4 py-12">







        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">







          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">



            <AlertTriangle className="h-6 w-6 text-red-700" />



          </div>







          <h1 className="mt-5 text-2xl font-bold text-slate-900">



            We could not load your dashboard



          </h1>







          <p className="mt-3 text-slate-600">



            {error}



          </p>







          <button



            type="button"



            onClick={() =>



              void loadDashboard()



            }



            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"



          >



            <RefreshCw className="h-4 w-4" />



            Try Again



          </button>







        </div>







      </div>



    );



  }











  /* ==========================================================================



     DASHBOARD



     ========================================================================== */







  return (



    <div className="min-h-screen bg-slate-50">







      {/* ============================================================



          HEADER



      ============================================================ */}







      <header className="border-b border-slate-200 bg-white">







        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">







          <div>







            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">



              <Sprout className="h-4 w-4" />



              SoilGenie Farmer Portal



            </div>







            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">



              Welcome,{" "}



              {farmer?.first_name ||



                "Farmer"}



            </h1>







            <p className="mt-2 text-sm text-slate-600">



              Understand your soil. See your crop



              guidance. Know what to do next.



            </p>







          </div>











          <button



            type="button"



            disabled={refreshing}



            onClick={() =>



              void loadDashboard(true)



            }



            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"



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



              : "Refresh"}



          </button>







        </div>







      </header>











      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">







        {/* ============================================================



            FARMER PROFILE



        ============================================================ */}







        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 text-white shadow-lg">







          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">







            <div>







              <div className="flex items-center gap-4">







                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">



                  <UserRound className="h-7 w-7" />



                </div>







                <div>







                  <p className="text-sm font-medium text-green-100">



                    Farmer Profile



                  </p>







                  <h2 className="text-2xl font-bold">



                    {farmer?.first_name}{" "}



                    {farmer?.last_name}



                  </h2>







                </div>







              </div>











              <p className="mt-6 max-w-2xl text-sm leading-6 text-green-50">



                Your SoilGenie account brings your



                farms, soil tests, soil condition and



                crop decision-support guidance together



                in one place.



              </p>







            </div>











            <div className="grid grid-cols-2 gap-3">







              <ProfileItem



                label="Farmer ID"



                value={



                  farmer?.farmer_id ||



                  "—"



                }



              />







              <ProfileItem



                label="Status"



                value={formatLabel(



                  farmer?.status



                )}



              />







              <ProfileItem



                label="Location"



                value={getFarmerLocation(



                  farmer



                )}



              />







              <ProfileItem



                label="Farming Type"



                value={formatLabel(



                  farmer?.farming_type



                )}



              />







            </div>







          </div>







        </section>











        {/* ============================================================



            STATISTICS



        ============================================================ */}







        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">







          <StatCard



            title="My Farms"



            value={String(



              farms.length



            )}



            subtitle="Registered farms"



            icon={



              <Tractor className="h-5 w-5 text-green-700" />



            }



            iconClass="bg-green-100"



          />







          <StatCard



            title="Total Farm Area"



            value={`${formatNumber(



              totalFarmArea,



              2



            )} ha`}



            subtitle="Across registered farms"



            icon={



              <MapPin className="h-5 w-5 text-blue-700" />



            }



            iconClass="bg-blue-100"



          />







          <StatCard



            title="Soil Tests"



            value={String(



              soilRecords.length



            )}



            subtitle="Recorded tests"



            icon={



              <TestTube2 className="h-5 w-5 text-violet-700" />



            }



            iconClass="bg-violet-100"



          />







          <StatCard



            title="Reports Ready"



            value={String(



              completedRecords.length



            )}



            subtitle="Completed assessments"



            icon={



              <FileText className="h-5 w-5 text-amber-700" />



            }



            iconClass="bg-amber-100"



          />







        </section>











        {/* ============================================================



            TESTS IN PROGRESS



        ============================================================ */}







        {newerPendingRecords.length >



          0 && (







          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6">







            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">







              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100">



                <Clock3 className="h-5 w-5 text-blue-700" />



              </div>











              <div className="flex-1">







                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">



                  Tests In Progress



                </p>







                <h2 className="mt-1 text-lg font-bold text-slate-900">



                  {newerPendingRecords.length}{" "}



                  newer soil{" "}



                  {newerPendingRecords.length ===



                  1



                    ? "test is"



                    : "tests are"}{" "}



                  awaiting results



                </h2>







                <p className="mt-2 text-sm leading-6 text-slate-600">



                  Your latest completed assessment



                  remains available below while the



                  newer soil{" "}



                  {newerPendingRecords.length ===



                  1



                    ? "test is"



                    : "tests are"}{" "}



                  being processed.



                </p>











                <div className="mt-4 flex flex-wrap gap-2">







                  {newerPendingRecords.map(



                    (record) => (







                      <span



                        key={record.test.id}



                        className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"



                      >



                        {



                          record.sample



                            .sample_id



                        }{" "}



                        ·{" "}



                        {formatLabel(



                          record.test



                            .status



                        )}



                      </span>







                    )



                  )}







                </div>







              </div>







            </div>







          </section>







        )}











        {pdfError && (



          <section className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">



            <div className="flex items-start gap-3">



              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />



              <div className="flex-1">



                <p className="text-sm font-bold text-red-800">



                  PDF download failed



                </p>



                <p className="mt-1 text-sm text-red-700">



                  {pdfError}



                </p>



              </div>



              <button



                type="button"



                onClick={() => setPdfError(null)}



                className="text-sm font-semibold text-red-700 hover:text-red-900"



              >



                Dismiss



              </button>



            </div>



          </section>



        )}







        {/* ============================================================



            LATEST COMPLETED ASSESSMENT



        ============================================================ */}







        <section>







          <div className="mb-4">







            <h2 className="text-xl font-bold text-slate-900">



              Latest Completed Soil Assessment



            </h2>







            <p className="mt-1 text-sm text-slate-500">



              Your newest completed soil test with



              available measurements.



            </p>







          </div>











          {!latestCompletedAssessment ? (







            <EmptyState



              icon={



                <TestTube2 className="h-7 w-7 text-green-700" />



              }



              title="No completed soil assessment yet"



              description="Your completed soil assessment will appear here once a SoilGenie field agent finishes testing your soil sample."



            />







          ) : (







            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">







              <div className="p-6 sm:p-7">







                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">







                  <div>







                    <div className="flex flex-wrap items-center gap-3">







                      <h3 className="text-xl font-bold text-slate-900">



                        {



                          latestCompletedAssessment



                            .farm



                            .farm_name



                        }



                      </h3>











                      {latestCompletedAssessment



                        .analysis && (







                        <span



                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getAnalysisBadge(



                            latestCompletedAssessment



                              .analysis



                              .overall_status



                          )}`}



                        >



                          {formatLabel(



                            latestCompletedAssessment



                              .analysis



                              .overall_status



                          )}



                        </span>







                      )}







                    </div>











                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">







                      <span>



                        Sample:{" "}



                        <strong className="text-slate-700">



                          {



                            latestCompletedAssessment



                              .sample



                              .sample_id



                          }



                        </strong>



                      </span>







                      <span>



                        Tested:{" "}



                        <strong className="text-slate-700">



                          {formatDate(



                            latestCompletedAssessment



                              .test



                              .tested_at ??



                              latestCompletedAssessment



                                .test



                                .created_at



                          )}



                        </strong>



                      </span>







                      <span>



                        Method:{" "}



                        <strong className="text-slate-700">



                          {formatLabel(



                            latestCompletedAssessment



                              .test



                              .test_method



                          )}



                        </strong>



                      </span>







                    </div>







                  </div>











                  <div className="flex flex-wrap gap-2">



                    <button



                      type="button"



                      onClick={() =>



                        navigate(



                          `/farmer/reports/soil/${latestCompletedAssessment.test.id}`



                        )



                      }



                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"



                    >



                      View Full Report



                      <ArrowRight className="h-4 w-4" />



                    </button>







                    <button



                      type="button"



                      disabled={



                        downloadingPdfId ===



                        latestCompletedAssessment.test.id



                      }



                      onClick={() =>



                        void downloadSoilReportPdf(



                          latestCompletedAssessment



                        )



                      }



                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"



                    >



                      {downloadingPdfId ===



                      latestCompletedAssessment.test.id ? (



                        <Loader2 className="h-4 w-4 animate-spin" />



                      ) : (



                        <Download className="h-4 w-4" />



                      )}



                      {downloadingPdfId ===



                      latestCompletedAssessment.test.id



                        ? "Preparing PDF..."



                        : "Download PDF"}



                    </button>



                  </div>







                </div>











                {latestCompletedAssessment



                  .analysis



                  ?.summary && (







                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">







                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">



                      Soil Condition Summary



                    </p>







                    <p className="mt-2 text-sm leading-7 text-slate-700">



                      {



                        latestCompletedAssessment



                          .analysis



                          .summary



                      }



                    </p>







                  </div>







                )}







              </div>











              <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4 lg:grid-cols-8">







                <Measurement



                  label="pH"



                  value={formatNumber(



                    latestCompletedAssessment



                      .result



                      ?.ph,



                    2



                  )}



                />







                <Measurement



                  label="Nitrogen"



                  value={formatNumber(



                    latestCompletedAssessment



                      .result



                      ?.nitrogen_mg_kg,



                    1



                  )}



                  unit="mg/kg"



                />







                <Measurement



                  label="Phosphorus"



                  value={formatNumber(



                    latestCompletedAssessment



                      .result



                      ?.phosphorus_mg_kg,



                    1



                  )}



                  unit="mg/kg"



                />







                <Measurement



                  label="Potassium"



                  value={formatNumber(



                    latestCompletedAssessment



                      .result



                      ?.potassium_mg_kg,



                    1



                  )}



                  unit="mg/kg"



                />







                <Measurement



                  label="Moisture"



                  value={formatNumber(



                    latestCompletedAssessment



                      .result



                      ?.moisture_percent,



                    1



                  )}



                  unit="%"



                />







                <Measurement



                  label="Organic Matter"



                  value={formatNumber(



                    latestCompletedAssessment



                      .result



                      ?.organic_matter_percent,



                    1



                  )}



                  unit="%"



                />







                <Measurement



                  label="EC"



                  value={formatNumber(



                    latestCompletedAssessment



                      .result



                      ?.electrical_conductivity_ds_m,



                    2



                  )}



                  unit="dS/m"



                />







                <Measurement



                  label="Temperature"



                  value={formatNumber(



                    latestCompletedAssessment



                      .result



                      ?.temperature_celsius,



                    1



                  )}



                  unit="°C"



                />







              </div>







            </div>







          )}







        </section>











        {/* ============================================================



            MEASUREMENT SAFETY GATE



        ============================================================ */}







        {latestCompletedAssessment



          ?.recommendation &&



          recommendationBlocked && (







          <section className="rounded-3xl border border-amber-300 bg-amber-50 p-6 sm:p-8">







            <div className="flex flex-col gap-5 sm:flex-row">







              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100">



                <AlertTriangle className="h-6 w-6 text-amber-700" />



              </div>











              <div className="flex-1">







                <p className="text-sm font-bold uppercase tracking-wide text-amber-700">



                  Measurement Verification Needed



                </p>







                <h2 className="mt-2 text-xl font-bold text-slate-900">



                  SoilGenie has paused the automatic



                  crop recommendation



                </h2>











                {latestValidation?.summary && (







                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">



                    {



                      latestValidation



                        .summary



                    }



                  </p>







                )}











                {latestValidation &&



                  latestValidation



                    .critical_measurements



                    .length > 0 && (







                    <div className="mt-5 grid gap-3 md:grid-cols-2">







                      {latestValidation



                        .critical_measurements



                        .map(



                          (



                            measurement,



                            index



                          ) => (







                            <div



                              key={`${measurement.parameter}-${index}`}



                              className="rounded-2xl border border-amber-200 bg-white/80 p-4"



                            >







                              <p className="text-sm font-bold text-slate-900">



                                {formatLabel(



                                  measurement.parameter



                                )}



                              </p>







                              {measurement.value !==



                                null &&



                                measurement.value !==



                                  undefined && (







                                  <p className="mt-1 text-sm font-semibold text-amber-800">



                                    Recorded value:{" "}



                                    {



                                      measurement.value



                                    }



                                  </p>







                                )}







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







                  )}







              </div>







            </div>







          </section>







        )}











        {/* ============================================================



            CROP GUIDANCE



        ============================================================ */}







        {latestCompletedAssessment



          ?.recommendation && (







          <section>







            <div className="mb-4">







              <h2 className="text-xl font-bold text-slate-900">



                Crop Guidance



              </h2>







              <p className="mt-1 text-sm text-slate-500">



                Decision-support guidance based on



                the completed soil assessment.



              </p>







            </div>











            {recommendationBlocked ? (







              <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">







                <div className="flex flex-col gap-5 sm:flex-row">







                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100">



                    <Sprout className="h-6 w-6 text-amber-700" />



                  </div>











                  <div className="flex-1">







                    <p className="text-sm font-bold uppercase tracking-wide text-amber-700">



                      Provisional Guidance



                    </p>











                    {provisionalBestCrop && (







                      <>



                        <p className="mt-3 text-sm text-slate-600">



                          Strongest provisional soil



                          match



                        </p>







                        <h3 className="mt-1 text-3xl font-bold text-slate-900">



                          {provisionalBestCrop}



                        </h3>







                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">



                          <AlertTriangle className="h-4 w-4" />



                          Not a planting recommendation



                        </div>



                      </>







                    )}











                    <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-700">



                      {



                        latestCompletedAssessment



                          .recommendation



                          .farmer_summary



                      }



                    </p>







                  </div>







                </div>







              </div>







            ) : (







              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">







                <div className="flex flex-col gap-5 sm:flex-row">







                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">



                    <Sprout className="h-6 w-6 text-emerald-700" />



                  </div>











                  <div className="flex-1">







                    <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">



                      Current Crop Guidance



                    </p>











                    {bestCrop ? (







                      <>



                        <p className="mt-3 text-sm text-slate-600">



                          Best safe crop match from



                          the current screening



                        </p>







                        <h3 className="mt-1 text-3xl font-bold text-slate-900">



                          {bestCrop}



                        </h3>



                      </>







                    ) : (







                      <h3 className="mt-3 text-xl font-bold text-slate-900">



                        Review your crop assessment



                      </h3>







                    )}











                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">



                      {



                        latestCompletedAssessment



                          .recommendation



                          .farmer_summary



                      }



                    </p>







                  </div>







                </div>







              </div>







            )}







          </section>







        )}











        {/* ============================================================



            NEXT ACTION



        ============================================================ */}







        {latestCompletedAssessment



          ?.recommendation && (







          <section>







            <div className="mb-4">







              <h2 className="text-xl font-bold text-slate-900">



                What Should I Do Next?



              </h2>







              <p className="mt-1 text-sm text-slate-500">



                Practical actions from your latest



                completed soil assessment.



              </p>







            </div>











            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">







              {nextActions.length >



              0 ? (







                <div className="space-y-3">







                  {nextActions.map(



                    (action, index) => (







                      <div



                        key={`${action}-${index}`}



                        className="flex gap-3 rounded-2xl bg-slate-50 p-4"



                      >







                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">



                          {index + 1}



                        </div>







                        <p className="text-sm leading-6 text-slate-700">



                          {action}



                        </p>







                      </div>







                    )



                  )}







                </div>







              ) : (







                <div className="flex gap-3">







                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />







                  <p className="text-sm leading-6 text-slate-600">



                    No additional action has been



                    recorded for this assessment.



                    Review the full soil report for



                    complete guidance.



                  </p>







                </div>







              )}







            </div>







          </section>







        )}











        {/* ============================================================



            MY FARMS



        ============================================================ */}







        <section>







          <div className="mb-4">







            <h2 className="text-xl font-bold text-slate-900">



              My Farms



            </h2>







            <p className="mt-1 text-sm text-slate-500">



              Farms linked to your SoilGenie profile.



            </p>







          </div>











          {farms.length === 0 ? (







            <EmptyState



              icon={



                <Tractor className="h-7 w-7 text-green-700" />



              }



              title="No farm registered yet"



              description="Contact your SoilGenie field agent to register your farm."



            />







          ) : (







            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">







              {farms.map(



                (farm) => (







                  <article



                    key={farm.id}



                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"



                  >







                    <div className="flex items-start justify-between gap-4">







                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">



                        <Tractor className="h-5 w-5 text-green-700" />



                      </div>







                      <span



                        className={`rounded-full px-3 py-1 text-xs font-bold ${



                          farm.status ===



                          "ACTIVE"



                            ? "bg-emerald-100 text-emerald-700"



                            : "bg-slate-100 text-slate-600"



                        }`}



                      >



                        {formatLabel(



                          farm.status



                        )}



                      </span>







                    </div>











                    <h3 className="mt-5 text-lg font-bold text-slate-900">



                      {farm.farm_name}



                    </h3>







                    <p className="mt-1 text-xs font-medium text-slate-500">



                      {farm.farm_id}



                    </p>











                    <div className="mt-5 space-y-3">







                      <FarmDetail



                        label="Farm Size"



                        value={`${formatNumber(



                          farm.farm_size,



                          2



                        )} ha`}



                      />







                      <FarmDetail



                        label="Farming Type"



                        value={formatLabel(



                          farm.farming_type



                        )}



                      />







                      <FarmDetail



                        label="Irrigation"



                        value={formatLabel(



                          farm.irrigation_type



                        )}



                      />







                      <FarmDetail



                        label="Ownership"



                        value={formatLabel(



                          farm.ownership_type



                        )}



                      />







                    </div>











                    <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4">







                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />







                      <p className="text-sm leading-5 text-slate-500">



                        {getFarmLocation(



                          farm



                        )}



                      </p>







                    </div>







                  </article>







                )



              )}







            </div>







          )}







        </section>











        {/* ============================================================



            RECENT SOIL REPORTS



        ============================================================ */}







        <section>







          <div className="mb-4">







            <h2 className="text-xl font-bold text-slate-900">



              Recent Soil Reports



            </h2>







            <p className="mt-1 text-sm text-slate-500">



              Your latest completed and pending soil



              tests.



            </p>







          </div>











          {soilRecords.length === 0 ? (







            <EmptyState



              icon={



                <FileText className="h-7 w-7 text-green-700" />



              }



              title="No soil reports yet"



              description="Your soil test history will appear here."



            />







          ) : (







            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">







              <div className="overflow-x-auto">







                <table className="min-w-full divide-y divide-slate-200">







                  <thead className="bg-slate-50">







                    <tr>







                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">



                        Sample



                      </th>







                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">



                        Farm



                      </th>







                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">



                        Date



                      </th>







                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">



                        Status



                      </th>







                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">



                        Action



                      </th>







                    </tr>







                  </thead>











                  <tbody className="divide-y divide-slate-100">







                    {soilRecords



                      .slice(0, 5)



                      .map(



                        (record) => (







                          <tr



                            key={



                              record.test.id



                            }



                            className="hover:bg-slate-50"



                          >







                            <td className="whitespace-nowrap px-5 py-4">







                              <p className="text-sm font-semibold text-slate-900">



                                {



                                  record



                                    .sample



                                    .sample_id



                                }



                              </p>







                            </td>











                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">



                              {



                                record



                                  .farm



                                  .farm_name



                              }



                            </td>











                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">



                              {formatDate(



                                record



                                  .test



                                  .tested_at ??



                                  record



                                    .test



                                    .created_at



                              )}



                            </td>











                            <td className="whitespace-nowrap px-5 py-4">







                              <span



                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getTestStatusClass(



                                  record.test



                                    .status



                                )}`}



                              >







                                {record.test



                                  .status ===



                                  "COMPLETED" && (



                                  <CheckCircle2 className="h-3.5 w-3.5" />



                                )}







                                {record.test



                                  .status ===



                                  "COMPLETED"



                                  ? "Report Ready"



                                  : formatLabel(



                                      record



                                        .test



                                        .status



                                    )}







                              </span>







                            </td>











                            <td className="whitespace-nowrap px-5 py-4 text-right">



                              {record.test



                                .status ===



                                "COMPLETED" &&



                              record.result ? (







                                <div className="flex flex-wrap justify-end gap-2">



                                  <button



                                    type="button"



                                    onClick={() =>



                                      navigate(



                                        `/farmer/reports/soil/${record.test.id}`



                                      )



                                    }



                                    className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 transition hover:text-green-800"



                                  >



                                    View Report



                                    <ArrowRight className="h-4 w-4" />



                                  </button>







                                  <button



                                    type="button"



                                    disabled={



                                      downloadingPdfId ===



                                      record.test.id



                                    }



                                    onClick={() =>



                                      void downloadSoilReportPdf(



                                        record



                                      )



                                    }



                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"



                                  >



                                    {downloadingPdfId ===



                                    record.test.id ? (



                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />



                                    ) : (



                                      <Download className="h-3.5 w-3.5" />



                                    )}



                                    PDF



                                  </button>



                                </div>







                              ) : (







                                <span className="text-xs font-medium text-slate-400">



                                  Awaiting result



                                </span>







                              )}







                            </td>







                          </tr>







                        )



                      )}







                  </tbody>







                </table>







              </div>







            </div>







          )}







        </section>











        {/* ============================================================



            DECISION SUPPORT NOTICE



        ============================================================ */}







        <section className="rounded-2xl border border-slate-200 bg-white p-5">







          <div className="flex gap-3">







            <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />







            <div>







              <p className="text-sm font-bold text-slate-800">



                About SoilGenie guidance



              </p>







              <p className="mt-1 text-xs leading-5 text-slate-500">



                SoilGenie provides decision-support



                screening based on available soil



                measurements. Crop suitability should



                also be considered alongside verified



                soil measurements, local field



                conditions and appropriate agronomic



                advice.



              </p>







            </div>







          </div>







        </section>







      </main>







    </div>



  );



}











/* ==========================================================================



   SUPPORTING COMPONENTS



   ========================================================================== */







interface ProfileItemProps {



  label: string;



  value: string;



}











function ProfileItem({



  label,



  value,



}: ProfileItemProps) {



  return (



    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">







      <p className="text-xs font-medium uppercase tracking-wide text-green-100">



        {label}



      </p>







      <p className="mt-2 text-sm font-bold text-white">



        {value}



      </p>







    </div>



  );



}











interface StatCardProps {



  title: string;



  value: string;



  subtitle: string;



  icon: ReactNode;



  iconClass: string;



}











function StatCard({



  title,



  value,



  subtitle,



  icon,



  iconClass,



}: StatCardProps) {



  return (



    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">







      <div className="flex items-start justify-between gap-4">







        <div>







          <p className="text-sm font-medium text-slate-500">



            {title}



          </p>







          <p className="mt-2 text-3xl font-bold text-slate-900">



            {value}



          </p>







          <p className="mt-1 text-xs text-slate-500">



            {subtitle}



          </p>







        </div>











        <div



          className={`rounded-xl p-3 ${iconClass}`}



        >



          {icon}



        </div>







      </div>







    </div>



  );



}











interface MeasurementProps {



  label: string;



  value: string;



  unit?: string;



}











function Measurement({



  label,



  value,



  unit,



}: MeasurementProps) {



  return (



    <div className="bg-white p-4 text-center">







      <p className="text-xs font-medium text-slate-500">



        {label}



      </p>







      <p className="mt-2 text-lg font-bold text-slate-900">



        {value}



      </p>







      {unit && (







        <p className="mt-0.5 text-[11px] text-slate-400">



          {unit}



        </p>







      )}







    </div>



  );



}











interface FarmDetailProps {



  label: string;



  value: string;



}











function FarmDetail({



  label,



  value,



}: FarmDetailProps) {



  return (



    <div className="flex items-center justify-between gap-4 text-sm">







      <span className="text-slate-500">



        {label}



      </span>







      <strong className="text-right text-slate-800">



        {value}



      </strong>







    </div>



  );



}











interface EmptyStateProps {



  icon: ReactNode;



  title: string;



  description: string;



}











function EmptyState({



  icon,



  title,



  description,



}: EmptyStateProps) {



  return (



    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">







      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">



        {icon}



      </div>







      <h3 className="mt-5 text-lg font-bold text-slate-900">



        {title}



      </h3>







      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">



        {description}



      </p>







    </div>



  );



}
