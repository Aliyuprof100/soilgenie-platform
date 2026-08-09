import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";


// Fix Leaflet marker icons when using Vite
const markerIcon = new L.Icon({
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


interface FarmLocationPickerProps {
  latitude: string;
  longitude: string;
  gpsAccuracy: string;

  onLocationChange: (
    latitude: string,
    longitude: string,
    accuracy: string
  ) => void;
}


// Recenter map when coordinates change
function MapRecenter({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 16);
  }, [latitude, longitude, map]);

  return null;
}


// Allow the agent to click anywhere on the map
function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (
    latitude: string,
    longitude: string,
    accuracy: string
  ) => void;
}) {
  useMapEvents({
    click(event) {
      const latitude = event.latlng.lat.toFixed(7);
      const longitude = event.latlng.lng.toFixed(7);

      onLocationChange(
        latitude,
        longitude,
        ""
      );
    },
  });

  return null;
}


export default function FarmLocationPicker({
  latitude,
  longitude,
  gpsAccuracy,
  onLocationChange,
}: FarmLocationPickerProps) {

  const [loading, setLoading] = useState(false);

  const [locationError, setLocationError] =
    useState("");


  const parsedLatitude =
    latitude !== ""
      ? Number(latitude)
      : 11.8333;


  const parsedLongitude =
    longitude !== ""
      ? Number(longitude)
      : 13.1500;


  function captureCurrentLocation() {

    setLocationError("");

    if (!navigator.geolocation) {

      setLocationError(
        "GPS is not supported by this browser."
      );

      return;
    }


    setLoading(true);


    navigator.geolocation.getCurrentPosition(
      (position) => {

        const lat =
          position.coords.latitude.toFixed(7);

        const lng =
          position.coords.longitude.toFixed(7);

        const accuracy =
          position.coords.accuracy.toFixed(2);


        onLocationChange(
          lat,
          lng,
          accuracy
        );


        setLoading(false);
      },

      (error) => {

        setLoading(false);

        switch (error.code) {

          case error.PERMISSION_DENIED:

            setLocationError(
              "Location permission was denied. Please allow location access in your browser."
            );

            break;


          case error.POSITION_UNAVAILABLE:

            setLocationError(
              "Your current location could not be determined."
            );

            break;


          case error.TIMEOUT:

            setLocationError(
              "GPS request timed out. Please try again."
            );

            break;


          default:

            setLocationError(
              "Unable to determine your location."
            );
        }
      },

      {
        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0,
      }
    );
  }


  const hasCoordinates =
    latitude !== "" &&
    longitude !== "";


  return (

    <div className="space-y-5">

      {/* Header */}

      <div>

        <h3 className="text-lg font-bold text-slate-900">

          Farm Location

        </h3>


        <p className="mt-1 text-sm text-slate-500">

          Capture the precise GPS location of the farm.

        </p>

      </div>


      {/* GPS Button */}

      <button
        type="button"
        onClick={captureCurrentLocation}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      >

        <span className="text-xl">

          📍

        </span>


        {loading
          ? "Getting Your Location..."
          : "Use My Current Location"}

      </button>


      {/* Error */}

      {locationError && (

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          {locationError}

        </div>

      )}


      {/* Coordinates */}

      {hasCoordinates && (

        <div className="grid gap-4 rounded-xl border bg-slate-50 p-4 md:grid-cols-3">

          <div>

            <p className="text-xs font-semibold uppercase text-slate-500">

              Latitude

            </p>

            <p className="mt-1 font-mono text-sm text-slate-900">

              {latitude}

            </p>

          </div>


          <div>

            <p className="text-xs font-semibold uppercase text-slate-500">

              Longitude

            </p>

            <p className="mt-1 font-mono text-sm text-slate-900">

              {longitude}

            </p>

          </div>


          <div>

            <p className="text-xs font-semibold uppercase text-slate-500">

              GPS Accuracy

            </p>

            <p className="mt-1 font-mono text-sm text-slate-900">

              {gpsAccuracy
                ? `${gpsAccuracy} metres`
                : "Not available"}

            </p>

          </div>

        </div>

      )}


      {/* Map */}

      <div className="overflow-hidden rounded-2xl border shadow-sm">

        <MapContainer
          center={[
            parsedLatitude,
            parsedLongitude,
          ]}
          zoom={hasCoordinates ? 16 : 6}
          scrollWheelZoom={true}
          style={{
            height: "400px",
            width: "100%",
          }}
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {hasCoordinates && (

            <Marker
              position={[
                parsedLatitude,
                parsedLongitude,
              ]}
              icon={markerIcon}
            />

          )}


          {hasCoordinates && (

            <MapRecenter
              latitude={parsedLatitude}
              longitude={parsedLongitude}
            />

          )}


          <MapClickHandler
            onLocationChange={onLocationChange}
          />

        </MapContainer>

      </div>


      {/* Instructions */}

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">

        <strong>Tip:</strong>{" "}

        Stand as close as possible to the farm location before clicking

        <strong> "Use My Current Location"</strong>.

        You can also click directly on the map to adjust the farm location.

      </div>

    </div>

  );
}