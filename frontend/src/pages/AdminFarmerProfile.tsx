import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import api from "../api/api";


/* ============================================================
   TYPES
============================================================ */

interface Farmer {
  id: number;
  farmer_id: string;

  registered_by: number;
  registered_by_name: string;

  user_id?: string | null;
  user_email?: string | null;
  has_user_account?: boolean;

  first_name: string;
  last_name: string;

  phone_number: string;
  alternative_phone?: string | null;
  email?: string | null;

  gender: string;
  date_of_birth?: string | null;

  state: string;
  lga: string;
  ward?: string | null;
  village?: string | null;
  address?: string | null;

  primary_crop?: string | null;

  farm_size?: number | string | null;

  number_of_farms: number;

  farming_type: string;

  status: string;

  created_at: string;
  updated_at: string;
}


interface Farm {
  id: number;
  farm_id: string;

  farmer: number;
  farmer_name: string;

  registered_by: number;
  registered_by_name: string;

  farm_name: string;

  farm_size: number | string;

  primary_crop?: string | null;

  farming_type: string;

  irrigation_type: string;

  ownership_type: string;

  state: string;
  lga: string;
  ward?: string | null;
  village?: string | null;
  address?: string | null;

  latitude?: number | string | null;
  longitude?: number | string | null;
  gps_accuracy?: number | string | null;

  status: string;

  created_at: string;
  updated_at: string;
}


/* ============================================================
   HELPERS
============================================================ */

function formatDate(
  value?: string | null,
  includeTime = false
): string {

  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(includeTime
        ? {
            hour: "2-digit",
            minute: "2-digit",
          }
        : {}),
    }
  );
}


function formatGender(
  value?: string | null
): string {

  if (!value) {
    return "—";
  }

  const labels: Record<
    string,
    string
  > = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
  };

  return labels[value] ?? value;
}


function formatFarmingType(
  value?: string | null
): string {

  if (!value) {
    return "—";
  }

  const labels: Record<
    string,
    string
  > = {
    SMALLHOLDER: "Smallholder",
    COMMERCIAL: "Commercial",
    COOPERATIVE: "Cooperative",
  };

  return labels[value] ?? value;
}


function formatIrrigation(
  value?: string | null
): string {

  if (!value) {
    return "—";
  }

  const labels: Record<
    string,
    string
  > = {
    RAIN_FED: "Rain-fed",
    IRRIGATED: "Irrigated",
    MIXED: "Mixed",
  };

  return labels[value] ?? value;
}


function formatOwnership(
  value?: string | null
): string {

  if (!value) {
    return "—";
  }

  const labels: Record<
    string,
    string
  > = {
    OWNED: "Owned",
    LEASED: "Leased",
    COMMUNAL: "Communal",
    FAMILY: "Family",
    OTHER: "Other",
  };

  return labels[value] ?? value;
}


function formatStatus(
  value?: string | null
): string {

  if (!value) {
    return "Unknown";
  }

  return (
    value.charAt(0) +
    value.slice(1).toLowerCase()
  );
}


function initials(
  firstName = "",
  lastName = ""
): string {

  const first =
    firstName.trim().charAt(0);

  const last =
    lastName.trim().charAt(0);

  return (
    `${first}${last}`.toUpperCase() ||
    "F"
  );
}


function InfoItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | number | null;
  fullWidth?: boolean;
}) {

  return (
    <div
      className={
        fullWidth
          ? "sm:col-span-2"
          : ""
      }
    >

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value === null ||
        value === undefined ||
        value === ""
          ? "—"
          : value}
      </p>

    </div>
  );
}


function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}

      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>

    </section>
  );
}


/* ============================================================
   FARM CARD
============================================================ */

