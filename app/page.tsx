"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Search, Filter, Database, Map as MapIcon, BarChart3,
  ChevronRight, MapPin, Microscope, Thermometer, CloudRain,
  Mountain, TableIcon, GitCompare, Flame,
} from "lucide-react";
import data from "../public/data.json";
import { CLASS_CONFIG, CLASS_ORDER, LOC_COLS } from "./lib/constants";

const MapComponent   = dynamic(() => import("./components/MapComponent"),   { ssr: false, loading: () => <div className="h-full w-full bg-gray-50 animate-pulse rounded-2xl" /> });
const MoleculeCatalog = dynamic(() => import("./components/MoleculeCatalog"), { ssr: false });
const AnalyticsCharts = dynamic(() => import("./components/AnalyticsCharts"), { ssr: false });
const HeatmapView     = dynamic(() => import("./components/HeatmapView"),    { ssr: false });
const TableView       = dynamic(() => import("./components/TableView"),      { ssr: false });
const CompareView     = dynamic(() => import("./components/CompareView"),    { ssr: false });

type Tab = "overview" | "heatmap" | "table" | "compare";
type SortBy = "abundance" | "rt" | "name";

const smilesMap = Object.fromEntries(data.smiles.map(s => [s.Compound, s]));

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview",  icon: MapIcon },
  { id: "heatmap",  label: "Heatmap",   icon: Flame },
  { id: "table",    label: "Table",     icon: TableIcon },
  { id: "compare",  label: "Compare",   icon: GitCompare },
];

