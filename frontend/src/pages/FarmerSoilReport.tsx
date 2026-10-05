import { useEffect, useMemo, useState } from "react";



import { useNavigate, useParams } from "react-router-dom";



import api from "../api/api";







import DashboardLayout from "../components/dashboard/DashboardLayout";







import {



  getSoilTest,



  getSoilAnalysisByTest,



  getSoilRecommendation,



} from "../services/soil";







import type {



  SoilTest,



  SoilAnalysis,



  SoilRecommendation,



  CropRecommendation,



} from "../services/soil";











/* ==========================================================================



   FARMER SOIL REPORT



   ========================================================================== */







export default function FarmerSoilReport() {



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







  const [error, setError] =



    useState("");







  const [recommendationError, setRecommendationError] =



    useState("");



  const [downloadingPdf, setDownloadingPdf] =

    useState(false);



  const [pdfError, setPdfError] =

    useState("");











  /* ==========================================================================



     LOAD REPORT



     ========================================================================== */







  useEffect(() => {



    async function loadReport() {



      if (!id) {



        setError(



          "No soil report was specified."



        );







        setLoading(false);



        return;



      }







      const numericId =



        Number(id);







      if (



        Number.isNaN(numericId)



      ) {



        setError(



          "The soil report ID is invalid."



        );







        setLoading(false);



        return;



      }







      try {



        setLoading(true);



        setError("");



        setRecommendationError("");







        const testData =



          await getSoilTest(



            numericId



          );







        setTest(testData);







        if (testData.result) {



          const [



            analysisResult,



            recommendationResult,



          ] = await Promise.allSettled([



            getSoilAnalysisByTest(



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



            setAnalysis(



              analysisResult.value



            );



          } else {



            console.error(



              "Unable to load soil analysis:",



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



          } else {



            console.error(



              "Unable to load crop recommendation:",



              recommendationResult.reason



            );







            setRecommendation(null);







            setRecommendationError(



              recommendationResult.reason



                ?.message ||



                "Crop recommendations are not available at the moment."



            );



          }



        } else {



          setAnalysis(null);



          setRecommendation(null);



        }



      } catch (err: any) {



        console.error(



          "Unable to load farmer soil report:",



          err



        );







        setError(



          err?.message ||



            "Unable to load the soil report."



        );



      } finally {



        setLoading(false);



      }



    }







    loadReport();



  }, [id]);











  /* ==========================================================================



     HELPERS



     ========================================================================== */







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



        month: "long",



        day: "numeric",



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











  function normalizeStatus(



    status?: string | null



  ) {



    return (



      status



        ?.trim()



        .toUpperCase() || ""



    );



  }











  function getStatusClass(



    status?: string | null



  ) {



    const normalized =



      normalizeStatus(status);







    switch (normalized) {



      case "GOOD":



      case "OPTIMAL":



      case "ADEQUATE":



      case "VALID":



      case "AVAILABLE":



      case "HIGHLY_SUITABLE":



      case "SUITABLE":



        return {



          badge:



            "bg-green-100 text-green-800 border-green-200",







          card:



            "border-green-200 bg-green-50",







          icon:



            "bg-green-600 text-white",







          text:



            "text-green-900",



        };







      case "MODERATE":



      case "CONDITIONAL":



      case "WARNING":



        return {



          badge:



            "bg-yellow-100 text-yellow-800 border-yellow-200",







          card:



            "border-yellow-200 bg-yellow-50",







          icon:



            "bg-yellow-500 text-white",







          text:



            "text-yellow-900",



        };







      case "POOR":



      case "LOW":



      case "MARGINAL":



        return {



          badge:



            "bg-orange-100 text-orange-800 border-orange-200",







          card:



            "border-orange-200 bg-orange-50",







          icon:



            "bg-orange-500 text-white",







          text:



            "text-orange-900",



        };







      case "CRITICAL":



      case "CRITICAL_CONSTRAINT":



      case "UNSUITABLE":



      case "BLOCKED":



        return {



          badge:



            "bg-red-100 text-red-800 border-red-200",







          card:



            "border-red-200 bg-red-50",







          icon:



            "bg-red-600 text-white",







          text:



            "text-red-900",



        };







      default:



        return {



          badge:



            "bg-slate-100 text-slate-700 border-slate-200",







          card:



            "border-slate-200 bg-slate-50",







          icon:



            "bg-slate-500 text-white",







          text:



            "text-slate-900",



        };



    }



  }











  function getStatusLabel(



    status?: string | null



  ) {



    const normalized =



      normalizeStatus(status);







    switch (normalized) {



      case "GOOD":



        return "Good";







      case "OPTIMAL":



        return "Optimal";







      case "ADEQUATE":



        return "Adequate";







      case "VALID":



        return "Valid";







      case "MODERATE":



        return "Needs Attention";







      case "LOW":



        return "Low";







      case "POOR":



        return "Poor";







      case "CRITICAL":



        return "Critical";







      case "HIGHLY_SUITABLE":



        return "Highly Suitable";







      case "SUITABLE":



        return "Suitable";







      case "CONDITIONAL":



        return "Conditional";







      case "MARGINAL":



        return "Marginal";







      case "UNSUITABLE":



        return "Not Suitable";







      default:



        if (!status) {



          return "Not Available";



        }







        return status



          .replace(/_/g, " ")



          .toLowerCase()



          .replace(



            /\b\w/g,



            (letter) =>



              letter.toUpperCase()



          );



    }



  }











  function getStatusIcon(



    status?: string | null



  ) {



    const normalized =



      normalizeStatus(status);







    switch (normalized) {



      case "GOOD":



      case "OPTIMAL":



      case "ADEQUATE":



      case "VALID":



      case "HIGHLY_SUITABLE":



      case "SUITABLE":



        return "✓";







      case "MODERATE":



      case "CONDITIONAL":



        return "⚠";







      case "POOR":



      case "LOW":



      case "MARGINAL":



        return "!";







      case "CRITICAL":



      case "CRITICAL_CONSTRAINT":



      case "UNSUITABLE":



        return "⚠";







      default:



        return "?";



    }



  }











  function getParameterMessage(



    parameter: string,



    status?: string | null



  ) {



    const normalized =



      normalizeStatus(status);







    if (



      normalized === "GOOD" ||



      normalized === "OPTIMAL"



    ) {



      return `${parameter} is in a good screening range.`;



    }







    if (



      normalized === "ADEQUATE"



    ) {



      return `${parameter} is currently at an adequate screening level.`;



    }







    if (



      normalized === "MODERATE"



    ) {



      return `${parameter} may need some attention.`;



    }







    if (



      normalized === "LOW" ||



      normalized === "POOR"



    ) {



      return `${parameter} appears low and may need attention for the intended crop.`;



    }







    if (



      normalized === "HIGH"



    ) {



      return `${parameter} appears high and should be considered when planning crop management.`;



    }







    if (



      normalized === "ACIDIC"



    ) {



      return `${parameter} indicates acidic soil conditions.`;



    }







    if (



      normalized === "ALKALINE"



    ) {



      return `${parameter} indicates alkaline soil conditions.`;



    }







    if (



      normalized === "CRITICAL"



    ) {



      return `${parameter} requires verification or attention before making important farming decisions.`;



    }







    return `${parameter} has not been fully interpreted for this report.`;



  }











  function getStatusWidth(



    status?: string | null



  ) {



    const normalized =



      normalizeStatus(status);







    switch (normalized) {



      case "GOOD":



      case "OPTIMAL":



      case "ADEQUATE":



        return "w-full";







      case "MODERATE":



        return "w-2/3";







      case "LOW":



      case "POOR":



        return "w-1/3";







      case "CRITICAL":



        return "w-1/4";







      default:



        return "w-1/2";



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



        return "Review First";







      case "VERIFY_MEASUREMENTS":



        return "Verify Soil Test";







      case "DO_NOT_RECOMMEND":



        return "Not Recommended";







      default:



        return crop.decision



          .replace(/_/g, " ")



          .toLowerCase()



          .replace(



            /\b\w/g,



            (letter) =>



              letter.toUpperCase()



          );



    }



  }











  /* ==========================================================================

     DOWNLOAD PDF

     ========================================================================== */



  async function handleDownloadPdf() {

    if (!id || !test) {

      setPdfError("The soil report is not available for download.");

      return;

    }



    try {

      setDownloadingPdf(true);

      setPdfError("");



      const response = await api.get(

        `/reports/soil/${id}/pdf/`,

        { responseType: "blob" }

      );



        response.headers["content-type"] || "application/pdf";



      const blob = new Blob([response.data], {
  type: "application/pdf",});

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");



      const safeSampleId = (test.sample_id || "soil-report")

        .replace(/[^a-zA-Z0-9-_]/g, "-");



      link.href = downloadUrl;

      link.download = `SoilGenie-Soil-Report-${safeSampleId}.pdf`;



      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

    } catch (err: any) {

      console.error("Unable to download soil report PDF:", err);



      let message =

        "Unable to download the PDF report. Please try again.";



      if (err?.response?.status === 401) {

        message =

          "Your session has expired. Please sign in again and retry the download.";

      } else if (err?.response?.status === 404) {

        message =

          "The PDF report could not be found for this soil test.";

      }



      setPdfError(message);

    } finally {

      setDownloadingPdf(false);

    }

  }





  /* ==========================================================================

     DERIVED DATA

     ========================================================================== */







  const overallStatus =



    analysis?.overall_status;







  const overallStyle =



    getStatusClass(



      overallStatus



    );











  const parameters = [



    {



      name: "Soil pH",



      value:



        test?.result?.ph,



      unit: "",



      status:



        analysis?.ph_status,



      icon: "🌱",



    },







    {



      name: "Nitrogen",



      value:



        test?.result



          ?.nitrogen_mg_kg,



      unit: "mg/kg",



      status:



        analysis?.nitrogen_status,



      icon: "🌿",



    },







    {



      name: "Phosphorus",



      value:



        test?.result



          ?.phosphorus_mg_kg,



      unit: "mg/kg",



      status:



        analysis?.phosphorus_status,



      icon: "🌾",



    },







    {



      name: "Potassium",



      value:



        test?.result



          ?.potassium_mg_kg,



      unit: "mg/kg",



      status:



        analysis?.potassium_status,



      icon: "🌻",



    },







    {



      name: "Moisture",



      value:



        test?.result



          ?.moisture_percent,



      unit: "%",



      status:



        analysis?.moisture_status,



      icon: "💧",



    },







    {



      name: "Organic Matter",



      value:



        test?.result



          ?.organic_matter_percent,



      unit: "%",



      status:



        analysis



          ?.organic_matter_status,



      icon: "🌍",



    },



  ];











  const cropRecommendations =



    useMemo(() => {



      if (!recommendation) {



        return [];



      }







      return [



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



      ];



    }, [recommendation]);











  const sortedCrops =



    useMemo(() => {



      return [



        ...cropRecommendations,



      ].sort(



        (a, b) =>



          b.score - a.score



      );



    }, [cropRecommendations]);











  const bestCrop =



    recommendation?.best_crop ||



    null;











  const provisionalBestCrop =



    recommendation



      ?.provisional_best_crop ||



    null;











  const bestCropDetails =



    sortedCrops.find(



      (crop) =>



        crop.crop === bestCrop



    ) ||



    sortedCrops.find(



      (crop) =>



        crop.crop ===



        provisionalBestCrop



    ) ||



    null;











  const otherCrops =



    bestCropDetails



      ? sortedCrops.filter(



          (crop) =>



            crop.crop !==



            bestCropDetails.crop



        )



      : sortedCrops;











  /* ==========================================================================



     LOADING



     ========================================================================== */







  if (loading) {



    return (



      <DashboardLayout>



        <div className="mx-auto max-w-4xl">



          <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">



            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-700" />







            <p className="mt-4 text-sm text-slate-500">



              Preparing your soil



              report...



            </p>



          </div>



        </div>



      </DashboardLayout>



    );



  }











  /* ==========================================================================



     ERROR



     ========================================================================== */







  if (



    error ||



    !test



  ) {



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



            ← Back



          </button>







          <div className="rounded-3xl border border-red-200 bg-red-50 p-8">



            <div className="flex items-start gap-4">



              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl text-red-700">



                !



              </div>







              <div>



                <h1 className="text-xl font-bold text-red-900">



                  Unable to load soil



                  report



                </h1>







                <p className="mt-2 text-sm leading-6 text-red-700">



                  {error ||



                    "The requested soil report could not be found."}



                </p>



              </div>



            </div>



          </div>



        </div>



      </DashboardLayout>



    );



  }











  /* ==========================================================================



     PAGE



     ========================================================================== */







  return (



    <DashboardLayout>



      <div className="mx-auto max-w-4xl space-y-6 pb-12">







        {/* ================================================================



            TOP NAVIGATION



           ================================================================ */}







        <div className="flex items-center justify-between">



          <button



            type="button"



            onClick={() =>



              navigate(



                `/agent/soil/samples/${test.sample}`



              )



            }



            className="text-sm font-semibold text-green-700 hover:text-green-800"



          >



            ← Back



          </button>







          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">



            SoilGenie Report



          </span>



        </div>











        {/* ================================================================



            REPORT HEADER



           ================================================================ */}







        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-800 to-green-600 p-6 text-white shadow-lg sm:p-8">



          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">



            <div>



              <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">



                Farmer Soil Report



              </div>







              <h1 className="text-3xl font-bold sm:text-4xl">



                Your Soil Health



                Report



              </h1>







              <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 sm:text-base">



                Understand your soil,



                discover suitable crops



                and see the most



                important actions to



                consider next.



              </p>



            </div>







            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-4xl">



              🌱



            </div>



          </div>







          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">



            <div className="rounded-2xl bg-white/10 p-4">



              <p className="text-xs text-green-100">



                Farm



              </p>







              <p className="mt-1 font-bold">



                {test.farm_name}



              </p>



            </div>







            <div className="rounded-2xl bg-white/10 p-4">



              <p className="text-xs text-green-100">



                Sample



              </p>







              <p className="mt-1 break-all font-bold">



                {test.sample_id}



              </p>



            </div>







            <div className="rounded-2xl bg-white/10 p-4">



              <p className="text-xs text-green-100">



                Report Date



              </p>







              <p className="mt-1 font-bold">



                {formatDate(



                  test.tested_at ||



                    test.created_at



                )}



              </p>



            </div>



          </div>



        </section>











        {/* ================================================================



            OVERALL SOIL CONDITION



           ================================================================ */}







        {analysis ? (



          <section



            className={`rounded-3xl border p-6 shadow-sm sm:p-8 ${overallStyle.card}`}



          >



            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">



              <div



                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-3xl shadow-sm ${overallStyle.icon}`}



              >



                {getStatusIcon(



                  overallStatus



                )}



              </div>







              <div className="flex-1">



                <p className="text-sm font-semibold uppercase tracking-wider opacity-70">



                  Your Soil Condition



                </p>







                <div className="mt-1 flex flex-wrap items-center gap-3">



                  <h2



                    className={`text-3xl font-bold ${overallStyle.text}`}



                  >



                    {getStatusLabel(



                      overallStatus



                    )}



                  </h2>







                  <span



                    className={`rounded-full border px-3 py-1 text-xs font-bold ${overallStyle.badge}`}



                  >



                    {overallStatus}



                  </span>



                </div>







                {recommendation



                  ?.farmer_summary ? (



                  <p className="mt-3 text-sm leading-7 opacity-90">



                    {



                      recommendation.farmer_summary



                    }



                  </p>



                ) : analysis.summary ? (



                  <p className="mt-3 text-sm leading-7 opacity-90">



                    {



                      analysis.summary



                    }



                  </p>



                ) : null}



              </div>



            </div>



          </section>



        ) : (



          <section className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6">



            <div className="flex gap-4">



              <div className="text-2xl">



                🧠



              </div>







              <div>



                <h2 className="font-bold text-yellow-900">



                  SoilGenie analysis



                  is not ready yet



                </h2>







                <p className="mt-2 text-sm leading-6 text-yellow-800">



                  Your soil measurements



                  have been recorded.



                  SoilGenie will display



                  your guidance once the



                  analysis is available.



                </p>



              </div>



            </div>



          </section>



        )}











        {/* ================================================================



            BEST CROP MATCH



           ================================================================ */}







        {recommendation && (



          <section className="overflow-hidden rounded-3xl border border-green-200 bg-white shadow-sm">



            <div className="border-b border-green-100 bg-green-50 p-6 sm:p-8">



              <p className="text-sm font-semibold uppercase tracking-wider text-green-700">



                Crop Match



              </p>







              <h2 className="mt-1 text-2xl font-bold text-slate-900">



                Crops That Match Your



                Soil



              </h2>







              <p className="mt-2 text-sm leading-6 text-slate-600">



                SoilGenie compared the



                available soil



                measurements with the



                crops currently included



                in its screening model.



              </p>



            </div>







            <div className="p-6 sm:p-8">







              {/* Safe recommendation */}







              {bestCrop &&



              bestCropDetails ? (



                <div className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">



                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">



                    <div className="flex items-center gap-4">



                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-3xl text-white shadow-sm">



                        🌾



                      </div>







                      <div>



                        <p className="text-xs font-bold uppercase tracking-wider text-green-700">



                          Best Crop Match



                        </p>







                        <h3 className="mt-1 text-3xl font-bold text-green-950">



                          {



                            bestCropDetails.crop



                          }



                        </h3>







                        <p className="mt-1 text-sm font-medium text-green-800">



                          {getStatusLabel(



                            bestCropDetails.suitability



                          )}



                        </p>



                      </div>



                    </div>







                    <div className="rounded-2xl bg-white px-6 py-4 text-center shadow-sm">



                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">



                        Suitability Score



                      </p>







                      <p className="mt-1 text-3xl font-bold text-green-800">



                        {



                          bestCropDetails.score



                        }



                        <span className="text-sm font-medium text-slate-400">



                          /100



                        </span>



                      </p>



                    </div>



                  </div>







                  <div className="mt-5 rounded-2xl bg-white/70 p-5">



                    <p className="text-sm leading-7 text-green-900">



                      Based on the



                      available soil



                      measurements,{" "}



                      <strong>



                        {



                          bestCropDetails.crop



                        }



                      </strong>{" "}



                      currently has the



                      strongest safe



                      recommendation



                      among the crops



                      assessed by



                      SoilGenie.



                    </p>



                  </div>



                </div>



              ) : provisionalBestCrop &&



                bestCropDetails ? (



                <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">



                  <div className="flex items-start gap-4">



                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">



                      🌾



                    </div>







                    <div>



                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700">



                        Provisional Best



                        Match



                      </p>







                      <h3 className="mt-1 text-2xl font-bold text-blue-950">



                        {



                          provisionalBestCrop



                        }



                      </h3>







                      <p className="mt-3 text-sm leading-7 text-blue-900">



                        This crop has the



                        strongest



                        provisional match,



                        but SoilGenie is



                        not presenting it



                        as an automatic



                        planting



                        recommendation.



                        Review the soil



                        test issues below



                        first.



                      </p>



                    </div>



                  </div>



                </div>



              ) : (



                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">



                  <h3 className="font-bold text-yellow-950">



                    No crop is currently



                    being automatically



                    recommended



                  </h3>







                  <p className="mt-2 text-sm leading-6 text-yellow-800">



                    Review the soil



                    measurements and



                    recommended next



                    steps before making



                    a planting decision.



                  </p>



                </div>



              )}











              {/* Other crop matches */}







              {otherCrops.length > 0 && (



                <div className="mt-8">



                  <h3 className="text-lg font-bold text-slate-900">



                    Other Crop Matches



                  </h3>







                  <p className="mt-1 text-sm text-slate-500">



                    Other crops assessed



                    against the same soil



                    measurements.



                  </p>







                  <div className="mt-4 grid gap-3 sm:grid-cols-2">



                    {otherCrops.map(



                      (



                        crop,



                        index



                      ) => (



                        <FarmerCropCard



                          key={`${crop.crop}-${index}`}



                          crop={crop}



                          statusLabel={getStatusLabel(



                            crop.suitability



                          )}



                          decisionLabel={getCropDecisionLabel(



                            crop



                          )}



                        />



                      )



                    )}



                  </div>



                </div>



              )}











              {/* Safety notice */}







              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">



                <div className="flex gap-3">



                  <div className="text-lg">



                    ℹ️



                  </div>







                  <p className="text-xs leading-6 text-slate-500">



                    Crop matches are



                    preliminary



                    decision-support



                    results based on the



                    available soil



                    measurements and



                    configured crop



                    profiles. Consider



                    local weather,



                    planting season,



                    variety, field



                    conditions and



                    locally appropriate



                    agronomic advice



                    before planting.



                  </p>



                </div>



              </div>



            </div>



          </section>



        )}











        {/* ================================================================



            WHAT IS GOOD / WHAT NEEDS ATTENTION



           ================================================================ */}







        {recommendation && (



          <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">



            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">



              Your Soil at a Glance



            </p>







            <h2 className="mt-1 text-2xl font-bold text-slate-900">



              What Is Good & What



              Needs Attention



            </h2>







            <div className="mt-6 grid gap-5 md:grid-cols-2">



              <FarmerListCard



                icon="✓"



                title="What Is Good"



                items={



                  recommendation



                    .soil_conditions



                    .strengths



                }



                emptyText="No specific soil strengths were identified from the current measurements."



                className="border-green-200 bg-green-50"



                iconClassName="bg-green-600 text-white"



                titleClassName="text-green-950"



              />







              <FarmerListCard



                icon="!"



                title="What Needs Attention"



                items={[



                  ...recommendation



                    .soil_conditions



                    .limitations,







                  ...recommendation



                    .soil_conditions



                    .risks,



                ]}



                emptyText="No major soil limitations or risks were identified from the current measurements."



                className="border-orange-200 bg-orange-50"



                iconClassName="bg-orange-500 text-white"



                titleClassName="text-orange-950"



              />



            </div>



          </section>



        )}











        {/* ================================================================



            NEXT STEPS



           ================================================================ */}







        {recommendation &&



          recommendation



            .soil_conditions



            .actions.length > 0 && (



            <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm sm:p-8">



              <div className="flex items-start gap-4">



                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">



                  →



                </div>







                <div className="flex-1">



                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">



                    Action Plan



                  </p>







                  <h2 className="mt-1 text-2xl font-bold text-blue-950">



                    What You Should Do



                    Next



                  </h2>







                  <p className="mt-2 text-sm leading-6 text-blue-800">



                    Based on this soil



                    screening, these are



                    the main actions to



                    consider.



                  </p>







                  <div className="mt-6 space-y-3">



                    {recommendation



                      .soil_conditions



                      .actions.map(



                        (



                          action,



                          index



                        ) => (



                          <div



                            key={`${action}-${index}`}



                            className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"



                          >



                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">



                              {index + 1}



                            </div>







                            <p className="pt-1 text-sm leading-6 text-slate-700">



                              {action}



                            </p>



                          </div>



                        )



                      )}



                  </div>



                </div>



              </div>



            </section>



          )}











        {/* ================================================================



            MEASUREMENT VALIDATION WARNING



           ================================================================ */}







        {recommendation &&



          recommendation



            .measurement_validation



            .recommendation_blocked && (



            <section className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8">



              <div className="flex items-start gap-4">



                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-xl text-white">



                  !



                </div>







                <div>



                  <p className="text-sm font-semibold uppercase tracking-wider text-red-700">



                    Important



                  </p>







                  <h2 className="mt-1 text-xl font-bold text-red-950">



                    Verify Your Soil



                    Measurements



                  </h2>







                  <p className="mt-3 text-sm leading-7 text-red-900">



                    SoilGenie detected



                    measurement issues



                    that should be



                    checked before using



                    the crop results as



                    planting guidance.



                  </p>







                  {recommendation



                    .measurement_validation



                    .critical_measurements



                    .length > 0 && (



                    <div className="mt-5 space-y-3">



                      {recommendation



                        .measurement_validation



                        .critical_measurements



                        .map(



                          (



                            item,



                            index



                          ) => (



                            <div



                              key={`${item.parameter}-${index}`}



                              className="rounded-xl bg-white p-4"



                            >



                              <p className="font-semibold text-slate-900">



                                {



                                  item.parameter



                                }



                              </p>







                              {item.message && (



                                <p className="mt-1 text-sm leading-6 text-slate-600">



                                  {



                                    item.message



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











        {/* ================================================================



            SOIL MEASUREMENTS



           ================================================================ */}







        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">



          <div>



            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">



              Your Soil



            </p>







            <h2 className="mt-1 text-2xl font-bold text-slate-900">



              Soil Measurements



            </h2>







            <p className="mt-2 text-sm leading-6 text-slate-500">



              These are the main soil



              properties measured during



              your soil test.



            </p>



          </div>







          <div className="mt-6 grid gap-4 sm:grid-cols-2">



            {parameters.map(



              (parameter) => {



                const style =



                  getStatusClass(



                    parameter.status



                  );







                return (



                  <div



                    key={



                      parameter.name



                    }



                    className="rounded-2xl border bg-slate-50 p-5"



                  >



                    <div className="flex items-start justify-between gap-3">



                      <div className="flex items-center gap-3">



                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">



                          {



                            parameter.icon



                          }



                        </div>







                        <div>



                          <p className="font-bold text-slate-900">



                            {



                              parameter.name



                            }



                          </p>







                          <p className="mt-1 text-xs leading-5 text-slate-500">



                            {getParameterMessage(



                              parameter.name,



                              parameter.status



                            )}



                          </p>



                        </div>



                      </div>







                      {parameter.status && (



                        <span



                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${style.badge}`}



                        >



                          {getStatusLabel(



                            parameter.status



                          )}



                        </span>



                      )}



                    </div>







                    <div className="mt-5">



                      <span className="text-3xl font-bold text-slate-900">



                        {displayValue(



                          parameter.value



                        )}



                      </span>







                      {parameter.unit && (



                        <span className="ml-1 text-sm text-slate-500">



                          {



                            parameter.unit



                          }



                        </span>



                      )}







                      {parameter.status && (



                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">



                          <div



                            className={`h-full rounded-full transition-all ${style.icon} ${getStatusWidth(



                              parameter.status



                            )}`}



                          />



                        </div>



                      )}



                    </div>



                  </div>



                );



              }



            )}



          </div>







          <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">



            <div className="rounded-2xl bg-slate-50 p-5">



              <p className="text-sm font-semibold text-slate-500">



                Electrical



                Conductivity



              </p>







              <p className="mt-2 text-2xl font-bold text-slate-900">



                {displayValue(



                  test.result



                    ?.electrical_conductivity_ds_m



                )}







                <span className="ml-1 text-sm font-normal text-slate-500">



                  dS/m



                </span>



              </p>



            </div>







            <div className="rounded-2xl bg-slate-50 p-5">



              <p className="text-sm font-semibold text-slate-500">



                Soil Temperature



              </p>







              <p className="mt-2 text-2xl font-bold text-slate-900">



                {displayValue(



                  test.result



                    ?.temperature_celsius



                )}







                <span className="ml-1 text-sm font-normal text-slate-500">



                  °C



                </span>



              </p>



            </div>



          </div>



        </section>











        {/* ================================================================



            GENERAL SOIL GUIDANCE



           ================================================================ */}







        {analysis && (



          <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">



            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">



              Soil Management



            </p>







            <h2 className="mt-1 text-2xl font-bold text-slate-900">



              General Guidance



            </h2>







            <p className="mt-2 text-sm leading-6 text-slate-500">



              Additional guidance from



              the current SoilGenie soil



              screening.



            </p>







            <div className="mt-6 space-y-4">



              {analysis.recommendations && (



                <GuidanceCard



                  icon="🌱"



                  title="General Advice"



                  text={



                    analysis.recommendations



                  }



                  className="border-green-200 bg-green-50"



                />



              )}







              {analysis.fertilizer_recommendation && (



                <GuidanceCard



                  icon="🧪"



                  title="Nutrient Management"



                  text={



                    analysis.fertilizer_recommendation



                  }



                />



              )}







              {analysis.amendment_recommendation && (



                <GuidanceCard



                  icon="🌍"



                  title="Soil Improvement"



                  text={



                    analysis.amendment_recommendation



                  }



                />



              )}







              {analysis.irrigation_recommendation && (



                <GuidanceCard



                  icon="💧"



                  title="Water & Irrigation"



                  text={



                    analysis.irrigation_recommendation



                  }



                />



              )}



            </div>



          </section>



        )}











        {/* ================================================================



            RECOMMENDATION FALLBACK



           ================================================================ */}







        {test.result &&



          !recommendation &&



          recommendationError && (



            <section className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6">



              <h2 className="font-bold text-yellow-950">



                Crop guidance is



                temporarily unavailable



              </h2>







              <p className="mt-2 text-sm leading-6 text-yellow-800">



                Your soil analysis is



                still available above,



                but the crop suitability



                section could not be



                loaded.



              </p>



            </section>



          )}











        {/* ================================================================



            FARMER SUMMARY



           ================================================================ */}







        <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">



          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">



            <div className="max-w-2xl">



              <p className="text-sm font-semibold uppercase tracking-wider text-green-300">



                Your SoilGenie Summary



              </p>







              <h2 className="mt-2 text-2xl font-bold">



                Better Soil.



                Better Decisions.



              </h2>







              <p className="mt-4 text-sm leading-7 text-slate-300">



                This report provides



                preliminary



                decision-support from



                your available soil



                measurements. Use it



                together with your



                farming experience,



                seasonal conditions and



                locally appropriate



                agricultural guidance.



              </p>



            </div>







            <div className="text-4xl">



              🌱



            </div>



          </div>







          <div className="mt-6 grid gap-3 sm:grid-cols-2">



            <div className="rounded-2xl bg-white/10 p-5">



              <p className="text-xs font-semibold uppercase tracking-wide text-green-300">



                Report ID



              </p>







              <p className="mt-2 break-all font-mono text-sm text-white">



                {test.test_id}



              </p>



            </div>







            <div className="rounded-2xl bg-white/10 p-5">



              <p className="text-xs font-semibold uppercase tracking-wide text-green-300">



                Farm



              </p>







              <p className="mt-2 font-semibold text-white">



                {test.farm_name}



              </p>



            </div>



          </div>



        </section>











        {/* ================================================================



            FUTURE SHARING ACTIONS



           ================================================================ */}







        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">



          <h2 className="text-xl font-bold text-slate-900">



            Share Your Soil Report



          </h2>







          <p className="mt-2 text-sm leading-6 text-slate-500">



            More ways to receive and



            share your SoilGenie report



            will be added as the



            platform develops.



          </p>







          <div className="mt-6 grid gap-3 sm:grid-cols-3">

            <button

              type="button"

              onClick={handleDownloadPdf}

              disabled={downloadingPdf}

              className="rounded-2xl border border-green-700 bg-green-700 px-4 py-4 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"

            >

              <span className="mr-1">

                {downloadingPdf ? "⏳" : "📄"}

              </span>



              {downloadingPdf

                ? "Generating PDF..."

                : "Download PDF"}



              <span className="mt-1 block text-xs font-normal text-green-100">

                {downloadingPdf

                  ? "Please wait"

                  : "Save report"}

              </span>

            </button>







            <ComingSoonButton



              icon="💬"



              label="Send by SMS"



            />







            <ComingSoonButton



              icon="🗣️"



              label="Hausa Report"



            />



          </div>



          {pdfError && (

            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              {pdfError}

            </div>

          )}



        </section>











        {/* ================================================================



            TECHNICAL VIEW



           ================================================================ */}







        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">



          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">



            <div>



              <h2 className="font-bold text-slate-900">



                Need More Detail?



              </h2>







              <p className="mt-1 text-sm leading-6 text-slate-500">



                Agents and technical



                users can view the full



                soil analysis and crop



                suitability breakdown.



              </p>



            </div>







            <button



              type="button"



              onClick={() =>



                navigate(



                  `/agent/soil/tests/${test.id}`



                )



              }



              className="shrink-0 rounded-xl border border-green-700 bg-white px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-50"



            >



              View Technical Analysis



            </button>



          </div>



        </section>











        {/* ================================================================



            FOOTER



           ================================================================ */}







        <div className="pb-4 text-center">



          <p className="mx-auto max-w-2xl text-xs leading-5 text-slate-400">



            SoilGenie provides



            agricultural



            decision-support based on



            the soil measurements



            available for this test.



            Crop suitability and



            management guidance should



            be interpreted alongside



            local field conditions and



            appropriate agronomic



            advice.



          </p>







          <p className="mt-3 text-xs font-semibold text-green-700">



            SoilGenie • Better Soil.



            Better Decisions.



          </p>



        </div>



      </div>



    </DashboardLayout>



  );



}











