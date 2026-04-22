"use client";
import dynamic from "next/dynamic";
import Stats from "./components/Stats";
import MoleculeCatalog from "./components/MoleculeCatalog";
import AnalyticsCharts from "./components/AnalyticsCharts";
import data from "../public/data.json";

// Dynamic imports for components that use browser-only APIs
const MapComponent = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-gray-100 animate-pulse rounded-2xl" />,
});

export default function Home() {
  return (
    <main className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-forest/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="font-bold text-forest leading-none">Rosmarinus</h1>
              <p className="text-[10px] text-sage font-medium tracking-widest uppercase">Spainforests</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
            <a href="#mapping" className="hover:text-forest transition-colors">Mapping</a>
            <a href="#analytics" className="hover:text-forest transition-colors">Analytics</a>
            <a href="#library" className="hover:text-forest transition-colors">Library</a>
            <a href="#data" className="hover:text-forest transition-colors">Raw Data</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-forest/5 to-transparent pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-forest mb-4">
            Phytochemical Essential Oil Repository
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Interactive tracking of <strong>Salvia rosmarinus</strong> (Rosemary) environmental provenance 
            across endemic populations in the Iberian Peninsula.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto space-y-24">
        <Stats locations={data.locations.length} compounds={data.smiles.length} />

        <section id="mapping" className="px-6 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-forest">Spatial Distribution</h3>
            <span className="text-sm text-gray-500 font-medium">8 Sampling Forests</span>
          </div>
          <MapComponent locations={data.locations} />
        </section>

        <section id="analytics" className="px-6 space-y-8">
          <h3 className="text-2xl font-bold text-forest">Comparative Analytics</h3>
          <AnalyticsCharts distribution={data.distribution} />
        </section>

        <section id="library" className="px-6 space-y-8">
          <h3 className="text-2xl font-bold text-forest">Molecular Library</h3>
          <MoleculeCatalog smiles={data.smiles} />
        </section>

        <section id="data" className="px-6 space-y-8">
          <h3 className="text-2xl font-bold text-forest">Raw Records</h3>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Ref</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4">Lat</th>
                    <th className="px-6 py-4">Lon</th>
                    <th className="px-6 py-4">Altitude</th>
                    <th className="px-6 py-4">Rainfall</th>
                    <th className="px-6 py-4">Temp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.locations.map((loc) => (
                    <tr key={loc.ref} className="hover:bg-forest/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-forest">{loc.ref}</td>
                      <td className="px-6 py-4">{loc.city}</td>
                      <td className="px-6 py-4 font-mono text-[11px]">{loc.lat.toFixed(4)}</td>
                      <td className="px-6 py-4 font-mono text-[11px]">{loc.lon.toFixed(4)}</td>
                      <td className="px-6 py-4">{loc.altitude}m</td>
                      <td className="px-6 py-4">{loc.rainfall}mm</td>
                      <td className="px-6 py-4">{loc.temp}°C</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-32 py-12 border-t border-gray-100 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 mx-auto mb-4 opacity-50 transition-opacity hover:opacity-100" />
          <p className="text-gray-400 text-sm">© 2024 Rosmarinus Project</p>
          <p className="text-[10px] text-gray-300 mt-2 uppercase tracking-widest">Scientific Biodiversity Analysis Platform</p>
        </div>
      </footer>
    </main>
  );
}