export default function Home() {
  const [selectedSite, setSelectedSite]   = useState<string | null>(null);
  const [searchQuery,  setSearchQuery]    = useState("");
  const [isSidebarOpen, setSidebarOpen]  = useState(true);
  const [activeTab,    setActiveTab]     = useState<Tab>("overview");
  const [classFilter,  setClassFilter]   = useState<string | null>(null);
  const [sortBy,       setSortBy]        = useState<SortBy>("abundance");

  const filteredData = useMemo(() => {
    let distribution = data.distribution;
    let locations    = data.locations;
    if (selectedSite) {
      distribution = data.distribution.filter((d: any) => d[selectedSite] > 0);
      locations    = data.locations.filter(l => l.ref === selectedSite);
    }
    if (searchQuery) {
      distribution = distribution.filter(d => d.Compound.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return { distribution, locations };
  }, [selectedSite, searchQuery]);

  const selectedLocation = selectedSite ? data.locations.find(l => l.ref === selectedSite) ?? null : null;

  const chemotype = useMemo(() => {
    if (!selectedSite) return null;
    const ranked = data.distribution
      .map(d => ({
        compound: d.Compound,
        value: (d as any)[selectedSite] as number,
        cls: (smilesMap[d.Compound] as any)?.class ?? "Unknown",
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
    const classTotals: Record<string, number> = {};
    ranked.forEach(d => { classTotals[d.cls] = (classTotals[d.cls] ?? 0) + d.value; });
    const total = Object.values(classTotals).reduce((s, v) => s + v, 0);
    return { top3: ranked.slice(0, 3), classTotals, total };
  }, [selectedSite]);

  const classCounts = useMemo(() =>
    Object.fromEntries(CLASS_ORDER.map(cls => [cls, data.smiles.filter(s => (s as any).class === cls).length])),
    []
  );

  const filteredSmiles = data.smiles.filter(s =>
    filteredData.distribution.some(d => d.Compound === s.Compound)
  ) as typeof data.smiles;

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-[#1A2F1A] overflow-hidden font-sans selection:bg-emerald-100">

      {/* SIDEBAR */}
      <aside className={`bg-[#F7F9F7] border-r border-gray-200 transition-all duration-500 ease-in-out flex flex-col ${isSidebarOpen ? "w-80" : "w-20"}`}>
        <div className="p-6 border-b border-gray-100">
          {isSidebarOpen
            ? <img src="/ROSMARINUS-SPAINFORESTS/logo.png" alt="Logo" className="w-full object-contain" />
            : <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white mx-auto">R</div>
          }
        </div>

        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search compound..."
                className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-300"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Compounds</p>
                <p className="text-xl font-black text-[#2D5A27]">{filteredData.distribution.length}</p>
              </div>
              <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Sites</p>
                <p className="text-xl font-black text-[#2D5A27]">{filteredData.locations.length}</p>
              </div>
            </div>

            {/* Class filter */}
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Compound Class</p>
              <button onClick={() => setClassFilter(null)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all font-bold ${!classFilter ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"}`}>
                All classes
              </button>
              {CLASS_ORDER.map(cls => {
                const cfg = CLASS_CONFIG[cls];
                const active = classFilter === cls;
                return (
                  <button key={cls} onClick={() => setClassFilter(active ? null : cls)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between border"
                    style={active
                      ? { backgroundColor: cfg.color, color: "#fff", borderColor: cfg.color }
                      : { backgroundColor: cfg.bg, color: cfg.color, borderColor: "transparent" }
                    }>
                    <span className="font-bold">{cls}</span>
                    <span className="text-[10px] opacity-70">{classCounts[cls]}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected site env data + chemotype */}
            {selectedLocation && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{selectedLocation.ref} — {selectedLocation.city}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{selectedLocation.province}</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5 text-gray-600"><Mountain size={10} className="text-emerald-500" />{selectedLocation.altitude} m</div>
                  <div className="flex items-center gap-1.5 text-gray-600"><Thermometer size={10} className="text-emerald-500" />{selectedLocation.temp}°C</div>
                  <div className="flex items-center gap-1.5 text-gray-600"><CloudRain size={10} className="text-emerald-500" />{selectedLocation.rainfall} mm</div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <div className={`w-2 h-2 rounded-full ${selectedLocation.soil === "Acid" ? "bg-orange-400" : "bg-emerald-500"}`} />
                    {selectedLocation.soil}
                  </div>
                </div>
                {chemotype && (
                  <>
                    <div className="border-t border-emerald-100 pt-2 space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dominant profile</p>
                      {chemotype.top3.map((c, i) => (
                        <div key={c.compound} className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-600 truncate">{c.compound}</span>
                          <span className="text-[10px] font-black text-emerald-600 ml-1 shrink-0">{c.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-2 flex rounded-full overflow-hidden gap-px">
                      {CLASS_ORDER.filter(cls => chemotype.classTotals[cls] > 0).map(cls => (
                        <div key={cls}
                          className="h-full transition-all"
                          style={{
                            width: `${(chemotype.classTotals[cls] / chemotype.total) * 100}%`,
                            backgroundColor: CLASS_CONFIG[cls].color,
                          }}
                          title={`${cls}: ${chemotype.classTotals[cls].toFixed(1)}%`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {CLASS_ORDER.filter(cls => chemotype.classTotals[cls] > 0).map(cls => (
                        <span key={cls} className="text-[8px] font-bold px-1 py-0.5 rounded"
                          style={{ backgroundColor: CLASS_CONFIG[cls].bg, color: CLASS_CONFIG[cls].color }}>
                          {CLASS_CONFIG[cls].label} {((chemotype.classTotals[cls] / chemotype.total) * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Locations */}
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Locations</p>
              <button onClick={() => setSelectedSite(null)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-3 ${!selectedSite ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20" : "hover:bg-emerald-50/80 text-gray-500"}`}>
                <Database size={14} /> All Sites
              </button>
              {data.locations.map(loc => (
                <button key={loc.ref} onClick={() => setSelectedSite(loc.ref)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${selectedSite === loc.ref ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100" : "hover:bg-emerald-50/50 text-gray-500"}`}>
                  <span className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedSite === loc.ref ? "bg-emerald-500" : "bg-gray-300 group-hover:bg-emerald-300"}`} />
                    <span className="font-bold">{loc.ref}</span>
                    <span className="text-[10px] truncate">{loc.city}</span>
                  </span>
                  <ChevronRight size={12} className={selectedSite === loc.ref ? "opacity-100" : "opacity-0 group-hover:opacity-40"} />
                </button>
              ))}
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
      <main className="flex-1 flex flex-col h-full bg-white overflow-hidden">
        {/* Header + Tabs */}
        <header className="border-b border-gray-100 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 h-12">
            <h2 className="text-xs font-bold text-gray-400 flex items-center gap-2">
              ROSMARINUS-SPAINFORESTS
              <span className="text-gray-200">/</span>
              <span className="text-emerald-600 uppercase tracking-tighter">
                {selectedSite ? `${selectedSite} — ${selectedLocation?.city}` : "Global View"}
              </span>
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
              <MapPin size={12} /> IBERIAN PENINSULA
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex px-6 gap-1 pb-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-b-2 ${
                  activeTab === id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}>
                <Icon size={13} /> {label}
              </button>
            ))}
            {/* Sort (only in overview) */}
            {activeTab === "overview" && (
              <div className="ml-auto flex items-center gap-1 pb-1">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Sort</span>
                {(["abundance", "rt", "name"] as SortBy[]).map(s => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`px-2 py-1 text-[9px] font-black rounded uppercase tracking-wide transition-all ${sortBy === s ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-100"}`}>
                    {s === "rt" ? "RT" : s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">

            {activeTab === "overview" && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                  <div className="xl:col-span-3 h-[460px] bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/30">
                      <MapIcon size={13} className="text-emerald-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Spatial Distribution</span>
                    </div>
                    <div className="flex-1">
                      <MapComponent locations={filteredData.locations} onSiteClick={(ref: string) => setSelectedSite(ref)} />
                    </div>
                  </div>

                  <div className="xl:col-span-2 h-[460px] bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 size={13} className="text-emerald-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Abundance Profile</span>
                    </div>
                    <div className="flex-1 min-h-0">
                      <AnalyticsCharts distribution={data.distribution} selectedSite={selectedSite} />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-[#1A2F1A] flex items-center gap-3">
                      <Microscope size={20} className="text-emerald-600" /> Molecular Library
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400">
                      {filteredSmiles.filter(s => !classFilter || (s as any).class === classFilter).length} compounds
                      {selectedSite && <span className="text-emerald-500 ml-1">· sorted by abundance</span>}
                    </span>
                  </div>
                  <MoleculeCatalog
                    smiles={filteredSmiles as any}
                    distribution={data.distribution}
                    selectedSite={selectedSite}
                    classFilter={classFilter}
                    sortBy={sortBy}
                  />
                </div>
              </div>
            )}

            {activeTab === "heatmap" && (
              <div className="h-[calc(100vh-160px)]">
                <HeatmapView
                  smiles={data.smiles as any}
                  distribution={data.distribution}
                  classFilter={classFilter}
                  searchQuery={searchQuery}
                  selectedSite={selectedSite}
                />
              </div>
            )}

            {activeTab === "table" && (
              <div className="h-[calc(100vh-160px)]">
                <TableView
                  smiles={data.smiles as any}
                  distribution={data.distribution}
                  classFilter={classFilter}
                  searchQuery={searchQuery}
                  selectedSite={selectedSite}
                />
              </div>
            )}

            {activeTab === "compare" && (
              <div className="h-[calc(100vh-160px)]">
                <CompareView distribution={data.distribution} locations={data.locations} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
