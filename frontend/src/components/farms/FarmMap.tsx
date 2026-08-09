import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import type { Farm } from "../../services/farms";


// Fix Leaflet marker icons when using Vite
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


interface FarmMapProps {
  farms: Farm[];
  selectedFarm?: Farm | null;
  onFarmSelect?: (farm: Farm) => void;
}


/*
|--------------------------------------------------------------------------
| MAP VIEW CONTROLLER
|--------------------------------------------------------------------------
*/

function MapViewController({
  farm,
}: {
  farm?: Farm | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      farm?.latitude !== null &&
      farm?.latitude !== undefined &&
      farm?.longitude !== null &&
      farm?.longitude !== undefined
    ) {
      map.flyTo(
        [
          Number(farm.latitude),
          Number(farm.longitude),
        ],
        16,
        {
          duration: 1.2,
        }
      );
    }
  }, [farm, map]);

  return null;
}


/*
|--------------------------------------------------------------------------
| FARM MAP
|--------------------------------------------------------------------------
*/

export default function FarmMap({
  farms,
  selectedFarm,
  onFarmSelect,
}: FarmMapProps) {

  const farmsWithGPS = farms.filter(
    (farm) =>
      farm.latitude !== null &&
      farm.latitude !== undefined &&
      farm.longitude !== null &&
      farm.longitude !== undefined
  );


  /*
  |--------------------------------------------------------------------------
  | DEFAULT MAP LOCATION
  |--------------------------------------------------------------------------
  |
  | Yobe State is used as the initial location because
  | SoilGenie is currently focused strongly on Northern Nigeria.
  |
  */

  const defaultCenter: [number, number] = [
    11.746,
    11.960,
  ];


  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      {/* Map Header */}

      <div className="flex flex-col gap-2 border-b p-5 md:flex-row md:items-center md:justify-between">

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            Farm Intelligence Map
          </h2>

          <p className="text-sm text-slate-500">
            GPS locations of registered SoilGenie farms.
          </p>

        </div>


        <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">

          📍 {farmsWithGPS.length} farms mapped

        </div>

      </div>


      {/* Map */}

      <div className="h-[600px] w-full">

        <MapContainer
          center={defaultCenter}
          zoom={7}
          scrollWheelZoom={true}
          className="h-full w-full"
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {/* Move map to selected farm */}

          <MapViewController
            farm={selectedFarm}
          />


          {/* Farm Markers */}

          {farmsWithGPS.map((farm) => (

            <Marker
              key={farm.id}
              position={[
                Number(farm.latitude),
                Number(farm.longitude),
              ]}
              icon={farmIcon}
              eventHandlers={{
                click: () => {
                  onFarmSelect?.(farm);
                },
              }}
            >

              <Popup>

                <div className="min-w-[220px]">

                  <h3 className="text-base font-bold text-slate-900">
                    {farm.farm_name}
                  </h3>


                  <p className="mt-1 text-sm text-slate-600">
                    {farm.farm_id}
                  </p>


                  <div className="mt-3 space-y-1 text-sm">

                    <p>
                      <strong>Farmer:</strong>{" "}
                      {farm.farmer_name}
                    </p>

                    <p>
                      <strong>Crop:</strong>{" "}
                      {farm.primary_crop || "Not specified"}
                    </p>

                    <p>
                      <strong>Size:</strong>{" "}
                      {farm.farm_size} hectares
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {farm.lga}, {farm.state}
                    </p>

                    <p>
                      <strong>GPS:</strong>{" "}
                      {Number(farm.latitude).toFixed(6)},{" "}
                      {Number(farm.longitude).toFixed(6)}
                    </p>

                    {farm.gps_accuracy !== null &&
                      farm.gps_accuracy !== undefined && (
                        <p>
                          <strong>Accuracy:</strong>{" "}
                          ±{farm.gps_accuracy} m
                        </p>
                      )}

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      window.location.href =
                        `/farms/${farm.id}`
                    }
                    className="mt-4 w-full rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
                  >
                    View Farm Profile
                  </button>

                </div>

              </Popup>

            </Marker>

          ))}

        </MapContainer>

      </div>


      {/* No GPS message */}

      {farmsWithGPS.length === 0 && (

        <div className="border-t bg-yellow-50 p-4 text-center text-sm text-yellow-800">

          No farms have GPS coordinates yet.
          Register a farm and capture its location to
          display it on the map.

        </div>

      )}

    </div>
  );
}