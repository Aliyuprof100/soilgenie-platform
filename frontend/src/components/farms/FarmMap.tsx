import { useEffect, useMemo } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl,
  ZoomControl,
} from "react-leaflet";

import { useNavigate } from "react-router-dom";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import type { Farm } from "../../services/farms";


// ============================================================================
// LEAFLET MARKER ICON
// ============================================================================

const farmIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41],
});


// ============================================================================
// SELECTED FARM ICON
// ============================================================================

const selectedFarmIcon = L.divIcon({
  className: "soilgenie-selected-farm-marker",

  html: `
    <div
      style="
        width: 44px;
        height: 44px;
        border-radius: 9999px;
        background: #15803d;
        border: 4px solid white;
        box-shadow:
          0 0 0 4px rgba(21, 128, 61, 0.25),
          0 4px 14px rgba(0, 0, 0, 0.30);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 21px;
      "
    >
      🌱
    </div>
  `,

  iconSize: [44, 44],

  iconAnchor: [22, 22],

  popupAnchor: [0, -22],
});


// ============================================================================
// NIGERIA MAP CONFIGURATION
// ============================================================================
//
// Approximate geographic bounds for Nigeria.
//
// Southwest: approximately 4.2N, 2.6E
// Northeast: approximately 13.9N, 14.7E
//
// These bounds provide a practical operating area for SoilGenie's
// Nigeria-first farm platform.
//
// ============================================================================

const NIGERIA_BOUNDS: L.LatLngBoundsExpression = [
  [4.0, 2.0],
  [14.5, 15.0],
];

const NIGERIA_CENTER: [number, number] = [
  9.08,
  8.68,
];

const NIGERIA_INITIAL_ZOOM = 6;


// ============================================================================
// PROPS
// ============================================================================

interface FarmMapProps {
  farms: Farm[];

  selectedFarm?: Farm | null;

  onFarmSelect?: (farm: Farm) => void;
}


// ============================================================================
// MAP VIEW CONTROLLER
// ============================================================================
//
// When a farm is selected from the farm table using "View on Map",
// smoothly move the map to that farm.
//
// ============================================================================

function MapViewController({
  farm,
}: {
  farm?: Farm | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      farm?.latitude === null ||
      farm?.latitude === undefined ||
      farm?.longitude === null ||
      farm?.longitude === undefined
    ) {
      return;
    }

    map.flyTo(
      [
        Number(farm.latitude),
        Number(farm.longitude),
      ],
      15,
      {
        duration: 1.2,
      }
    );
  }, [farm, map]);

  return null;
}


// ============================================================================
// MAP BOUNDS CONTROLLER
// ============================================================================
//
// Keeps the map focused on Nigeria and prevents users from dragging
// indefinitely outside SoilGenie's operating geography.
//
// ============================================================================

function NigeriaBoundsController() {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(
      NIGERIA_BOUNDS
    );

    map.options.maxBoundsViscosity = 1.0;

    return () => {
      map.setMaxBounds(undefined);
    };
  }, [map]);

  return null;
}


// ============================================================================
// FIT ALL FARMS
// ============================================================================
//
// When the map initially loads, or the visible farm collection changes,
// fit the map around the registered Nigerian farms.
//
// ============================================================================

function FarmBoundsController({
  farms,
  selectedFarm,
}: {
  farms: Farm[];

  selectedFarm?: Farm | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedFarm) {
      return;
    }

    if (!farms.length) {
      map.setView(
        NIGERIA_CENTER,
        NIGERIA_INITIAL_ZOOM
      );

      return;
    }

    if (farms.length === 1) {
      const farm = farms[0];

      if (
        farm.latitude === null ||
        farm.latitude === undefined ||
        farm.longitude === null ||
        farm.longitude === undefined
      ) {
        return;
      }

      map.setView(
        [
          Number(farm.latitude),
          Number(farm.longitude),
        ],
        13,
        {
          animate: true,
        }
      );

      return;
    }

    const coordinates = farms
      .filter(
        (farm) =>
          farm.latitude !== null &&
          farm.latitude !== undefined &&
          farm.longitude !== null &&
          farm.longitude !== undefined
      )
      .map(
        (farm) =>
          [
            Number(farm.latitude),
            Number(farm.longitude),
          ] as [number, number]
      );

    if (!coordinates.length) {
      map.setView(
        NIGERIA_CENTER,
        NIGERIA_INITIAL_ZOOM
      );

      return;
    }

    const bounds =
      L.latLngBounds(
        coordinates
      );

    map.fitBounds(
      bounds,
      {
        padding: [50, 50],
        maxZoom: 12,
        animate: true,
      }
    );
  }, [
    farms,
    selectedFarm,
    map,
  ]);

  return null;
}


// ============================================================================
// FARM MAP
// ============================================================================