/* ==========================================================================



   FARMER CROP CARD



   ========================================================================== */







function FarmerCropCard({



  crop,



  statusLabel,



  decisionLabel,



}: {



  crop: CropRecommendation;



  statusLabel: string;



  decisionLabel: string;



}) {



  const recommended =



    crop.automatic_recommendation;







  const blocked =



    crop.decision ===



    "VERIFY_MEASUREMENTS";







  const notRecommended =



    crop.decision ===



    "DO_NOT_RECOMMEND";







  let cardClass =



    "border-slate-200 bg-slate-50";







  if (recommended) {



    cardClass =



      "border-green-200 bg-green-50";



  } else if (blocked) {



    cardClass =



      "border-blue-200 bg-blue-50";



  } else if (



    crop.decision ===



    "CONDITIONAL"



  ) {



    cardClass =



      "border-yellow-200 bg-yellow-50";



  } else if (



    crop.decision === "HOLD"



  ) {



    cardClass =



      "border-orange-200 bg-orange-50";



  } else if (



    notRecommended



  ) {



    cardClass =



      "border-red-200 bg-red-50";



  }







  return (



    <div



      className={`rounded-2xl border p-5 ${cardClass}`}



    >



      <div className="flex items-start justify-between gap-4">



        <div>



          <p className="text-lg font-bold text-slate-900">



            {crop.crop}



          </p>







          <p className="mt-1 text-xs font-semibold text-slate-500">



            {statusLabel}



          </p>



        </div>







        <div className="text-right">



          <p className="text-2xl font-bold text-slate-900">



            {crop.score}



          </p>







          <p className="text-xs text-slate-400">



            /100



          </p>



        </div>



      </div>







      <div className="mt-4 flex flex-wrap gap-2">



        <span className="rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-semibold text-slate-700">



          {decisionLabel}



        </span>







        <span className="rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-semibold text-slate-700">



          {crop.confidence} confidence



        </span>



      </div>







      {crop.reason && (



        <p className="mt-4 text-xs leading-6 text-slate-600">



          {crop.reason}



        </p>



      )}



    </div>



  );



}











