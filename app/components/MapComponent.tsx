"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
  ref: string;
  city: string;
  province: string;
  lat: number;
  lon: number;
  altitude: string;
}

export default function MapComponent({ locations }: { locations: Location[] }) {
  const center: [number, number] = [40.4168, -3.7038]; // Center of Spain

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-gray-200">
      <MapContainer center={center} zoom={6} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.ref} position={[loc.lat, loc.lon]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-forest">{loc.ref} - {loc.city}</h3>
                <p className="text-sm text-gray-600">{loc.province}</p>
                <div className="mt-2 text-xs border-t pt-1">
                  Altitude: {loc.altitude}m
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
