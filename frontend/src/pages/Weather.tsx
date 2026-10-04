import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  MapPin,
  RefreshCw,
  Sprout,
  Thermometer,
  Wind,
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import api from "../api/api";

/* ============================================================
   TYPES
   ============================================================ */

interface Farm {
  id: number;
  farm_id: string;
  farm_name: string;
  farm_size: number | string;
  primary_crop?: string | null;
  farming_type: string;
  irrigation_type: string;
  state: string;
  lga: string;
  ward?: string | null;
  village?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface CurrentWeather {
  time: string;
  temperature: number | null;
  apparent_temperature: number | null;
  humidity: number | null;
  precipitation: number | null;
  rain: number | null;
  weather_code: number | null;
  condition: string;
  wind_speed: number | null;
  wind_direction: number | null;
  surface_pressure: number | null;
}

interface ForecastDay {
  date: string;
  weather_code: number | null;
  condition: string;
  temperature_max: number | null;
  temperature_min: number | null;
  precipitation: number | null;
  rain: number | null;
  precipitation_probability: number | null;
  wind_speed_max: number | null;
  et0: number | null;
}

interface WeatherResponse {
  timezone: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  forecast: ForecastDay[];

  agricultural_context?: {
    rain_fed: boolean;
    primary_crop?: string | null;
    weather_role: string;
  };

  farm: Farm;
}

/* ============================================================
   SOIL TYPES
   ============================================================ */

interface SoilSample {
  id: number;
  sample_id: string;
  farm: number;
  farm_id?: string;
  farm_name?: string;
  status?: string;
  collection_date?: string | null;
  created_at?: string;
}

interface SoilTestResult {
  id: number;
  test: number;

  ph: number | null;

  nitrogen_mg_kg: number | null;

  phosphorus_mg_kg: number | null;

  potassium_mg_kg: number | null;

  moisture_percent: number | null;

  electrical_conductivity_ds_m: number | null;

  organic_matter_percent: number | null;

  temperature_celsius: number | null;

  created_at?: string;
}

interface SoilTest {
  id: number;

  test_id: string;

  sample: number;

  sample_id: string;

  farm_name?: string;

  test_method?: string;

  status: string;

  tested_at?: string | null;

  notes?: string | null;

  result?: SoilTestResult | null;

  created_at: string;
}

interface SoilRecommendation {
  best_crop?: unknown;

  provisional_best_crop?: unknown;

  farmer_summary?: string;

  measurement_validation?: Record<
    string,
    unknown
  >;

  soil_conditions?: Record<
    string,
    unknown
  >;

  crop_recommendations?: unknown;
}

interface SoilIntelligence {
  test: SoilTest;

  result: SoilTestResult;

  recommendation:
    | SoilRecommendation
    | null;
}

/* ============================================================
   HELPERS
   ============================================================ */

function unwrapArray<T>(
  data: T[] | { results?: T[] }
): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(data?.results)
  ) {
    return data.results;
  }

  return [];
}


function formatDay(
  date: string
) {
  const parsed =
    new Date(
      `${date}T12:00:00`
    );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-NG",
    {
      weekday: "short",
    }
  );
}


function formatTime(
  value?: string
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleTimeString(
    "en-NG",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function formatIrrigationType(
  value?: string
) {
  switch (value) {
    case "RAIN_FED":
      return "Rain-fed";

    case "IRRIGATED":
      return "Irrigated";

    case "MIXED":
      return "Mixed";

    default:
      return (
        value ||
        "Not specified"
      );
  }
}


function formatFarmingType(
  value?: string
) {
  switch (value) {
    case "SMALLHOLDER":
      return "Smallholder";

    case "COMMERCIAL":
      return "Commercial";

    case "COOPERATIVE":
      return "Cooperative";

    default:
      return (
        value ||
        "Not specified"
      );
  }
}


function formatCrop(
  value?: string | null
) {
  if (!value) {
    return "Not specified";
  }

  const cleaned =
    String(value).trim();

  if (!cleaned) {
    return "Not specified";
  }

  /*
   * Prevent numeric internal IDs
   * from appearing as crop names.
   */
  if (
    /^\d+$/.test(cleaned)
  ) {
    return "Not specified";
  }

  return cleaned;
}


function cropName(
  value: unknown
) {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const item =
      value as Record<
        string,
        unknown
      >;

    const candidates = [
      "name",
      "crop",
      "crop_name",
      "label",
      "title",
    ];

    for (
      const key of candidates
    ) {
      if (
        typeof item[key] ===
          "string" &&
        String(
          item[key]
        ).trim()
      ) {
        return String(
          item[key]
        ).trim();
      }
    }
  }

  return "Not specified";
}


function formatNumber(
  value:
    | number
    | null
    | undefined,
  decimals = 1
) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(
      Number(value)
    )
  ) {
    return "—";
  }

  return Number(value).toFixed(
    decimals
  );
}


