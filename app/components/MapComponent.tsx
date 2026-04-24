"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix for default Leaflet icons
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ locations }: { locations: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      if (locations.length === 1) {
        map.setView([locations[0].lat, locations[0].lon], 9, { animate: true });
      } else {
        const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lon]));
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      }
    }
  }, [locations, map]);
  return null;
}

export default function MapComponent({ locations, onSiteClick }: { locations: any[], onSiteClick?: (ref: string) => void }) {
  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={[40.4168, -3.7038]} 
        zoom={6} 
        className="h-full w-full outline-none"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater locations={locations} />
        {locations.map((loc) => (
          <Marker 
            key={loc.ref} 
            position={[loc.lat, loc.lon]} 
            icon={customIcon}
            eventHandlers={{
              click: () => onSiteClick?.(loc.ref),
            }}
          >
            <Popup>
              <div className="p-1 space-y-1 min-w-[140px]">
                <p className="font-bold text-emerald-600 text-sm leading-none">{loc.ref} — {loc.city}</p>
                <p className="text-xs text-gray-400">{loc.province}</p>
                <div className="pt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-600">
                  <span>⛰ {loc.altitude} m</span>
                  <span>🌡 {loc.temp}°C</span>
                  <span>🌧 {loc.rainfall} mm</span>
                  <span>🪨 {loc.soil}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
