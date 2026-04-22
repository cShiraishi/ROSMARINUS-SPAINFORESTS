"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, Filter, Database, Beaker, Map as MapIcon, BarChart3, ChevronRight, X } from "lucide-react";
import data from "../public/data.json";

// Dynamic imports
const MapComponent = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-900/50 animate-pulse rounded-2xl" />,
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
    <div className="flex h-screen bg-[#0A0F0A] text-gray-100 overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {/* 🟢 LEFT WORKSTATION PANEL (Sidebar) */}
      <aside className={`bg-[#0F160F] border-r border-emerald-900/20 transition-all duration-500 ease-in-out flex flex-col ${isSidebarOpen ? 'w-96' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between border-b border-emerald-900/10">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black">R</div>
              <div>
                <h1 className="font-black text-emerald-500 leading-none tracking-tighter">ROSMARINUS</h1>
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Repository v2.5</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-500">
            {isSidebarOpen ? <X size={20} /> : <Filter size={20} />}
          </button>
        </div>

        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Global Search */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest px-1">Global Query</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-800 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Compound name..."
                  className="w-full bg-emerald-900/5 border border-emerald-900/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-900/5 border border-emerald-900/10 p-4 rounded-xl">
                <p className="text-[9px] font-bold text-emerald-700 uppercase mb-1">Molecules</p>
                <p className="text-2xl font-black text-gray-200">{filteredData.distribution.length}</p>
              </div>
              <div className="bg-emerald-900/5 border border-emerald-900/10 p-4 rounded-xl">
                <p className="text-[9px] font-bold text-emerald-700 uppercase mb-1">Sites</p>
                <p className="text-2xl font-black text-gray-200">{filteredData.locations.length}</p>
              </div>
            </div>

            {/* Site Selector List */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest px-1">Selected Location</label>
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedSite(null)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${!selectedSite ? 'bg-emerald-500 text-black font-bold' : 'hover:bg-emerald-500/5 text-gray-400'}`}
                >
                  Show All Forests
                  <ChevronRight size={14} className={!selectedSite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                </button>
                {data.locations.map((loc) => (
                  <button 
                    key={loc.ref}
                    onClick={() => setSelectedSite(loc.ref)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${selectedSite === loc.ref ? 'bg-emerald-500 text-black font-bold' : 'hover:bg-emerald-500/5 text-gray-400'}`}
                  >
                    <span>{loc.ref} <span className="opacity-40 ml-2">— {loc.city}</span></span>
                    <ChevronRight size={14} className={selectedSite === loc.ref ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* 🟢 MAIN DISCOVERY AREA */}
      <main className="flex-1 flex flex-col h-full bg-[#0A0F0A]">
        
        {/* Top Header */}
        <header className="h-20 border-b border-emerald-900/10 flex items-center justify-between px-8 bg-[#0F160F]/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-emerald-500">
              <Database size={18} />
              <span className="text-sm font-bold tracking-tight">DATA EXPLORER</span>
            </div>
            <div className="h-4 w-[1px] bg-emerald-900/30" />
            <div className="flex gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={12} className="text-emerald-700" /> Spain</span>
              <span className="flex items-center gap-1"><Beaker size={12} className="text-emerald-700" /> S. Rosmarinus</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {selectedSite && (
               <div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                 <span className="text-xs font-bold text-emerald-500">Filtering by {selectedSite}</span>
                 <button onClick={() => setSelectedSite(null)} className="ml-2 hover:text-white"><X size={14} /></button>
               </div>
             )}
          </div>
        </header>

        {/* Discovery Grid */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-12">
            
            {/* Visual Cluster (Map & Charts) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
              <div className="bg-[#0F160F] border border-emerald-900/10 rounded-2xl overflow-hidden shadow-2xl group flex flex-col">
                <div className="p-4 border-b border-emerald-900/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 flex items-center gap-2">
                    <MapIcon size={12} /> SPATIAL CORE
                  </span>
                </div>
                <div className="flex-1 grayscale-[0.5] hover:grayscale-0 transition-all duration-700">
                  <MapComponent 
                    locations={filteredData.locations} 
                    onSiteClick={(ref: string) => setSelectedSite(ref)}
                  />
                </div>
              </div>

              <div className="bg-[#0F160F] border border-emerald-900/10 rounded-2xl p-6 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 flex items-center gap-2">
                    <BarChart3 size={12} /> CHEMICAL ANALYTICS
                  </span>
                </div>
                <div className="flex-1">
                  <AnalyticsCharts distribution={filteredData.distribution} />
                </div>
              </div>
            </div>

            {/* Molecule Library Cluster */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                  <Microscope size={20} /> Molecular Repository
                </h3>
                <span className="bg-emerald-900/20 text-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-emerald-500/20">
                  {filteredData.distribution.length} COMPOUNDS DETECTED
                </span>
              </div>
              
              <MoleculeCatalog 
                smiles={data.smiles.filter(s => filteredData.distribution.some(d => d.Compound === s.Compound))} 
                distribution={filteredData.distribution} 
              />
            </div>

            {/* Footer Reference */}
            <footer className="pt-20 pb-10 border-t border-emerald-900/10 opacity-30 text-center">
               <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Iterative Phytochemical Intelligence Platform</p>
            </footer>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #065f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
        
        .leaflet-container { 
          background: #0A0F0A !important;
          border-radius: 0 0 1rem 1rem;
        }
        .glass {
          background: rgba(15, 22, 15, 0.7);
          backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