/* ==========================================================================



   FARMER LIST CARD



   ========================================================================== */







function FarmerListCard({



  icon,



  title,



  items,



  emptyText,



  className,



  iconClassName,



  titleClassName,



}: {



  icon: string;



  title: string;



  items: string[];



  emptyText: string;



  className: string;



  iconClassName: string;



  titleClassName: string;



}) {



  return (



    <div



      className={`rounded-2xl border p-6 ${className}`}



    >



      <div className="flex items-center gap-3">



        <div



          className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${iconClassName}`}



        >



          {icon}



        </div>







        <h3



          className={`font-bold ${titleClassName}`}



        >



          {title}



        </h3>



      </div>







      {items.length > 0 ? (



        <ul className="mt-5 space-y-3">



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



        <p className="mt-5 text-sm leading-6 text-slate-600">



          {emptyText}



        </p>



      )}



    </div>



  );



}











/* ==========================================================================



   GUIDANCE CARD



   ========================================================================== */







function GuidanceCard({



  icon,



  title,



  text,



  className = "border-slate-200 bg-white",



}: {



  icon: string;



  title: string;



  text: string;



  className?: string;



}) {



  return (



    <div



      className={`rounded-2xl border p-6 ${className}`}



    >



      <div className="flex gap-4">



        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">



          {icon}



        </div>







        <div>



          <h3 className="font-bold text-slate-900">



            {title}



          </h3>







          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">



            {text}



          </p>



        </div>



      </div>



    </div>



  );



}











/* ==========================================================================



   COMING SOON BUTTON



   ========================================================================== */







function ComingSoonButton({



  icon,



  label,



}: {



  icon: string;



  label: string;



}) {



  return (



    <button



      type="button"



      disabled



      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-400"



    >



      <span className="mr-1">



        {icon}



      </span>







      {label}







      <span className="mt-1 block text-xs font-normal">



        Coming soon



      </span>



    </button>



  );



}