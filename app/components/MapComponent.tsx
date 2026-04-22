"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix for default Leaflet icons in Next.js
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map view updates
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
            <Popup className="custom-popup">
              <div className="p-2">
                <p className="font-bold text-emerald-600 mb-1">{loc.ref}</p>
                <p className="text-sm text-gray-800">{loc.city}</p>
                <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
                  <p>Altitude: {loc.altitude}m</p>
                  <p>Rainfall: {loc.rainfall}mm</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          background: white;
          color: #333;
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
}