function FarmCard({
  farm,
  onView,
}: {
  farm: Farm;
  onView: () => void;
}) {

  const active =
    farm.status === "ACTIVE";

  const hasGPS =
    farm.latitude !== null &&
    farm.latitude !== undefined &&
    farm.longitude !== null &&
    farm.longitude !== undefined;

  const location = [
    farm.village,
    farm.ward,
    farm.lga,
    farm.state,
  ]
    .filter(Boolean)
    .join(", ");


  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-green-200 hover:shadow-md">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <div className="flex items-center gap-2">

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg">
              🌱
            </span>

            <div>

              <h3 className="font-bold text-slate-900">
                {farm.farm_name}
              </h3>

              <p className="font-mono text-xs text-slate-500">
                {farm.farm_id}
              </p>

            </div>

          </div>

        </div>


        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
            active
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >

          <span
            className={`h-2 w-2 rounded-full ${
              active
                ? "bg-green-600"
                : "bg-slate-400"
            }`}
          />

          {formatStatus(
            farm.status
          )}

        </span>

      </div>


      {/* Main stats */}

      <div className="mt-5 grid grid-cols-2 gap-4 border-y border-slate-100 py-4 sm:grid-cols-4">

        <div>

          <p className="text-xs text-slate-400">
            Farm Size
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {farm.farm_size} ha
          </p>

        </div>


        <div>

          <p className="text-xs text-slate-400">
            Primary Crop
          </p>

          <p className="mt-1 truncate font-bold text-slate-900">
            {farm.primary_crop || "—"}
          </p>

        </div>


        <div>

          <p className="text-xs text-slate-400">
            Irrigation
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {formatIrrigation(
              farm.irrigation_type
            )}
          </p>

        </div>


        <div>

          <p className="text-xs text-slate-400">
            Ownership
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {formatOwnership(
              farm.ownership_type
            )}
          </p>

        </div>

      </div>


      {/* Location */}

      <div className="space-y-2">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Location
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {location || "—"}
          </p>

        </div>


        <div className="flex flex-wrap gap-2">

          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {formatFarmingType(
              farm.farming_type
            )}
          </span>


          {hasGPS ? (
            <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              📍 GPS available
            </span>
          ) : (
            <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              GPS unavailable
            </span>
          )}

        </div>

      </div>


      {/* Footer */}

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-xs text-slate-400">
          Registered{" "}
          {formatDate(
            farm.created_at
          )}
        </p>


        <button
          type="button"
          onClick={onView}
          className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          View Farm
        </button>

      </div>

    </article>
  );
}


/* ============================================================
   MAIN PAGE
============================================================ */

