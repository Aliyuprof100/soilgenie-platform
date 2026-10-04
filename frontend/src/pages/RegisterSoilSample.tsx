import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  createSoilSample,
  getSamplingZones,
} from "../services/soil";

import type {
  SamplingZone,
  CreateSoilSamplePayload,
} from "../services/soil";

import { getFarms } from "../services/farms";
import type { Farm } from "../services/farms";


function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


export default function RegisterSoilSample() {
  const navigate = useNavigate();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [zones, setZones] = useState<SamplingZone[]>([]);

  const [farmId, setFarmId] = useState("");
  const [zoneId, setZoneId] = useState("");

  const [collectionMethod, setCollectionMethod] =
    useState<"MANUAL" | "SENSOR" | "LAB">("MANUAL");

  const [collectionDate, setCollectionDate] =
    useState(getTodayDate());

  const [depth, setDepth] = useState("");

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [gpsAccuracy, setGpsAccuracy] =
    useState<number | null>(null);

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);

  const [loadingZones, setLoadingZones] =
    useState(false);

  const [capturingGPS, setCapturingGPS] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState<string | null>(null);


  /*
   * Extract a useful error message from
   * Axios / Django REST Framework responses.
   */

  function getApiErrorMessage(err: any): string {
    console.error(
      "Full SoilGenie API error:",
      err
    );

    const responseData =
      err?.response?.data;

    /*
     * No response from server
     */

    if (!responseData) {
      if (err?.message) {
        return err.message;
      }

      return (
        "Unable to connect to the SoilGenie server. " +
        "Please check that the backend server is running."
      );
    }

    /*
     * Django REST Framework detail message
     */

    if (
      typeof responseData.detail ===
      "string"
    ) {
      return responseData.detail;
    }

    /*
     * String response
     */

    if (
      typeof responseData === "string"
    ) {
      return responseData;
    }

    /*
     * Field validation errors
     */

    if (
      typeof responseData === "object"
    ) {
      const messages: string[] = [];

      Object.entries(responseData).forEach(
        ([field, value]) => {
          if (Array.isArray(value)) {
            messages.push(
              `${field}: ${value.join(", ")}`
            );
          } else if (
            typeof value === "string"
          ) {
            messages.push(
              `${field}: ${value}`
            );
          } else {
            messages.push(
              `${field}: ${JSON.stringify(
                value
              )}`
            );
          }
        }
      );

      if (messages.length > 0) {
        return messages.join(" | ");
      }
    }

    return (
      "The SoilGenie server rejected the request. " +
      "Please check the information and try again."
    );
  }


  /*
   * Load farms
   */

  useEffect(() => {
    async function loadFarms() {
      try {
        setLoading(true);
        setError("");

        const data = await getFarms();

        setFarms(data);
      } catch (err) {
        console.error(
          "Unable to load farms:",
          err
        );

        setError(
          getApiErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    }

    loadFarms();
  }, []);


  /*
   * Load sampling zones whenever farm changes
   */

  useEffect(() => {
    async function loadZones() {
      if (!farmId) {
        setZones([]);
        setZoneId("");
        return;
      }

      try {
        setLoadingZones(true);
        setError("");

        const data =
          await getSamplingZones(
            Number(farmId)
          );

        setZones(data);
        setZoneId("");
      } catch (err) {
        console.error(
          "Unable to load sampling zones:",
          err
        );

        setError(
          getApiErrorMessage(err)
        );
      } finally {
        setLoadingZones(false);
      }
    }

    loadZones();
  }, [farmId]);


  /*
   * Capture GPS
   */

  function captureGPS() {
    if (!navigator.geolocation) {
      setError(
        "GPS is not supported by this browser."
      );

      return;
    }

    setCapturingGPS(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(
          position.coords.latitude
        );

        setLongitude(
          position.coords.longitude
        );

        setGpsAccuracy(
          position.coords.accuracy
        );

        setCapturingGPS(false);
      },
      (gpsError) => {
        console.error(
          "GPS error:",
          gpsError
        );

        setError(
          "Unable to capture GPS location. " +
          "Please allow location access and try again."
        );

        setCapturingGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }


  /*
   * Submit sample
   */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(null);

    /*
     * Validate farm
     */

    if (!farmId) {
      setError(
        "Please select a farm."
      );

      return;
    }

    /*
     * Validate collection date
     */

    if (!collectionDate) {
      setError(
        "Please select the collection date."
      );

      return;
    }

    /*
     * Do not allow a future collection date.
     */

    if (collectionDate > getTodayDate()) {
      setError(
        "Collection date cannot be in the future."
      );

      return;
    }

    /*
     * Validate depth
     */

    if (!depth) {
      setError(
        "Please enter the sampling depth."
      );

      return;
    }

    const depthValue =
      Number(depth);

    if (
      Number.isNaN(depthValue) ||
      depthValue <= 0
    ) {
      setError(
        "Sampling depth must be greater than 0 cm."
      );

      return;
    }

    try {
      setSaving(true);

      const payload: CreateSoilSamplePayload = {
        farm: Number(farmId),

        sampling_zone: zoneId
          ? Number(zoneId)
          : null,

        collection_method:
          collectionMethod,

        collection_date:
          collectionDate,

        sampling_depth_cm:
          depthValue,

        latitude,
        longitude,

        gps_accuracy:
          gpsAccuracy,

        notes:
          notes.trim() || null,
      };

      console.log(
        "Submitting SoilGenie soil sample:",
        payload
      );

      const sample =
        await createSoilSample(
          payload
        );

      console.log(
        "Soil sample successfully registered:",
        sample
      );

      setSuccess(
        sample.sample_id
      );
    } catch (err) {
      console.error(
        "Unable to create soil sample:",
        err
      );

      /*
       * Show the actual backend error.
       */

      setError(
        getApiErrorMessage(err)
      );
    } finally {
      setSaving(false);
    }
  }


  /*
   * GPS accuracy helpers
   */

  const gpsIsPoor =
    gpsAccuracy !== null &&
    gpsAccuracy > 100;

  const gpsIsVeryPoor =
    gpsAccuracy !== null &&
    gpsAccuracy > 1000;


  /*
   * Success screen
   */

  if (success) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>

            <h1 className="mt-5 text-2xl font-bold text-green-900">
              Soil Sample Registered
            </h1>

            <p className="mt-3 text-green-800">
              The soil sample has been
              successfully registered in
              SoilGenie.
            </p>

            <div className="mt-6 rounded-xl bg-white p-5">

              <p className="text-sm text-slate-500">
                Sample ID
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700">
                {success}
              </p>

            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/agent/soil/samples"
                  )
                }
                className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
              >
                View Soil Samples
              </button>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Register Another
              </button>

            </div>

          </div>

        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-4xl space-y-8">

        {/* Header */}

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
            Register Soil Sample
          </h1>

          <p className="mt-2 text-slate-500">
            Record a soil sample collected
            from a registered SoilGenie farm.
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

            <div className="flex items-start gap-3">

              <div className="mt-0.5 text-lg">
                ⚠️
              </div>

              <div>
                <p className="font-semibold">
                  Soil sample registration
                  failed
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>

            </div>

          </div>
        )}


        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* Farm */}

          <section className="rounded-2xl border bg-white p-8 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              1. Farm & Sampling Zone
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select where the soil sample
              is being collected.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Farm *
                </label>

                <select
                  value={farmId}
                  onChange={(event) =>
                    setFarmId(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
                  required
                >

                  <option value="">
                    {loading
                      ? "Loading farms..."
                      : "Select farm"}
                  </option>

                  {farms.map((farm) => (
                    <option
                      key={farm.id}
                      value={farm.id}
                    >
                      {farm.farm_id} —{" "}
                      {farm.farm_name}
                    </option>
                  ))}

                </select>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Sampling Zone
                </label>

                <select
                  value={zoneId}
                  onChange={(event) =>
                    setZoneId(
                      event.target.value
                    )
                  }
                  disabled={
                    !farmId ||
                    loadingZones
                  }
                  className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
                >

                  <option value="">
                    {!farmId
                      ? "Select a farm first"
                      : loadingZones
                      ? "Loading zones..."
                      : zones.length === 0
                      ? "No sampling zones available"
                      : "Select sampling zone"}
                  </option>

                  {zones.map((zone) => (
                    <option
                      key={zone.id}
                      value={zone.id}
                    >
                      {zone.name}
                    </option>
                  ))}

                </select>

              </div>

            </div>

          </section>


          {/* Collection */}

          <section className="rounded-2xl border bg-white p-8 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              2. Sample Collection
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record when and how the soil
              sample was collected.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-3">

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Collection Date *
                </label>

                <input
                  type="date"
                  value={collectionDate}
                  max={getTodayDate()}
                  onChange={(event) =>
                    setCollectionDate(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
                  required
                />

                <p className="mt-2 text-xs text-slate-500">
                  Defaults to today's date.
                  Change it if the sample was
                  collected earlier.
                </p>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Collection Method *
                </label>

                <select
                  value={collectionMethod}
                  onChange={(event) =>
                    setCollectionMethod(
                      event.target.value as
                        | "MANUAL"
                        | "SENSOR"
                        | "LAB"
                    )
                  }
                  className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
                >

                  <option value="MANUAL">
                    Manual Collection
                  </option>

                  <option value="SENSOR">
                    SoilGenie Sensor
                  </option>

                  <option value="LAB">
                    Laboratory Collection
                  </option>

                </select>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Sampling Depth (cm) *
                </label>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={depth}
                  onChange={(event) =>
                    setDepth(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 20"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  required
                />

              </div>

            </div>

          </section>


          {/* GPS */}

          <section className="rounded-2xl border bg-white p-8 shadow-sm">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  3. GPS Location
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Capture the location where
                  the sample was collected.
                </p>

              </div>

              <button
                type="button"
                onClick={captureGPS}
                disabled={capturingGPS}
                className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {capturingGPS
                  ? "Capturing..."
                  : latitude !== null
                  ? "📍 Recapture GPS"
                  : "📍 Capture GPS"}
              </button>

            </div>


            {latitude !== null &&
            longitude !== null ? (

              <>
                <div className="mt-6 grid gap-4 md:grid-cols-3">

                  <div className="rounded-xl bg-slate-50 p-5">

                    <p className="text-sm text-slate-500">
                      Latitude
                    </p>

                    <p className="mt-2 font-bold text-slate-900">
                      {latitude.toFixed(7)}
                    </p>

                  </div>


                  <div className="rounded-xl bg-slate-50 p-5">

                    <p className="text-sm text-slate-500">
                      Longitude
                    </p>

                    <p className="mt-2 font-bold text-slate-900">
                      {longitude.toFixed(7)}
                    </p>

                  </div>


                  <div className="rounded-xl bg-slate-50 p-5">

                    <p className="text-sm text-slate-500">
                      Accuracy
                    </p>

                    <p
                      className={
                        gpsIsPoor
                          ? "mt-2 font-bold text-amber-700"
                          : "mt-2 font-bold text-green-700"
                      }
                    >
                      {gpsAccuracy !== null
                        ? `±${gpsAccuracy.toFixed(
                            1
                          )} m`
                        : "Unavailable"}
                    </p>

                  </div>

                </div>


                {gpsIsPoor && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">

                    <p className="font-semibold">
                      ⚠️ Low GPS accuracy
                    </p>

                    <p className="mt-1">
                      {gpsIsVeryPoor
                        ? "The captured location is extremely imprecise and should not be treated as the exact sampling point. Try again outdoors on a GPS-enabled device, or continue without relying on this coordinate for precise field-level decisions."
                        : "The captured location has low accuracy. Consider recapturing the GPS outdoors before using this coordinate as the precise sampling point."}
                    </p>

                  </div>
                )}

              </>

            ) : (

              <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-800">
                GPS has not been captured
                yet. You can capture it now
                or continue without GPS.
              </div>

            )}

          </section>


          {/* Notes */}

          <section className="rounded-2xl border bg-white p-8 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              4. Notes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record useful observations
              about the soil or sampling
              conditions.
            </p>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              rows={5}
              placeholder="Add observations about the soil, field conditions, crop condition, sampling process, etc."
              className="mt-4 w-full rounded-xl border p-4 outline-none focus:border-green-600"
            />

          </section>


          {/* Submit */}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() =>
                navigate("/agent")
              }
              disabled={saving}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loading ||
                !farmId ||
                !collectionDate
              }
              className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Registering Sample..."
                : "Register Soil Sample"}
            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}