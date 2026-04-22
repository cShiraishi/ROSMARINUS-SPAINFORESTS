import dynamic from "next/dynamic";
import { Trees, Microscope, MapPin } from "lucide-react";
import data from "../public/data.json";

const MapComponent = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
  loading: () => <div className="h-[550px] w-full bg-gray-100 animate-pulse rounded-xl" />,
});

const MoleculeCatalog = dynamic(() => import("./components/MoleculeCatalog"), { ssr: false });
const AnalyticsCharts = dynamic(() => import("./components/AnalyticsCharts"), { ssr: false });

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#F8F9F8] text-[#1A2F1A] font-sans">
      {/* --- SIDEBAR (Persistent) --- */}
      <aside className="w-80 bg-[#f1f3f1] border-r border-gray-200 p-8 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <img src="/ROSMARINUS-SPAINFORESTS/logo.png" alt="Logo" className="w-full mb-8" />
        
        <h2 className="text-xl font-bold text-[#2D5A27] mb-2 flex items-center gap-2">
          <span className="text-2xl">🌿</span> Quick Panel
        </h2>
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Explore climatic descriptors and phytochemical taxonomy summaries.
        </p>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Samples</p>
            <p className="text-2xl font-black text-[#2D5A27]">{data.locations.length} Samples</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Sampling Sites</p>
            <p className="text-2xl font-black text-[#2D5A27]">{data.locations.length} Unique Sites</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Extracted Compounds</p>
            <p className="text-2xl font-black text-[#2D5A27]">{data.smiles.length} Molecules</p>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-gray-200">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center">
            ROSMARINUS PROJECT © 2024
          </p>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-black text-[#2D5A27] mb-2">
            🌿 ROSMARINUS-SPAINFORESTS: A Phytochemical Essential Oil Repository
          </h1>
          <h2 className="text-xl text-[#4A7C44] font-medium mb-6">
            Geographical Distribution of Samples from Spanish Forests
          </h2>
          <div className="max-w-4xl p-4 bg-[#A3C9A8]/10 border-l-4 border-[#A3C9A8] text-sm text-gray-700 italic">
            This interactive tracking repository documents the geographical and environmental provenance of <b>Salvia rosmarinus</b> essential oil samples collected across endemic populations in the Iberian Peninsula.
          </div>
        </header>

        {/* --- TOP METRICS ROW --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="border-b-2 border-gray-100 pb-4">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Altitude & Relief</p>
            <p className="text-lg font-bold text-gray-800">260 - 1120 m</p>
          </div>
          <div className="border-b-2 border-gray-100 pb-4">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Historical Temps</p>
            <p className="text-lg font-bold text-gray-800">10.9 to 18.0 °C</p>
          </div>
          <div className="border-b-2 border-gray-100 pb-4">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Rainfall Regime</p>
            <p className="text-lg font-bold text-gray-800">267 - 688 mm</p>
          </div>
          <div className="border-b-2 border-gray-100 pb-4">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Diversity</p>
            <p className="text-lg font-bold text-gray-800">+{data.smiles.length} Volatiles</p>
          </div>
        </div>

        {/* --- TABS SECTION (Restored Logic) --- */}
        <div className="space-y-16">
          <section id="tab1">
            <h3 className="text-xl font-bold text-[#2D5A27] mb-6 flex items-center gap-2">
              📍 Geographic & Climate Mapping
            </h3>
            <MapComponent locations={data.locations} />
          </section>

          <section id="tab2">
             <h3 className="text-xl font-bold text-[#2D5A27] mb-6 flex items-center gap-2">
              🧪 Chemical Profile (SMILES)
            </h3>
            <MoleculeCatalog smiles={data.smiles} distribution={data.distribution} />
          </section>

          <section id="tab3">
            <h3 className="text-xl font-bold text-[#2D5A27] mb-6 flex items-center gap-2">
              📊 Overall Analytics
            </h3>
            <AnalyticsCharts distribution={data.distribution} />
          </section>

          <section id="tab4">
            <h3 className="text-xl font-bold text-[#2D5A27] mb-6 flex items-center gap-2">
              🗃️ Raw Data Repository
            </h3>
            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 font-bold text-sm text-gray-600">
                  📍 Geographic Data (localization_data.xlsx)
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400">
                          <th className="px-6 py-3">REF</th>
                          <th className="px-6 py-3">CITY</th>
                          <th className="px-6 py-3">LAT</th>
                          <th className="px-6 py-3">LON</th>
                          <th className="px-6 py-3">ALTITUDE</th>
                          <th className="px-6 py-3">RAINFALL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.locations.map(loc => (
                          <tr key={loc.ref} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-bold text-[#2D5A27]">{loc.ref}</td>
                            <td className="px-6 py-3">{loc.city}</td>
                            <td className="px-6 py-3 font-mono">{loc.lat.toFixed(4)}</td>
                            <td className="px-6 py-3 font-mono">{loc.lon.toFixed(4)}</td>
                            <td className="px-6 py-3">{loc.altitude}m</td>
                            <td className="px-6 py-3">{loc.rainfall}mm</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