export default function AdminFarmerProfile() {

  const navigate =
    useNavigate();

  const { id } =
    useParams();


  const [farmer, setFarmer] =
    useState<Farmer | null>(null);

  const [farms, setFarms] =
    useState<Farm[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [farmsLoading, setFarmsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [farmsError, setFarmsError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);


  /* ============================================================
     LOAD FARMER
  ============================================================ */

  async function loadFarmer() {

    if (!id) {

      setError(
        "No farmer ID was provided."
      );

      setLoading(false);

      return;
    }


    try {

      setError("");

      const response =
        await api.get(
          `/farmers/${id}/`
        );

      setFarmer(
        response.data
      );

    } catch (err: any) {

      console.error(
        "Error loading farmer:",
        err
      );


      if (
        err?.response?.status === 404
      ) {

        setError(
          "The farmer could not be found."
        );

      } else if (
        err?.response?.status === 403
      ) {

        setError(
          "You do not have permission to view this farmer."
        );

      } else {

        setError(
          "Unable to load the farmer profile."
        );
      }

    } finally {

      setLoading(false);
    }
  }


  /* ============================================================
     LOAD FARMS
  ============================================================ */

  async function loadFarms() {

    if (!id) {
      return;
    }


    try {

      setFarmsError("");

      const response =
        await api.get(
          "/farms/"
        );


      const data =
        Array.isArray(
          response.data
        )
          ? response.data
          : response.data?.results ?? [];


      const farmerId =
        Number(id);


      const farmerFarms =
        data.filter(
          (farm: Farm) =>
            Number(farm.farmer) ===
            farmerId
        );


      setFarms(
        farmerFarms
      );

    } catch (err) {

      console.error(
        "Error loading farmer farms:",
        err
      );

      setFarmsError(
        "Unable to load this farmer's farm records."
      );

    } finally {

      setFarmsLoading(false);
    }
  }


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadFarmer();
    loadFarms();

  }, [id]);


  /* ============================================================
     REFRESH
  ============================================================ */

  async function handleRefresh() {

    setRefreshing(true);

    setLoading(true);
    setFarmsLoading(true);

    await Promise.all([
      loadFarmer(),
      loadFarms(),
    ]);

    setRefreshing(false);
  }


  /* ============================================================
     DERIVED FARM DATA
  ============================================================ */

  const totalFarmArea =
    useMemo(() => {

      return farms.reduce(
        (
          total,
          farm
        ) =>
          total +
          Number(
            farm.farm_size || 0
          ),
        0
      );

    }, [farms]);


  const farmerName =
    farmer
      ? `${farmer.first_name} ${farmer.last_name}`.trim()
      : "Farmer";


  const fullLocation =
    farmer
      ? [
          farmer.village,
          farmer.ward,
          farmer.lga,
          farmer.state,
        ]
          .filter(Boolean)
          .join(", ")
      : "—";


  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (loading) {

    return (
      <DashboardLayout>

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-700" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading farmer profile...
            </p>

          </div>

        </div>

      </DashboardLayout>
    );
  }


  /* ============================================================
     ERROR STATE
  ============================================================ */

  if (error || !farmer) {

    return (
      <DashboardLayout>

        <div className="space-y-5">

          <Link
            to="/admin/farmers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
          >
            ← Back to Farmer Management
          </Link>


          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <h1 className="text-lg font-bold text-red-800">
              Unable to load farmer
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error ||
                "The requested farmer profile is unavailable."}
            </p>


            <button
              type="button"
              onClick={handleRefresh}
              className="mt-5 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try Again
            </button>

          </div>

        </div>

      </DashboardLayout>
    );
  }


  const active =
    farmer.status === "ACTIVE";


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <DashboardLayout>

      <div className="space-y-6 pb-10">

        {/* ======================================================
            TOP ACTIONS
        ====================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <Link
              to="/admin/farmers"
              className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
            >
              ← Back to Farmer Management
            </Link>

            <p className="mt-2 text-sm text-slate-500">
              Administrator • Farmer Profile
            </p>

          </div>


          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
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
              : "Refresh"}

          </button>

        </div>


        {/* ======================================================
            FARMER HERO
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 px-5 py-7 sm:px-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold text-white ring-1 ring-white/30 sm:h-20 sm:w-20 sm:text-2xl">
                  {initials(
                    farmer.first_name,
                    farmer.last_name
                  )}
                </div>


                <div>

                  <p className="text-sm font-medium text-green-100">
                    SoilGenie Farmer
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    {farmerName}
                  </h1>

                  <p className="mt-1 font-mono text-sm text-green-100">
                    {farmer.farmer_id}
                  </p>

                </div>

              </div>


              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                  active
                    ? "bg-white text-green-800"
                    : "bg-slate-900/30 text-white"
                }`}
              >

                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    active
                      ? "bg-green-600"
                      : "bg-slate-300"
                  }`}
                />

                {formatStatus(
                  farmer.status
                )}

              </span>

            </div>

          </div>


          {/* Summary */}

          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">

            <div className="px-5 py-4 sm:px-6">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Registered By
              </p>

              <p className="mt-1 truncate text-sm font-bold text-slate-800">
                {farmer.registered_by_name ||
                  "—"}
              </p>

            </div>


            <div className="px-5 py-4 sm:px-6">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Registered
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {formatDate(
                  farmer.created_at
                )}
              </p>

            </div>


            <div className="px-5 py-4 sm:px-6">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Actual Farms
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {farmsLoading
                  ? "..."
                  : farms.length}
              </p>

            </div>


            <div className="px-5 py-4 sm:px-6">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Actual Farm Area
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {farmsLoading
                  ? "..."
                  : `${totalFarmArea.toFixed(
                      2
                    )} ha`}
              </p>

            </div>

          </div>

        </section>


        {/* ======================================================
            PERSONAL INFORMATION
        ====================================================== */}

        <SectionCard
          title="Personal Information"
          description="Core identity and contact information."
        >

          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">

            <InfoItem
              label="First Name"
              value={
                farmer.first_name
              }
            />

            <InfoItem
              label="Last Name"
              value={
                farmer.last_name
              }
            />

            <InfoItem
              label="Gender"
              value={formatGender(
                farmer.gender
              )}
            />

            <InfoItem
              label="Date of Birth"
              value={formatDate(
                farmer.date_of_birth
              )}
            />

            <InfoItem
              label="Primary Phone"
              value={
                farmer.phone_number
              }
            />

            <InfoItem
              label="Alternative Phone"
              value={
                farmer.alternative_phone
              }
            />

            <InfoItem
              label="Email Address"
              value={
                farmer.email
              }
            />

          </div>

        </SectionCard>


        {/* ======================================================
            LOCATION
        ====================================================== */}

        <SectionCard
          title="Location & Community"
          description="Registered farmer location."
        >

          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">

            <InfoItem
              label="State"
              value={
                farmer.state
              }
            />

            <InfoItem
              label="LGA"
              value={
                farmer.lga
              }
            />

            <InfoItem
              label="Ward"
              value={
                farmer.ward
              }
            />

            <InfoItem
              label="Village / Community"
              value={
                farmer.village
              }
            />

            <InfoItem
              label="Full Location"
              value={
                fullLocation
              }
              fullWidth
            />

            <InfoItem
              label="Address"
              value={
                farmer.address
              }
              fullWidth
            />

          </div>

        </SectionCard>


        {/* ======================================================
            FARMING PROFILE
        ====================================================== */}

        <SectionCard
          title="Farming Profile"
          description="Farmer-level agricultural information."
        >

          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">

            <InfoItem
              label="Primary Crop"
              value={
                farmer.primary_crop
              }
            />

            <InfoItem
              label="Farming Type"
              value={formatFarmingType(
                farmer.farming_type
              )}
            />

            <InfoItem
              label="Declared Farm Size"
              value={
                farmer.farm_size !==
                  null &&
                farmer.farm_size !==
                  undefined &&
                farmer.farm_size !==
                  ""
                  ? `${farmer.farm_size} hectares`
                  : "—"
              }
            />

            <InfoItem
              label="Declared Number of Farms"
              value={
                farmer.number_of_farms
              }
            />

          </div>

        </SectionCard>


        {/* ======================================================
            FARM PORTFOLIO
        ====================================================== */}

        <section>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Registered Farms
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Actual farm records linked to this farmer.
              </p>

            </div>


            {!farmsLoading &&
              !farmsError &&
              farms.length > 0 && (
                <div className="flex gap-2">

                  <span className="rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                    {farms.length}{" "}
                    {farms.length ===
                    1
                      ? "farm"
                      : "farms"}
                  </span>

                  <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    {totalFarmArea.toFixed(
                      2
                    )} ha
                  </span>

                </div>
              )}

          </div>


          {/* Farm loading */}

          {farmsLoading && (

            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-green-700" />

              <p className="mt-3 text-sm text-slate-500">
                Loading farm records...
              </p>

            </div>

          )}


          {/* Farm error */}

          {!farmsLoading &&
            farmsError && (

              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

                <p className="font-semibold text-red-800">
                  Unable to load farm records
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {farmsError}
                </p>

                <button
                  type="button"
                  onClick={loadFarms}
                  className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                >
                  Try Again
                </button>

              </div>
            )}


          {/* No farms */}

          {!farmsLoading &&
            !farmsError &&
            farms.length === 0 && (

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                  🌾
                </div>

                <h3 className="mt-4 font-bold text-slate-800">
                  No farm records found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  There are currently no Farm records
                  linked to this farmer.
                </p>

              </div>
            )}


          {/* Farm cards */}

          {!farmsLoading &&
            !farmsError &&
            farms.length > 0 && (

              <div className="grid gap-4 lg:grid-cols-2">

                {farms.map(
                  (farm) => (
                    <FarmCard
                      key={farm.id}
                      farm={farm}
                      onView={() =>
                        navigate(
                          `/admin/farms/${farm.id}`
                        )
                      }
                    />
                  )
                )}

              </div>
            )}

        </section>


        {/* ======================================================
            SOILGENIE ACCOUNT
        ====================================================== */}

        <SectionCard
          title="SoilGenie Account"
          description="Information about the farmer's own platform account."
        >

          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account Status
              </p>

              <div className="mt-2">

                {farmer.has_user_account ? (

                  <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    Account Linked
                  </span>

                ) : (

                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    No Login Account
                  </span>

                )}

              </div>

            </div>


            <InfoItem
              label="Account Email"
              value={
                farmer.user_email
              }
            />


            <InfoItem
              label="Account ID"
              value={
                farmer.user_id
              }
            />

          </div>

        </SectionCard>


        {/* ======================================================
            AUDIT
        ====================================================== */}

        <SectionCard
          title="Registration & Record History"
          description="Administrative record information."
        >

          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">

            <InfoItem
              label="SoilGenie Farmer ID"
              value={
                farmer.farmer_id
              }
            />

            <InfoItem
              label="Registered By"
              value={
                farmer.registered_by_name
              }
            />

            <InfoItem
              label="Created"
              value={formatDate(
                farmer.created_at,
                true
              )}
            />

            <InfoItem
              label="Last Updated"
              value={formatDate(
                farmer.updated_at,
                true
              )}
            />

          </div>

        </SectionCard>


        {/* ======================================================
            FOOTER ACTIONS
        ====================================================== */}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">

          <Link
            to="/admin/farmers"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ← Back to Farmer Management
          </Link>


          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-800 disabled:opacity-60"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh Farmer Data"}
          </button>

        </div>

      </div>

    </DashboardLayout>
  );
}