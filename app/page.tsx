"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, Filter, Database, Beaker, Map as MapIcon, BarChart3, ChevronRight, X, MapPin, Microscope } from "lucide-react";
import data from "../public/data.json";

// Dynamic imports
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

  // Cross-filtering logic
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

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-[#1A2F1A] overflow-hidden font-sans selection:bg-emerald-100">
      
      {/* ⚪️ CLEAN SIDEBAR */}
      <aside className={`bg-[#F7F9F7] border-r border-gray-200 transition-all duration-500 ease-in-out flex flex-col ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
        <div className="p-6 border-b border-gray-100">
          {isSidebarOpen ? (
            <img src="/rosmarinus-spainforests/logo.png" alt="Logo" className="w-full object-contain" />
          ) : (
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white mx-auto">R</div>
          )}
        </div>

        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Search */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Refine search..."
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Samples</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-[#2D5A27]">{filteredData.distribution.length}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">Molecules</span>
                </div>
              </div>
            </div>

            {/* Location Navigation */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Locations</p>
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedSite(null)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 ${!selectedSite ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20' : 'hover:bg-emerald-50/80 text-gray-500'}`}
                >
                  <Database size={16} />
                  Complete Archive
                </button>
                {data.locations.map((loc) => (
                  <button 
                    key={loc.ref}
                    onClick={() => setSelectedSite(loc.ref)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${selectedSite === loc.ref ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100' : 'hover:bg-emerald-50/50 text-gray-500'}`}
                  >
                    <span className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedSite === loc.ref ? 'bg-emerald-500' : 'bg-gray-300 group-hover:bg-emerald-300'}`} />
                      {loc.ref}
                    </span>
                    <ChevronRight size={14} className={selectedSite === loc.ref ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6 border-t border-gray-100">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </aside>

      {/* 🟢 CLEAN WORKSPACE */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Header */}
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-gray-400 flex items-center gap-2">
               ITERATIVE REPOSITORY <span className="text-gray-200">/</span> 
               <span className="text-emerald-600 uppercase tracking-tighter">{selectedSite || 'Global View'}</span>
            </h2>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
              <MapPin size={12} /> IBERIAN PENINSULA
            </div>
          </div>
        </header>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-12">
            
            {/* Visual Board */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              <div className="xl:col-span-3 h-[500px] bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col group">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                    <MapIcon size={14} /> Spatial Distribution
                  </span>
                </div>
                <div className="flex-1">
                  <MapComponent 
                    locations={filteredData.locations} 
                    onSiteClick={(ref: string) => setSelectedSite(ref)}
                  />
                </div>
              </div>

              <div className="xl:col-span-2 h-[500px] bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2 mb-6">
                  <BarChart3 size={14} /> Site Richness
                </span>
                <div className="flex-1">
                  <AnalyticsCharts distribution={filteredData.distribution} />
                </div>
              </div>
            </div>

            {/* Molecular Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-[#1A2F1A] flex items-center gap-3">
                  <Microscope size={20} className="text-emerald-600" /> Molecular Library
                </h3>
                <div className="text-[10px] font-bold text-gray-400">
                   RESULTADOS: <span className="text-[#1A2F1A]">{filteredData.distribution.length}</span>
                </div>
              </div>
              
              <MoleculeCatalog 
                smiles={data.smiles.filter(s => filteredData.distribution.some(d => d.Compound === s.Compound))} 
                distribution={filteredData.distribution} 
              />
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
