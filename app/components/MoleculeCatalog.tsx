"use client";
import { CLASS_CONFIG, LOC_COLS } from "../lib/constants";

interface Molecule { "Rt (min)": number; Compound: string; SMILES: string; class: string; }
interface Distribution { Compound: string; L1: number; L2: number; L3: number; L4: number; L5: number; L6: number; L7: number; L8: number; }

interface Props {
  smiles: Molecule[];
  distribution: Distribution[];
  selectedSite: string | null;
  classFilter: string | null;
  sortBy: "abundance" | "rt" | "name";
}

function abundanceBadge(value: number) {
  if (value >= 10) return { label: "Major",  cls: "bg-emerald-600 text-white" };
  if (value >= 1)  return { label: "Minor",  cls: "bg-emerald-100 text-emerald-700" };
  return               { label: "Trace",  cls: "bg-gray-100 text-gray-400" };
}

export default function MoleculeCatalog({ smiles, distribution, selectedSite, classFilter, sortBy }: Props) {
  const distMap = Object.fromEntries(distribution.map(d => [d.Compound, d]));

  const enriched = smiles
    .filter(s => !classFilter || s.class === classFilter)
    .map(s => {
      const dist = distMap[s.Compound];
      const siteVal = dist && selectedSite ? (dist as any)[selectedSite] as number : null;
      const maxVal  = dist ? Math.max(...LOC_COLS.map(l => (dist as any)[l] as number)) : 0;
      const foundIn = dist ? LOC_COLS.filter(l => (dist as any)[l] > 0) : [];
      return { s, dist, siteVal, maxVal, foundIn };
    })
    .sort((a, b) => {
      if (sortBy === "abundance") return selectedSite ? (b.siteVal ?? 0) - (a.siteVal ?? 0) : b.maxVal - a.maxVal;
      if (sortBy === "rt") return a.s["Rt (min)"] - b.s["Rt (min)"];
      return a.s.Compound.localeCompare(b.s.Compound);
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
      {enriched.map(({ s, dist, siteVal, maxVal, foundIn }) => {
        const displayVal = selectedSite ? (siteVal ?? 0) : maxVal;
        const badge = abundanceBadge(displayVal);
        const cfg = CLASS_CONFIG[s.class as keyof typeof CLASS_CONFIG];
        const imgName = s.Compound.trim().replace(/\//g, "_").replace(/ /g, "_");

        return (
          <div key={s.Compound}
            className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col group hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500">

            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-bold text-gray-800 text-xs leading-tight uppercase tracking-wider truncate">{s.Compound}</h4>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5">RT: {s["Rt (min)"]} min</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${badge.cls}`}>{badge.label}</span>
                {cfg && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                )}
              </div>
            </div>

            <div className="aspect-square bg-[#F9FAFB] rounded-xl mb-3 flex items-center justify-center p-4 overflow-hidden group-hover:bg-white transition-colors duration-500">
              <img
                src={`/ROSMARINUS-SPAINFORESTS/mol_images/${imgName}.svg`}
                alt={s.Compound}
                className="max-h-full max-w-full mix-blend-multiply opacity-70 group-hover:opacity-100 transition-all duration-700"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>

            <div className="mt-auto space-y-2.5">
              {displayVal > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(displayVal / 28 * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 w-10 text-right">{displayVal.toFixed(2)}%</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {LOC_COLS.map(l => (
                  <span key={l} className={`text-[9px] px-1.5 py-0.5 rounded font-black transition-all ${
                    foundIn.includes(l)
                      ? l === selectedSite ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-300"
                  }`}>{l}</span>
                ))}
              </div>

              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-white transition-colors">
                <code className="text-[9px] text-gray-400 break-all leading-tight font-mono block line-clamp-2">{s.SMILES}</code>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
