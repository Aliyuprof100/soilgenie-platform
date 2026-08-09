import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import FarmLocationPicker from "../components/farms/FarmLocationPicker";

import { createFarm } from "../services/farms";
import type { FarmFormData } from "../services/farms";

import { getFarmers } from "../services/farmers";
import type { Farmer } from "../services/farmers";


const initialForm: FarmFormData = {
  farmer: 0,

  farm_name: "",
  farm_size: "",

  primary_crop: "",
  farming_type: "SMALLHOLDER",

  irrigation_type: "RAIN_FED",
  ownership_type: "OWNED",

  state: "",
  lga: "",
  ward: "",
  village: "",
  address: "",

  latitude: "",
  longitude: "",
  gps_accuracy: "",
};


export default function RegisterFarm() {

  const navigate = useNavigate();


  const [form, setForm] =
    useState<FarmFormData>(initialForm);


  const [farmers, setFarmers] =
    useState<Farmer[]>([]);


  const [loadingFarmers, setLoadingFarmers] =
    useState(true);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  const [success, setSuccess] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | LOAD FARMERS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function loadFarmers() {

      try {

        setLoadingFarmers(true);

        const data = await getFarmers();

        setFarmers(data);

      } catch (err) {

        console.error(
          "Unable to load farmers:",
          err
        );

        setError(
          "Unable to load farmers. Please try again."
        );

      } finally {

        setLoadingFarmers(false);

      }
    }

    loadFarmers();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | HANDLE FORM CHANGES
  |--------------------------------------------------------------------------
  */

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {

    const {
      name,
      value,
    } = e.target;


    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  }


  /*
  |--------------------------------------------------------------------------
  | HANDLE GPS LOCATION
  |--------------------------------------------------------------------------
  */

  function handleLocationChange(
    latitude: string,
    longitude: string,
    accuracy: string
  ) {

    setForm((previous) => ({
      ...previous,

      latitude,

      longitude,

      gps_accuracy: accuracy,
    }));

  }


  /*
  |--------------------------------------------------------------------------
  | SUBMIT FARM
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setError("");

    setSuccess("");


    /*
    | Validation
    */

    if (!form.farmer) {

      setError(
        "Please select the farmer."
      );

      return;
    }


    if (!form.farm_name.trim()) {

      setError(
        "Farm name is required."
      );

      return;
    }


    if (!form.farm_size) {

      setError(
        "Farm size is required."
      );

      return;
    }


    if (
      !form.state.trim() ||
      !form.lga.trim()
    ) {

      setError(
        "State and LGA are required."
      );

      return;
    }


    setLoading(true);


    try {

      const farm =
        await createFarm(form);


      setSuccess(
        `Farm registered successfully. Farm ID: ${farm.farm_id}`
      );


      setForm(initialForm);


      setTimeout(() => {

        navigate(
          `/farms/${farm.id}`
        );

      }, 1500);


    } catch (err: any) {

      console.error(
        "Farm registration error:",
        err
      );


      if (err.response?.data) {

        const data =
          err.response.data;


        if (
          typeof data === "object"
        ) {

          const messages =
            Object.entries(data)
              .map(
                ([field, message]) =>
                  `${field}: ${message}`
              )
              .join("\n");


          setError(messages);

        } else {

          setError(
            String(data)
          );

        }

      } else {

        setError(
          "Unable to register farm. Please check your connection and try again."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  return (

    <DashboardLayout>

      <div className="mx-auto max-w-6xl">


        {/* HEADER */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() =>
              navigate("/agent")
            }
            className="mb-4 text-sm font-semibold text-green-700 hover:text-green-800"
          >

            ← Back to Dashboard

          </button>


          <h1 className="text-3xl font-bold text-slate-900">

            Register Farm

          </h1>


          <p className="mt-2 text-slate-500">

            Register a farmer's farm and capture its precise GPS location.

          </p>

        </div>


        {/* SUCCESS */}

        {success && (

          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">

            {success}

          </div>

        )}


        {/* ERROR */}

        {error && (

          <div className="mb-6 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            {error}

          </div>

        )}


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border bg-white p-8 shadow-sm"
        >


          {/* FARMER */}

          <section>

            <h2 className="mb-5 text-xl font-bold text-slate-900">

              Farmer

            </h2>


            <div>

              <label className="mb-2 block text-sm font-medium">

                Select Farmer *

              </label>


              <select
                name="farmer"
                value={form.farmer}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,
                    farmer: Number(
                      e.target.value
                    ),
                  }))
                }
                disabled={loadingFarmers}
                className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
                required
              >

                <option value={0}>

                  {loadingFarmers
                    ? "Loading farmers..."
                    : "Select a farmer"}

                </option>


                {farmers.map(
                  (farmer) => (

                    <option
                      key={farmer.id}
                      value={farmer.id}
                    >

                      {farmer.first_name}{" "}
                      {farmer.last_name}{" "}
                      — {farmer.farmer_id}

                    </option>

                  )
                )}

              </select>

            </div>

          </section>


          {/* FARM INFORMATION */}

          <section>

            <h2 className="mb-5 text-xl font-bold text-slate-900">

              Farm Information

            </h2>


            <div className="grid gap-5 md:grid-cols-2">


              <div>

                <label className="mb-2 block text-sm font-medium">

                  Farm Name *

                </label>


                <input
                  name="farm_name"
                  value={form.farm_name}
                  onChange={handleChange}
                  placeholder="e.g. Haidar Farm"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  required
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">

                  Farm Size (Hectares) *

                </label>


                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="farm_size"
                  value={form.farm_size}
                  onChange={handleChange}
                  placeholder="e.g. 4.5"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  required
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">

                  Primary Crop

                </label>


                <input
                  name="primary_crop"
                  value={form.primary_crop}
                  onChange={handleChange}
                  placeholder="e.g. Millet, Maize, Rice"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">

                  Farming Type

                </label>


                <select
                  name="farming_type"
                  value={form.farming_type}
                  onChange={handleChange}
                  className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
                >

                  <option value="SMALLHOLDER">

                    Smallholder

                  </option>


                  <option value="COMMERCIAL">

                    Commercial

                  </option>


                  <option value="COOPERATIVE">

                    Cooperative

                  </option>

                </select>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">

                  Irrigation Type

                </label>


                <select
                  name="irrigation_type"
                  value={form.irrigation_type}
                  onChange={handleChange}
                  className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
                >

                  <option value="RAIN_FED">

                    Rain-fed

                  </option>


                  <option value="IRRIGATED">

                    Irrigated

                  </option>


                  <option value="MIXED">

                    Mixed

                  </option>

                </select>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">

                  Ownership Type

                </label>


                <select
                  name="ownership_type"
                  value={form.ownership_type}
                  onChange={handleChange}
                  className="w-full rounded-xl border bg-white p-3 outline-none focus:border-green-600"
                >

                  <option value="OWNED">

                    Owned

                  </option>


                  <option value="LEASED">

                    Leased

                  </option>


                  <option value="COMMUNAL">

                    Communal

                  </option>


                  <option value="FAMILY">

                    Family

                  </option>


                  <option value="OTHER">

                    Other

                  </option>

                </select>

              </div>

            </div>

          </section>


          {/* LOCATION */}

          <section>

            <h2 className="mb-5 text-xl font-bold text-slate-900">

              Farm Address

            </h2>


            <div className="grid gap-5 md:grid-cols-2">


              <div>

                <label className="mb-2 block text-sm font-medium">

                  State *

                </label>


                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Yobe"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  required
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">

                  LGA *

                </label>


                <input
                  name="lga"
                  value={form.lga}
                  onChange={handleChange}
                  placeholder="e.g. Nangere"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                  required
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">

                  Ward

                </label>


                <input
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  placeholder="Ward"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">

                  Village

                </label>


                <input
                  name="village"
                  value={form.village}
                  onChange={handleChange}
                  placeholder="Village"
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />

              </div>


              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium">

                  Address

                </label>


                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Farm address or description"
                  rows={3}
                  className="w-full rounded-xl border p-3 outline-none focus:border-green-600"
                />

              </div>

            </div>

          </section>


          {/* GPS LOCATION */}

          <section>

            <FarmLocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              gpsAccuracy={form.gps_accuracy}
              onLocationChange={
                handleLocationChange
              }
            />

          </section>


          {/* BUTTONS */}

          <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row">


            <button
              type="button"
              onClick={() =>
                navigate("/agent")
              }
              className="rounded-xl border px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >

              Cancel

            </button>


            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading
                ? "Registering Farm..."
                : "Register Farm"}

            </button>

          </div>


        </form>

      </div>

    </DashboardLayout>

  );
}