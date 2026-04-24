"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, Filter, Database, Map as MapIcon, BarChart3, ChevronRight, MapPin, Microscope, Thermometer, CloudRain, Mountain } from "lucide-react";
import data from "../public/data.json";

const MapComponent = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-50 animate-pulse rounded-2xl" />,
});
const MoleculeCatalog = dynamic(() => import("./components/MoleculeCatalog"), { ssr: false });
const AnalyticsCharts = dynamic(() => import("./components/AnalyticsCharts"), { ssr: false });

export default function Home() {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const filteredData = useMemo(() => {
    let distribution = data.distribution;
    let locations = data.locations;

    if (selectedSite) {
      distribution = data.distribution.filter((d: any) => d[selectedSite] > 0);
      locations = data.locations.filter((l) => l.ref === selectedSite);
    }
    if (searchQuery) {
      distribution = distribution.filter((d) =>
        d.Compound.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return { distribution, locations };
  }, [selectedSite, searchQuery]);

  const selectedLocation = selectedSite
    ? data.locations.find((l) => l.ref === selectedSite) ?? null
    : null;

  const filteredSmiles = data.smiles.filter((s) =>
    filteredData.distribution.some((d) => d.Compound === s.Compound)
  );

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-[#1A2F1A] overflow-hidden font-sans selection:bg-emerald-100">

      {/* SIDEBAR */}
      <aside className={`bg-[#F7F9F7] border-r border-gray-200 transition-all duration-500 ease-in-out flex flex-col ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
        <div className="p-6 border-b border-gray-100">
          {isSidebarOpen ? (
            <img src="/ROSMARINUS-SPAINFORESTS/logo.png" alt="Logo" className="w-full object-contain" />
          ) : (
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white mx-auto">R</div>
          )}
        </div>

        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search compound..."
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Compounds</p>
                <p className="text-xl font-black text-[#2D5A27]">{filteredData.distribution.length}</p>
              </div>
              <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sites</p>
                <p className="text-xl font-black text-[#2D5A27]">{filteredData.locations.length}</p>
              </div>
            </div>

            {/* Selected site environmental data */}
            {selectedLocation && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{selectedLocation.ref} — {selectedLocation.city}</p>
                <p className="text-[10px] text-gray-500 font-medium">{selectedLocation.province}</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Mountain size={11} className="text-emerald-500" />
                    <span className="text-[10px] text-gray-600 font-bold">{selectedLocation.altitude} m</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Thermometer size={11} className="text-emerald-500" />
                    <span className="text-[10px] text-gray-600 font-bold">{selectedLocation.temp}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CloudRain size={11} className="text-emerald-500" />
                    <span className="text-[10px] text-gray-600 font-bold">{selectedLocation.rainfall} mm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${selectedLocation.soil === 'Acid' ? 'bg-orange-400' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] text-gray-600 font-bold">{selectedLocation.soil}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Location Navigation */}
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Locations</p>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedSite(null)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 ${!selectedSite ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20' : 'hover:bg-emerald-50/80 text-gray-500'}`}
                >
                  <Database size={16} />
                  All Sites
                </button>
                {data.locations.map((loc) => (
                  <button
                    key={loc.ref}
                    onClick={() => setSelectedSite(loc.ref)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${selectedSite === loc.ref ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100' : 'hover:bg-emerald-50/50 text-gray-500'}`}
                  >
                    <span className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedSite === loc.ref ? 'bg-emerald-500' : 'bg-gray-300 group-hover:bg-emerald-300'}`} />
                      <span className="font-bold">{loc.ref}</span>
                      <span className="text-[10px] truncate">{loc.city}</span>
                    </span>
                    <ChevronRight size={14} className={selectedSite === loc.ref ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-100">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-8 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xs font-bold text-gray-400 flex items-center gap-2">
            ROSMARINUS-SPAINFORESTS
            <span className="text-gray-200">/</span>
            <span className="text-emerald-600 uppercase tracking-tighter">{selectedSite ? `${selectedSite} — ${selectedLocation?.city}` : 'Global View'}</span>
          </h2>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
            <MapPin size={12} /> IBERIAN PENINSULA
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-10">

            {/* Map + Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              <div className="xl:col-span-3 h-[480px] bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
                  <MapIcon size={14} className="text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Spatial Distribution</span>
                </div>
                <div className="flex-1">
                  <MapComponent
                    locations={filteredData.locations}
                    onSiteClick={(ref: string) => setSelectedSite(ref)}
                  />
                </div>
              </div>

              <div className="xl:col-span-2 h-[480px] bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={14} className="text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Abundance Profile</span>
                </div>
                <div className="flex-1 min-h-0">
                  <AnalyticsCharts
                    distribution={data.distribution}
                    selectedSite={selectedSite}
                  />
                </div>
              </div>
            </div>

            {/* Molecular Library */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-[#1A2F1A] flex items-center gap-3">
                  <Microscope size={20} className="text-emerald-600" />
                  Molecular Library
                </h3>
                <span className="text-[10px] font-bold text-gray-400">
                  {filteredSmiles.length} compounds
                  {selectedSite && <span className="text-emerald-500 ml-1">· sorted by abundance</span>}
                </span>
              </div>

              <MoleculeCatalog
                smiles={filteredSmiles}
                distribution={data.distribution}
                selectedSite={selectedSite}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