export default function FarmMap({
  farms,
  selectedFarm,
  onFarmSelect,
}: FarmMapProps) {
  const navigate = useNavigate();


  // --------------------------------------------------------------------------
  // ONLY FARMS WITH GPS
  // --------------------------------------------------------------------------

  const farmsWithGPS = useMemo(
    () =>
      farms.filter(
        (farm) =>
          farm.latitude !== null &&
          farm.latitude !== undefined &&
          farm.longitude !== null &&
          farm.longitude !== undefined
      ),
    [farms]
  );


  // --------------------------------------------------------------------------
  // OPEN FARM PROFILE
  // --------------------------------------------------------------------------

  function openFarmProfile(
    farm: Farm
  ) {
    navigate(
      `/agent/farms/${farm.id}`
    );
  }


  // --------------------------------------------------------------------------
  // OPEN FARMER PROFILE
  // --------------------------------------------------------------------------

  function openFarmerProfile(
    farm: Farm
  ) {
    navigate(
      `/agent/farmers/${farm.farmer}`
    );
  }


  // --------------------------------------------------------------------------
  // OPEN GOOGLE MAPS
  // --------------------------------------------------------------------------

  function openInGoogleMaps(
    farm: Farm
  ) {
    if (
      farm.latitude === null ||
      farm.latitude === undefined ||
      farm.longitude === null ||
      farm.longitude === undefined
    ) {
      return;
    }

    const latitude =
      Number(farm.latitude);

    const longitude =
      Number(farm.longitude);

    const url =
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }


  // --------------------------------------------------------------------------
  // SELECT FARM
  // --------------------------------------------------------------------------

  function selectFarm(
    farm: Farm
  ) {
    onFarmSelect?.(farm);
  }


  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      {/* ================================================================== */}
      {/* MAP HEADER */}
      {/* ================================================================== */}

      <div className="flex flex-col gap-4 border-b bg-white p-5 md:flex-row md:items-center md:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
              🇳🇬
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                SoilGenie Nigeria Farm Intelligence Map
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                GPS locations of registered SoilGenie farms across Nigeria.
              </p>

            </div>

          </div>

        </div>


        <div className="flex flex-wrap gap-2">

          <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            📍 {farmsWithGPS.length} mapped
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
            🌱 {farms.length} registered
          </div>

        </div>

      </div>


      {/* ================================================================== */}
      {/* MAP */}
      {/* ================================================================== */}

      <div className="relative h-[600px] w-full">

        <MapContainer
          center={NIGERIA_CENTER}
          zoom={NIGERIA_INITIAL_ZOOM}
          minZoom={5}
          maxZoom={18}
          maxBounds={NIGERIA_BOUNDS}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          zoomControl={false}
          className="h-full w-full"
        >

          <ZoomControl
            position="bottomright"
          />


          {/* ================================================================ */}
          {/* BASE MAP LAYERS */}
          {/* ================================================================ */}

          <LayersControl
            position="topright"
          >

            <LayersControl.BaseLayer
              checked
              name="Standard Map"
            >

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

            </LayersControl.BaseLayer>


            <LayersControl.BaseLayer
              name="Satellite"
            >

              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />

            </LayersControl.BaseLayer>

          </LayersControl>


          {/* ================================================================ */}
          {/* MAP CONTROLLERS */}
          {/* ================================================================ */}

          <NigeriaBoundsController />


          <MapViewController
            farm={selectedFarm}
          />


          <FarmBoundsController
            farms={farmsWithGPS}
            selectedFarm={selectedFarm}
          />


          {/* ================================================================ */}
          {/* FARM MARKERS */}
          {/* ================================================================ */}

          {farmsWithGPS.map(
            (farm) => {

              const isSelected =
                selectedFarm?.id ===
                farm.id;

              return (
                <Marker
                  key={farm.id}
                  position={[
                    Number(
                      farm.latitude
                    ),
                    Number(
                      farm.longitude
                    ),
                  ]}
                  icon={
                    isSelected
                      ? selectedFarmIcon
                      : farmIcon
                  }
                  zIndexOffset={
                    isSelected
                      ? 1000
                      : 0
                  }
                  eventHandlers={{
                    click: () =>
                      selectFarm(farm),
                  }}
                >

                  <Popup
                    closeButton={true}
                    maxWidth={340}
                    minWidth={280}
                  >

                    <div className="min-w-[250px]">

                      {/* ================================================== */}
                      {/* FARM HEADER */}
                      {/* ================================================== */}

                      <div className="border-b pb-3">

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <h3 className="text-base font-bold text-slate-900">
                              {farm.farm_name}
                            </h3>

                            <p className="mt-1 text-sm font-semibold text-green-700">
                              {farm.farm_id}
                            </p>

                          </div>


                          <span
                            className={
                              farm.status ===
                              "ACTIVE"
                                ? "rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700"
                                : "rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600"
                            }
                          >
                            {farm.status}
                          </span>

                        </div>

                      </div>


                      {/* ================================================== */}
                      {/* FARM SUMMARY */}
                      {/* ================================================== */}

                      <div className="mt-4 grid grid-cols-2 gap-2">

                        <div className="rounded-lg bg-slate-50 p-3">

                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Farm Size
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-800">
                            {farm.farm_size} ha
                          </p>

                        </div>


                        <div className="rounded-lg bg-slate-50 p-3">

                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Crop
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-800">
                            {farm.primary_crop ||
                              "Not specified"}
                          </p>

                        </div>

                      </div>


                      {/* ================================================== */}
                      {/* FARM INFORMATION */}
                      {/* ================================================== */}

                      <div className="mt-4 space-y-2 text-sm text-slate-600">

                        <p>
                          <strong className="text-slate-800">
                            Farmer:
                          </strong>{" "}
                          {farm.farmer_name ||
                            "Not available"}
                        </p>


                        <p>
                          <strong className="text-slate-800">
                            Location:
                          </strong>{" "}
                          {farm.lga},{" "}
                          {farm.state}
                        </p>


                        <p>
                          <strong className="text-slate-800">
                            Farming Type:
                          </strong>{" "}
                          {formatValue(
                            farm.farming_type
                          )}
                        </p>


                        <p>
                          <strong className="text-slate-800">
                            Irrigation:
                          </strong>{" "}
                          {formatValue(
                            farm.irrigation_type
                          )}
                        </p>


                        <p>
                          <strong className="text-slate-800">
                            Ownership:
                          </strong>{" "}
                          {formatValue(
                            farm.ownership_type
                          )}
                        </p>

                      </div>


                      {/* ================================================== */}
                      {/* GPS INFORMATION */}
                      {/* ================================================== */}

                      <div className="mt-4 rounded-lg bg-slate-50 p-3">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          GPS Coordinates
                        </p>


                        <p className="mt-1 text-sm font-semibold text-slate-800">

                          {Number(
                            farm.latitude
                          ).toFixed(6)}

                          {", "}

                          {Number(
                            farm.longitude
                          ).toFixed(6)}

                        </p>


                        {farm.gps_accuracy !==
                          null &&
                          farm.gps_accuracy !==
                            undefined && (

                            <p className="mt-1 text-xs text-slate-500">
                              Accuracy: ±
                              {
                                farm.gps_accuracy
                              }{" "}
                              m
                            </p>

                          )}

                      </div>


                      {/* ================================================== */}
                      {/* ACTIONS */}
                      {/* ================================================== */}

                      <div className="mt-4 space-y-2">

                        <button
                          type="button"
                          onClick={() =>
                            openFarmProfile(
                              farm
                            )
                          }
                          className="w-full rounded-lg bg-green-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                        >
                          View Farm Profile →
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            openFarmerProfile(
                              farm
                            )
                          }
                          className="w-full rounded-lg border border-green-200 px-3 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                        >
                          View Farmer Profile
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            openInGoogleMaps(
                              farm
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          📍 Open in Google Maps
                        </button>

                      </div>

                    </div>

                  </Popup>

                </Marker>
              );
            }
          )}

        </MapContainer>


        {/* ================================================================== */}
        {/* MAP LEGEND */}
        {/* ================================================================== */}

        {farmsWithGPS.length >
          0 && (

          <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] hidden rounded-xl border bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:block">

            <p className="text-xs font-semibold text-slate-800">
              🇳🇬 Nigeria Farm Coverage
            </p>

            <div className="mt-2 space-y-1 text-[11px] text-slate-500">

              <div className="flex items-center gap-2">

                <span className="h-3 w-3 rounded-full bg-green-700" />

                Selected farm

              </div>


              <div className="flex items-center gap-2">

                <span className="h-3 w-3 rounded-full bg-slate-400" />

                Registered farm

              </div>

            </div>

          </div>

        )}


        {/* ================================================================== */}
        {/* NO GPS MESSAGE */}
        {/* ================================================================== */}

        {farmsWithGPS.length ===
          0 && (

          <div className="absolute inset-x-4 bottom-4 z-[1000] rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-lg">

            <div className="flex items-start gap-3">

              <div className="text-xl">
                📍
              </div>

              <div>

                <p className="font-semibold text-yellow-900">
                  No farm GPS locations available
                </p>

                <p className="mt-1 text-sm leading-5 text-yellow-800">
                  Register a farm and capture
                  its GPS coordinates to display
                  it on the SoilGenie Nigeria Farm
                  Intelligence Map.
                </p>

              </div>

            </div>

          </div>

        )}

      </div>


      {/* ================================================================== */}
      {/* MAP FOOTER */}
      {/* ================================================================== */}

      <div className="border-t bg-slate-50 px-5 py-4">

        <div className="flex flex-col justify-between gap-2 text-xs text-slate-500 sm:flex-row sm:items-center">

          <p>
            Select a farm marker or use
            "View on Map" from the farm registry
            to inspect a farm.
          </p>


          <p>
            Nigeria operating geography
          </p>

        </div>

      </div>

    </div>
  );
}


// ============================================================================
// VALUE FORMATTER
// ============================================================================

function formatValue(
  value?: string | null
) {
  if (!value) {
    return "Not specified";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}