function moistureLabel(
  value: number | null
) {
  if (value === null) {
    return "Not available";
  }

  if (value < 10) {
    return "Low";
  }

  if (value <= 30) {
    return "Adequate";
  }

  return "High";
}


function weatherIcon(
  condition: string
) {
  const text =
    condition.toLowerCase();

  if (
    text.includes("rain") ||
    text.includes("drizzle") ||
    text.includes("shower") ||
    text.includes("thunder")
  ) {
    return CloudRain;
  }

  return CloudSun;
}


/* ============================================================
   PAGE
   ============================================================ */

export default function Weather() {

  const [farms, setFarms] =
    useState<Farm[]>([]);

  const [
    selectedFarmId,
    setSelectedFarmId,
  ] = useState<
    number | null
  >(null);

  const [weather, setWeather] =
    useState<
      WeatherResponse | null
    >(null);

  const [
    soilIntelligence,
    setSoilIntelligence,
  ] = useState<
    SoilIntelligence | null
  >(null);

  const [
    loadingFarms,
    setLoadingFarms,
  ] = useState(true);

  const [
    loadingWeather,
    setLoadingWeather,
  ] = useState(false);

  const [
    loadingSoil,
    setLoadingSoil,
  ] = useState(false);

  const [error, setError] =
    useState("");


  /* ============================================================
     LOAD FARMS
     ============================================================ */

  async function loadFarms() {

    try {

      setLoadingFarms(true);

      setError("");

      const response =
        await api.get<
          Farm[] |
          {
            results?: Farm[];
          }
        >("/farms/");

      const allFarms =
        unwrapArray(
          response.data
        );

      const gpsFarms =
        allFarms.filter(
          (farm) =>
            farm.latitude !==
              null &&
            farm.latitude !==
              undefined &&
            farm.longitude !==
              null &&
            farm.longitude !==
              undefined
        );

      setFarms(
        gpsFarms
      );

      if (
        gpsFarms.length > 0
      ) {

        setSelectedFarmId(
          (current) => {

            if (
              current &&
              gpsFarms.some(
                (farm) =>
                  farm.id ===
                  current
              )
            ) {
              return current;
            }

            return gpsFarms[0]
              .id;
          }
        );

      } else {

        setSelectedFarmId(
          null
        );

      }

    } catch (err) {

      console.error(
        "Failed to load farms:",
        err
      );

      setError(
        "Unable to load farms with GPS locations."
      );

    } finally {

      setLoadingFarms(
        false
      );

    }
  }


  /* ============================================================
     LOAD WEATHER
     ============================================================ */

  async function loadWeather(
    farmId: number
  ) {

    try {

      setLoadingWeather(
        true
      );

      setError("");

      const response =
        await api.get<WeatherResponse>(
          `/weather/farm/${farmId}/`
        );

      setWeather(
        response.data
      );

    } catch (err) {

      console.error(
        "Failed to load weather:",
        err
      );

      setWeather(null);

      setError(
        "Unable to retrieve weather information for this farm right now."
      );

    } finally {

      setLoadingWeather(
        false
      );

    }
  }


  /* ============================================================
     LOAD SOIL INTELLIGENCE
     ============================================================ */

  async function loadSoilIntelligence(
    farmId: number
  ) {

    try {

      setLoadingSoil(
        true
      );

      const samplesResponse =
        await api.get<
          SoilSample[] |
          {
            results?: SoilSample[];
          }
        >(
          `/soil/samples/?farm=${farmId}`
        );

      const samples =
        unwrapArray(
          samplesResponse.data
        );

      if (
        samples.length === 0
      ) {

        setSoilIntelligence(
          null
        );

        return;
      }


      /*
       * SoilSample does not expose
       * a `tests` relation in the
       * frontend API, so we retrieve
       * tests using the sample ID.
       */

      const testGroups =
        await Promise.all(
          samples.map(
            async (
              sample
            ) => {

              try {

                const response =
                  await api.get<
                    SoilTest[] |
                    {
                      results?: SoilTest[];
                    }
                  >(
                    `/soil/tests/?sample=${encodeURIComponent(
                      sample.sample_id
                    )}`
                  );

                return unwrapArray(
                  response.data
                );

              } catch (err) {

                console.error(
                  `Unable to load tests for ${sample.sample_id}:`,
                  err
                );

                return [];
              }

            }
          )
        );


      const completedTests =
        testGroups
          .flat()
          .filter(
            (test) =>
              String(
                test.status
              ).toUpperCase() ===
                "COMPLETED" &&
              !!test.result
          )
          .sort(
            (
              a,
              b
            ) => {

              const aTime =
                new Date(
                  a.tested_at ??
                    a.created_at
                ).getTime();

              const bTime =
                new Date(
                  b.tested_at ??
                    b.created_at
                ).getTime();

              return (
                bTime -
                aTime
              );
            }
          );


      const latestTest =
        completedTests[0];


      if (
        !latestTest ||
        !latestTest.result
      ) {

        setSoilIntelligence(
          null
        );

        return;
      }


      let recommendation:
        | SoilRecommendation
        | null = null;


      try {

        const response =
          await api.get<SoilRecommendation>(
            `/soil/results/${latestTest.result.id}/recommendation/`
          );

        recommendation =
          response.data;

      } catch (err) {

        console.error(
          "Unable to load soil recommendation:",
          err
        );

      }


      setSoilIntelligence(
        {
          test: latestTest,

          result:
            latestTest.result,

          recommendation,
        }
      );

    } catch (err) {

      console.error(
        "Unable to load soil intelligence:",
        err
      );

      setSoilIntelligence(
        null
      );

    } finally {

      setLoadingSoil(
        false
      );

    }
  }


  /* ============================================================
     INITIAL LOAD
     ============================================================ */

  useEffect(
    () => {

      loadFarms();

    },
    []
  );


  /* ============================================================
     FARM CHANGE
     ============================================================ */

  useEffect(
    () => {

      if (
        selectedFarmId
      ) {

        loadWeather(
          selectedFarmId
        );

        loadSoilIntelligence(
          selectedFarmId
        );

      } else {

        setSoilIntelligence(
          null
        );

      }

    },
    [selectedFarmId]
  );


  /* ============================================================
     SELECTED FARM
     ============================================================ */

  const selectedFarm =
    useMemo(
      () =>
        farms.find(
          (farm) =>
            farm.id ===
            selectedFarmId
        ),
      [
        farms,
        selectedFarmId,
      ]
    );


  /* ============================================================
     WEATHER INSIGHT
     ============================================================ */

  const weatherInsight =
    useMemo(
      () => {

        if (!weather) {
          return null;
        }

        const current =
          weather.current;

        const rain =
          current.rain !== null
            ? current.rain
            : current.precipitation ??
              0;

        const condition =
          current.condition.toLowerCase();


        if (
          rain > 0 ||
          condition.includes(
            "rain"
          ) ||
          condition.includes(
            "thunder"
          )
        ) {

          return {
            title:
              "Rainfall Conditions",

            message:
              "Rainfall is currently being recorded. Monitor field conditions and soil moisture before planning field operations.",

            icon:
              CloudRain,
          };

        }


        if (
          current.temperature !==
            null &&
          current.temperature >=
            35
        ) {

          return {
            title:
              "High Temperature",

            message:
              "Current temperatures are elevated. Monitor crop water requirements and soil moisture, particularly on rain-fed farms.",

            icon:
              Thermometer,
          };

        }


        if (
          current.humidity !==
            null &&
          current.humidity >=
            80
        ) {

          return {
            title:
              "High Humidity",

            message:
              "Humidity is currently high. Monitor crop and field conditions and consider locally appropriate disease-management guidance where relevant.",

            icon:
              Droplets,
          };

        }


        return {
          title:
            "Current Field Conditions",

          message:
            "Current weather conditions are available for this farm. Consider weather information together with soil measurements, crop requirements and local field conditions when planning farm activities.",

          icon:
            Sprout,
        };

      },
      [weather]
    );


  /* ============================================================
     RAINFALL SUMMARY
     ============================================================ */

  const rainfallSummary =
    useMemo(
      () => {

        if (
          !weather ||
          !weather.forecast ||
          weather.forecast
            .length === 0
        ) {

          return {
            total: 0,
            rainyDays: 0,
          };

        }

        const total =
          weather.forecast.reduce(
            (
              sum,
              day
            ) =>
              sum +
              Number(
                day.rain ??
                  day.precipitation ??
                  0
              ),
            0
          );

        const rainyDays =
          weather.forecast.filter(
            (day) =>
              Number(
                day.rain ??
                  day.precipitation ??
                  0
              ) > 0
          ).length;

        return {
          total:
            Number(
              total.toFixed(1)
            ),

          rainyDays,
        };

      },
      [weather]
    );


  /* ============================================================
     ET0 SUMMARY
     ============================================================ */

  const et0Summary =
    useMemo(
      () => {

        if (
          !weather ||
          !weather.forecast ||
          weather.forecast
            .length === 0
        ) {
          return 0;
        }

        const total =
          weather.forecast.reduce(
            (
              sum,
              day
            ) =>
              sum +
              Number(
                day.et0 ?? 0
              ),
            0
          );

        return Number(
          total.toFixed(1)
        );

      },
      [weather]
    );


  /* ============================================================
     TEMPERATURE SUMMARY
     ============================================================ */

  const temperatureSummary =
    useMemo(
      () => {

        if (
          !weather ||
          !weather.forecast ||
          weather.forecast
            .length === 0
        ) {
          return null;
        }

        const maximums =
          weather.forecast
            .map(
              (day) =>
                day.temperature_max
            )
            .filter(
              (
                value
              ): value is number =>
                value !== null
            );

        const minimums =
          weather.forecast
            .map(
              (day) =>
                day.temperature_min
            )
            .filter(
              (
                value
              ): value is number =>
                value !== null
            );

        return {

          maximum:
            maximums.length >
            0
              ? Math.max(
                  ...maximums
                )
              : null,

          minimum:
            minimums.length >
            0
              ? Math.min(
                  ...minimums
                )
              : null,

        };

      },
      [weather]
    );


  /* ============================================================
     SOIL + WEATHER INTELLIGENCE
     ============================================================ */

  const soilWeatherInsight =
    useMemo(
      () => {

        if (
          !weather ||
          !soilIntelligence
        ) {
          return null;
        }

        const result =
          soilIntelligence.result;

        const moisture =
          result.moisture_percent;

        const rainFed =
          weather.farm
            .irrigation_type ===
          "RAIN_FED";

        const forecastRain =
          rainfallSummary.total;

        const rainyDays =
          rainfallSummary.rainyDays;

        const lowMoisture =
          moisture !== null &&
          moisture < 10;


        let message =
          "Weather and soil measurements should be interpreted together with local field observations and crop requirements.";


        if (
          lowMoisture &&
          rainFed &&
          forecastRain > 0
        ) {

          message =
            "The latest soil test indicates relatively low soil moisture, while rainfall is forecast during the next 7 days. Because this farm is rain-fed, monitor actual field moisture as rainfall occurs rather than relying on the forecast alone.";

        } else if (
          lowMoisture &&
          forecastRain === 0
        ) {

          message =
            "The latest soil test indicates relatively low soil moisture and the current forecast shows no rainfall. Review crop water requirements and locally appropriate water-management options.";

        } else if (
          forecastRain >= 20
        ) {

          message =
            "The forecast indicates substantial rainfall over the next 7 days. Monitor drainage, standing water and actual soil conditions after rainfall.";

        }


        return {

          moisture,

          rainFed,

          forecastRain,

          rainyDays,

          message,

          bestCrop:
            cropName(
              soilIntelligence
                .recommendation
                ?.best_crop ??
                soilIntelligence
                  .recommendation
                  ?.provisional_best_crop
            ),

        };

      },
      [
        weather,
        soilIntelligence,
        rainfallSummary,
      ]
    );


  /* ============================================================
     RENDER
     ============================================================ */

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              SoilGenie Weather
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Weather & Climate Intelligence
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Monitor weather conditions for your registered
              farms and use them alongside soil measurements
              for better field decisions.
            </p>

          </div>


          <button
            type="button"
            onClick={() => {

              loadFarms();

              if (
                selectedFarmId
              ) {

                loadWeather(
                  selectedFarmId
                );

                loadSoilIntelligence(
                  selectedFarmId
                );

              }

            }}
            disabled={
              loadingFarms ||
              loadingWeather ||
              loadingSoil
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <RefreshCw
              size={18}
              className={
                loadingWeather ||
                loadingSoil
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh Weather

          </button>

        </div>


        {/* ======================================================
            FARM SELECTOR
        ====================================================== */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Weather Location
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a registered farm with GPS coordinates.
              </p>

            </div>


            <select
              value={
                selectedFarmId ??
                ""
              }
              onChange={(event) =>
                setSelectedFarmId(
                  event.target.value
                    ? Number(
                        event.target.value
                      )
                    : null
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >

              {farms.length ===
              0 ? (

                <option value="">
                  No GPS-enabled farms
                </option>

              ) : (

                farms.map(
                  (farm) => (

                    <option
                      key={
                        farm.id
                      }
                      value={
                        farm.id
                      }
                    >
                      {
                        farm.farm_name
                      }{" "}
                      —{" "}
                      {
                        farm.farm_id
                      }
                    </option>

                  )
                )

              )}

            </select>

          </div>


          {selectedFarm && (

            <div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-5 text-sm text-slate-500">

              <span className="inline-flex items-center gap-2">

                <MapPin
                  size={16}
                  className="text-green-700"
                />

                {
                  selectedFarm.lga
                }
                ,{" "}
                {
                  selectedFarm.state
                }

              </span>


              <span>
                {
                  selectedFarm.farm_size
                }{" "}
                ha
              </span>


              <span>
                {
                  formatIrrigationType(
                    selectedFarm
                      .irrigation_type
                  )
                }
              </span>


              <span>
                {
                  formatFarmingType(
                    selectedFarm
                      .farming_type
                  )
                }
              </span>


              {selectedFarm.primary_crop &&
                !/^\d+$/.test(
                  String(
                    selectedFarm.primary_crop
                  ).trim()
                ) && (

                  <span>
                    Crop:{" "}
                    {
                      formatCrop(
                        selectedFarm
                          .primary_crop
                      )
                    }
                  </span>

                )}

            </div>

          )}

        </div>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">

            {
              error
            }

          </div>

        )}


        {/* ======================================================
            NO GPS FARMS
        ====================================================== */}

        {!loadingFarms &&
          farms.length ===
            0 && (

            <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">

              <MapPin
                size={42}
                className="mx-auto text-slate-400"
              />

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                No GPS-enabled farms
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-slate-500">
                Weather information requires a farm with
                valid latitude and longitude coordinates.
              </p>

            </div>

          )}


        {/* ======================================================
            LOADING
        ====================================================== */}

        {loadingWeather && (

          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">

            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-green-700"
            />

            <p className="mt-4 font-medium text-slate-700">
              Loading weather conditions...
            </p>

          </div>

        )}


        {/* ======================================================
            WEATHER
        ====================================================== */}

        {weather &&
          !loadingWeather && (

            <>

              {/* ==================================================
                  CURRENT CONDITIONS
              ================================================== */}

              <div className="grid gap-6 lg:grid-cols-3">

                <div className="rounded-2xl bg-green-700 p-8 text-white shadow-sm lg:col-span-2">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm font-semibold uppercase tracking-wide text-green-100">
                        Current Conditions
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
                        {
                          weather
                            .farm
                            .farm_name
                        }
                      </h2>

                      <p className="mt-1 text-green-100">
                        {
                          weather
                            .farm
                            .lga
                        }
                        ,{" "}
                        {
                          weather
                            .farm
                            .state
                        }
                      </p>

                    </div>


                    <CloudSun
                      size={48}
                    />

                  </div>


                  <div className="mt-8 flex items-end gap-4">

                    <span className="text-6xl font-bold">

                      {
                        weather
                          .current
                          .temperature ??
                        "—"
                      }

                      °C

                    </span>


                    <div className="pb-2">

                      <p className="text-lg font-semibold">
                        {
                          weather
                            .current
                            .condition
                        }
                      </p>

                      <p className="text-sm text-green-100">
                        Feels like{" "}
                        {
                          weather
                            .current
                            .apparent_temperature ??
                          "—"
                        }
                        °C
                      </p>

                    </div>

                  </div>


                  <p className="mt-6 text-sm text-green-100">
                    Updated{" "}
                    {
                      formatTime(
                        weather
                          .current
                          .time
                      )
                    }
                  </p>

                </div>


                {/* CURRENT METRICS */}

                <div className="grid grid-cols-2 gap-4">

                  <WeatherMetric
                    icon={
                      <Droplets
                        size={20}
                      />
                    }
                    label="Humidity"
                    value={
                      weather
                        .current
                        .humidity !==
                      null
                        ? `${weather.current.humidity}%`
                        : "—"
                    }
                  />


                  <WeatherMetric
                    icon={
                      <CloudRain
                        size={20}
                      />
                    }
                    label="Rain"
                    value={
                      weather
                        .current
                        .rain !==
                      null
                        ? `${weather.current.rain} mm`
                        : "—"
                    }
                  />


                  <WeatherMetric
                    icon={
                      <Wind
                        size={20}
                      />
                    }
                    label="Wind"
                    value={
                      weather
                        .current
                        .wind_speed !==
                      null
                        ? `${weather.current.wind_speed} km/h`
                        : "—"
                    }
                  />


                  <WeatherMetric
                    icon={
                      <Gauge
                        size={20}
                      />
                    }
                    label="Pressure"
                    value={
                      weather
                        .current
                        .surface_pressure !==
                      null
                        ? `${weather.current.surface_pressure} hPa`
                        : "—"
                    }
                  />

                </div>

              </div>


              {/* ==================================================
                  WEATHER INSIGHT
              ================================================== */}

              {weatherInsight && (

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <div className="flex gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">

                      <weatherInsight.icon
                        size={24}
                      />

                    </div>


                    <div>

                      <h2 className="font-bold text-slate-900">
                        {
                          weatherInsight.title
                        }
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {
                          weatherInsight.message
                        }
                      </p>

                    </div>

                  </div>

                </div>

              )}


              {/* ==================================================
                  WEATHER SUMMARY
              ================================================== */}

              <div className="grid gap-6 md:grid-cols-3">

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-blue-100 p-3 text-blue-700">

                      <CloudRain
                        size={22}
                      />

                    </div>


                    <div>

                      <p className="text-sm font-medium text-slate-500">
                        7-Day Rainfall
                      </p>

                      <p className="text-2xl font-bold text-slate-900">
                        {
                          rainfallSummary.total
                        }{" "}
                        mm
                      </p>

                    </div>

                  </div>


                  <p className="mt-4 text-sm text-slate-500">

                    Rainfall is expected on{" "}

                    <span className="font-semibold text-slate-700">
                      {
                        rainfallSummary.rainyDays
                      }
                    </span>{" "}

                    of the next 7 days.

                  </p>

                </div>


                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-amber-100 p-3 text-amber-700">

                      <Thermometer
                        size={22}
                      />

                    </div>


                    <div>

                      <p className="text-sm font-medium text-slate-500">
                        Temperature Outlook
                      </p>

                      <p className="text-2xl font-bold text-slate-900">

                        {
                          temperatureSummary?.maximum !==
                            null &&
                          temperatureSummary?.maximum !==
                            undefined
                            ? `${Math.round(
                                temperatureSummary.maximum
                              )}°C`
                            : "—"
                        }

                      </p>

                    </div>

                  </div>


                  <p className="mt-4 text-sm text-slate-500">

                    Highest forecast daytime temperature
                    over the next 7 days.

                    {temperatureSummary?.minimum !==
                      null &&
                      temperatureSummary?.minimum !==
                        undefined && (

                        <>
                          {" "}
                          Lowest expected minimum:
                          {" "}
                          <span className="font-semibold text-slate-700">
                            {
                              Math.round(
                                temperatureSummary.minimum
                              )
                            }
                            °C
                          </span>
                        </>

                      )}

                  </p>

                </div>


                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-green-100 p-3 text-green-700">

                      <Droplets
                        size={22}
                      />

                    </div>


                    <div>

                      <p className="text-sm font-medium text-slate-500">
                        Reference ET₀
                      </p>

                      <p className="text-2xl font-bold text-slate-900">
                        {
                          et0Summary
                        }{" "}
                        mm
                      </p>

                    </div>

                  </div>


                  <p className="mt-4 text-sm text-slate-500">
                    Combined reference evapotranspiration
                    over the next 7 days.
                  </p>

                </div>

              </div>


              {/* ==================================================
                  SOIL + WEATHER INTELLIGENCE
              ================================================== */}

              {loadingSoil && (

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <RefreshCw
                      size={20}
                      className="animate-spin text-green-700"
                    />

                    <div>

                      <h2 className="font-bold text-slate-900">
                        Soil + Weather Intelligence
                      </h2>

                      <p className="text-sm text-slate-500">
                        Loading the latest completed soil assessment...
                      </p>

                    </div>

                  </div>

                </div>

              )}


              {!loadingSoil &&
                soilWeatherInsight &&
                soilIntelligence && (

                  <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                      <div>

                        <div className="flex items-center gap-3">

                          <div className="rounded-xl bg-green-100 p-3 text-green-700">

                            <Sprout
                              size={22}
                            />

                          </div>


                          <div>

                            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                              Soil + Weather Intelligence
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-slate-900">
                              Field decision context
                            </h2>

                          </div>

                        </div>


                        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">

                          SoilGenie is combining the latest completed
                          soil measurements with the current weather
                          and 7-day forecast for this farm.

                        </p>

                      </div>


                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">

                        <p className="text-slate-500">
                          Latest soil test
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {
                            soilIntelligence
                              .test
                              .sample_id
                          }
                        </p>

                      </div>

                    </div>


                    {/* SOIL WEATHER METRICS */}

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                      <SoilWeatherMetric
                        label="Soil moisture"
                        value={
                          soilWeatherInsight
                            .moisture !==
                          null
                            ? `${formatNumber(
                                soilWeatherInsight.moisture
                              )}%`
                            : "—"
                        }
                        status={
                          moistureLabel(
                            soilWeatherInsight
                              .moisture
                          )
                        }
                      />


                      <SoilWeatherMetric
                        label="7-day rainfall"
                        value={`${rainfallSummary.total} mm`}
                        status={`${rainfallSummary.rainyDays} rainy day${
                          rainfallSummary.rainyDays ===
                          1
                            ? ""
                            : "s"
                        }`}
                      />


                      <SoilWeatherMetric
                        label="Irrigation"
                        value={
                          formatIrrigationType(
                            weather
                              .farm
                              .irrigation_type
                          )
                        }
                        status={
                          soilWeatherInsight
                            .rainFed
                            ? "Rain-dependent"
                            : "Managed water source"
                        }
                      />


                      <SoilWeatherMetric
                        label="Current crop guidance"
                        value={
                          soilWeatherInsight
                            .bestCrop
                        }
                        status="Latest soil screening"
                      />

                    </div>


                    {/* INSIGHTS */}

                    <div className="mt-6 grid gap-6 lg:grid-cols-2">

                      <div className="rounded-xl border bg-slate-50 p-5">

                        <div className="flex items-center gap-3">

                          <Droplets
                            size={20}
                            className="text-blue-700"
                          />

                          <h3 className="font-bold text-slate-900">
                            Water & field conditions
                          </h3>

                        </div>


                        <p className="mt-3 text-sm leading-6 text-slate-600">

                          {
                            soilWeatherInsight
                              .message
                          }

                        </p>

                      </div>


                      <div className="rounded-xl border bg-slate-50 p-5">

                        <div className="flex items-center gap-3">

                          <Sprout
                            size={20}
                            className="text-green-700"
                          />

                          <h3 className="font-bold text-slate-900">
                            Latest soil measurements
                          </h3>

                        </div>


                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">

                          <SoilValue
                            label="pH"
                            value={formatNumber(
                              soilIntelligence
                                .result
                                .ph,
                              2
                            )}
                          />


                          <SoilValue
                            label="Nitrogen"
                            value={
                              soilIntelligence
                                .result
                                .nitrogen_mg_kg !==
                              null
                                ? `${formatNumber(
                                    soilIntelligence
                                      .result
                                      .nitrogen_mg_kg
                                  )} mg/kg`
                                : "—"
                            }
                          />


                          <SoilValue
                            label="Phosphorus"
                            value={
                              soilIntelligence
                                .result
                                .phosphorus_mg_kg !==
                              null
                                ? `${formatNumber(
                                    soilIntelligence
                                      .result
                                      .phosphorus_mg_kg
                                  )} mg/kg`
                                : "—"
                            }
                          />


                          <SoilValue
                            label="Potassium"
                            value={
                              soilIntelligence
                                .result
                                .potassium_mg_kg !==
                              null
                                ? `${formatNumber(
                                    soilIntelligence
                                      .result
                                      .potassium_mg_kg
                                  )} mg/kg`
                                : "—"
                            }
                          />


                          <SoilValue
                            label="Organic matter"
                            value={
                              soilIntelligence
                                .result
                                .organic_matter_percent !==
                              null
                                ? `${formatNumber(
                                    soilIntelligence
                                      .result
                                      .organic_matter_percent
                                  )}%`
                                : "—"
                            }
                          />


                          <SoilValue
                            label="EC"
                            value={
                              soilIntelligence
                                .result
                                .electrical_conductivity_ds_m !==
                              null
                                ? `${formatNumber(
                                    soilIntelligence
                                      .result
                                      .electrical_conductivity_ds_m,
                                    2
                                  )} dS/m`
                                : "—"
                            }
                          />

                        </div>

                      </div>

                    </div>


                    {/* DISCLAIMER */}

                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

                      <div className="flex gap-3">

                        <AlertTriangle
                          size={20}
                          className="mt-0.5 shrink-0 text-amber-700"
                        />

                        <p className="text-sm leading-6 text-amber-900">

                          SoilGenie provides agricultural decision
                          support. Weather forecasts and soil measurements
                          should be considered together with local field
                          observations, crop requirements and appropriate
                          agronomic advice. The platform does not
                          automatically prescribe irrigation or fertilizer
                          rates from weather data alone.

                        </p>

                      </div>

                    </div>

                  </div>

                )}


              {!loadingSoil &&
                !soilIntelligence && (

                  <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <div className="flex gap-3">

                      <Sprout
                        size={22}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />

                      <div>

                        <h2 className="font-bold text-slate-900">
                          Soil + Weather Intelligence
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-slate-600">

                          No completed soil assessment with available
                          measurements was found for this farm. Weather
                          information remains available above.

                        </p>

                      </div>

                    </div>

                  </div>

                )}


              {/* ==================================================
                  7-DAY FORECAST
              ================================================== */}

              <div className="rounded-2xl border bg-white p-6 shadow-sm">

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    7-Day Forecast
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Weather outlook for this farm.
                  </p>

                </div>


                <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">

                  {weather.forecast.map(
                    (day) => {

                      const Icon =
                        weatherIcon(
                          day.condition
                        );

                      return (

                        <div
                          key={
                            day.date
                          }
                          className="rounded-xl border bg-slate-50 p-4"
                        >

                          <p className="font-bold text-slate-900">
                            {
                              formatDay(
                                day.date
                              )
                            }
                          </p>


                          <p className="mt-1 text-xs text-slate-500">
                            {
                              day.date
                            }
                          </p>


                          <Icon
                            size={30}
                            className="mt-4 text-green-700"
                          />


                          <p className="mt-3 min-h-[40px] text-sm font-semibold text-slate-700">
                            {
                              day.condition
                            }
                          </p>


                          <div className="mt-4 flex items-center justify-between">

                            <span className="font-bold text-slate-900">

                              {
                                day.temperature_max ??
                                "—"
                              }
                              °

                            </span>


                            <span className="text-sm text-slate-500">

                              {
                                day.temperature_min ??
                                "—"
                              }
                              °

                            </span>

                          </div>


                          <div className="mt-4 space-y-2 text-xs text-slate-500">

                            <p>
                              Rain:{" "}
                              {
                                day.rain ??
                                day.precipitation ??
                                0
                              }{" "}
                              mm
                            </p>


                            <p>
                              Rain chance:{" "}
                              {
                                day.precipitation_probability ??
                                0
                              }
                              %
                            </p>


                            <p>
                              ET₀:{" "}
                              {
                                day.et0 ??
                                "—"
                              }{" "}
                              mm
                            </p>


                            {day.wind_speed_max !==
                              null &&
                              day.wind_speed_max !==
                                undefined && (

                                <p>
                                  Wind:{" "}
                                  {
                                    day.wind_speed_max
                                  }{" "}
                                  km/h
                                </p>

                              )}

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              </div>


              {/* ==================================================
                  FARM CONTEXT
              ================================================== */}

              <div className="rounded-2xl border bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-green-100 p-3 text-green-700">

                    <Sprout
                      size={22}
                    />

                  </div>


                  <div>

                    <h2 className="font-bold text-slate-900">
                      Farm Context
                    </h2>

                    <p className="text-sm text-slate-500">
                      Weather information for this farm.
                    </p>

                  </div>

                </div>


                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  <InfoRow
                    label="Farm"
                    value={
                      weather
                        .farm
                        .farm_name
                    }
                  />


                  <InfoRow
                    label="Farm ID"
                    value={
                      weather
                        .farm
                        .farm_id
                    }
                  />


                  <InfoRow
                    label="Farm size"
                    value={`${weather.farm.farm_size} ha`}
                  />


                  <InfoRow
                    label="Farming type"
                    value={formatFarmingType(
                      weather
                        .farm
                        .farming_type
                    )}
                  />


                  <InfoRow
                    label="Irrigation"
                    value={formatIrrigationType(
                      weather
                        .farm
                        .irrigation_type
                    )}
                  />


                  <InfoRow
                    label="Primary crop"
                    value={formatCrop(
                      weather
                        .farm
                        .primary_crop
                    )}
                  />

                </div>

              </div>


              {/* ==================================================
                  SOILGENIE GUIDANCE
              ================================================== */}

              <div className="rounded-2xl border bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-amber-100 p-3 text-amber-700">

                    <AlertTriangle
                      size={22}
                    />

                  </div>


                  <div>

                    <h2 className="font-bold text-slate-900">
                      SoilGenie Guidance
                    </h2>

                    <p className="text-sm text-slate-500">
                      Weather should be interpreted with soil and crop information.
                    </p>

                  </div>

                </div>


                <p className="mt-6 max-w-4xl text-sm leading-6 text-slate-600">

                  {
                    weather
                      .agricultural_context
                      ?.weather_role ||
                    "Weather information is provided as agricultural decision support and should be considered alongside soil measurements, crop requirements, field conditions and appropriate agronomic advice."
                  }

                </p>


                <div className="mt-6 rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Farm Coordinates
                  </p>


                  <p className="mt-2 text-sm font-medium text-slate-800">

                    {
                      weather.latitude.toFixed(
                        5
                      )
                    }

                    {" , "}

                    {
                      weather.longitude.toFixed(
                        5
                      )
                    }

                  </p>

                </div>

              </div>


              {/* ==================================================
                  DISCLAIMER
              ================================================== */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex gap-3">

                  <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />

                  <p className="text-sm leading-6 text-slate-600">

                    SoilGenie weather information is provided
                    for agricultural decision support. Weather
                    forecasts can change and should be considered
                    together with verified soil measurements,
                    crop requirements, local field observations
                    and appropriate agronomic advice.

                  </p>

                </div>

              </div>

            </>

          )}

      </div>

    </DashboardLayout>

  );
}


/* ============================================================
   SOIL + WEATHER METRIC
   ============================================================ */

interface SoilWeatherMetricProps {
  label: string;
  value: string;
  status: string;
}

function SoilWeatherMetric({
  label,
  value,
  status,
}: SoilWeatherMetricProps) {

  return (

    <div className="rounded-xl border bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {
          label
        }
      </p>


      <p className="mt-2 text-xl font-bold text-slate-900">
        {
          value
        }
      </p>


      <p className="mt-1 text-xs font-medium text-green-700">
        {
          status
        }
      </p>

    </div>

  );
}


/* ============================================================
   SOIL VALUE
   ============================================================ */

interface SoilValueProps {
  label: string;
  value: string;
}

function SoilValue({
  label,
  value,
}: SoilValueProps) {

  return (

    <div>

      <p className="text-slate-500">
        {
          label
        }
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {
          value
        }
      </p>

    </div>

  );
}


/* ============================================================
   WEATHER METRIC
   ============================================================ */

interface WeatherMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function WeatherMetric({
  icon,
  label,
  value,
}: WeatherMetricProps) {

  return (

    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex items-center gap-2 text-green-700">

        {
          icon
        }

        <span className="text-sm font-semibold">
          {
            label
          }
        </span>

      </div>


      <p className="mt-4 text-2xl font-bold text-slate-900">
        {
          value
        }
      </p>

    </div>

  );
}


/* ============================================================
   INFORMATION ROW
   ============================================================ */

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({
  label,
  value,
}: InfoRowProps) {

  return (

    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">

      <span className="text-slate-500">
        {
          label
        }
      </span>


      <span className="text-right font-semibold text-slate-900">
        {
          value
        }
      </span>

    </div>

  );
}