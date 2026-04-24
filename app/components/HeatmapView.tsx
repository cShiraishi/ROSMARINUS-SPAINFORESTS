"use client";
import { CLASS_CONFIG, CLASS_ORDER, LOC_COLS } from "../lib/constants";

interface Smiles { Compound: string; class: string; "Rt (min)": number; }
interface Dist { Compound: string; L1: number; L2: number; L3: number; L4: number; L5: number; L6: number; L7: number; L8: number; }

interface Props {
  smiles: Smiles[];
  distribution: Dist[];
  classFilter: string | null;
  searchQuery: string;
  selectedSite: string | null;
}

function heatColor(value: number): { bg: string; text: string } {
  if (value === 0)    return { bg: "#F9FAFB",  text: "transparent" };
  if (value < 0.1)   return { bg: "#d1fae5",  text: "#9ca3af" };
  if (value < 1)     return { bg: "#a7f3d0",  text: "#374151" };
  if (value < 5)     return { bg: "#34d399",  text: "#1f2937" };
  if (value < 10)    return { bg: "#059669",  text: "#fff" };
  return               { bg: "#064e3b",  text: "#fff" };
}

export default function HeatmapView({ smiles, distribution, classFilter, searchQuery, selectedSite }: Props) {
  const distMap = Object.fromEntries(distribution.map(d => [d.Compound, d]));

  const rows = CLASS_ORDER.flatMap(cls => {
    const compounds = smiles.filter(s =>
      s.class === cls &&
      (!classFilter || classFilter === cls) &&
      (!searchQuery || s.Compound.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (!compounds.length) return [];
    return [
      { type: "header" as const, cls },
      ...compounds.map(s => ({ type: "row" as const, s })),
    ];
  });

  return (
    <div className="overflow-auto h-full rounded-xl border border-gray-100">
      <table className="min-w-full text-[11px] border-collapse">
        <thead className="sticky top-0 z-10 bg-white shadow-sm">
          <tr>
            <th className="text-left px-4 py-2.5 text-gray-400 font-black text-[9px] uppercase tracking-widest border-b border-gray-100 w-52">Compound</th>
            {LOC_COLS.map(l => (
              <th key={l} className={`px-1 py-2.5 text-center font-black text-[10px] border-b border-gray-100 w-14 ${selectedSite === l ? "text-emerald-600" : "text-gray-400"}`}>
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            if (row.type === "header") {
              const cfg = CLASS_CONFIG[row.cls as keyof typeof CLASS_CONFIG];
              return (
                <tr key={`h-${row.cls}`}>
                  <td colSpan={9} className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border-b border-gray-100"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                    {row.cls}
                  </td>
                </tr>
              );
            }
            const { s } = row;
            const dist = distMap[s.Compound];
            return (
              <tr key={s.Compound} className="hover:bg-gray-50/70 group">
                <td className="px-4 py-0.5 text-gray-700 font-medium border-b border-gray-50 truncate max-w-[208px]" title={s.Compound}>
                  {s.Compound}
                </td>
                {LOC_COLS.map(l => {
                  const val = dist ? (dist as any)[l] as number : 0;
                  const { bg, text } = heatColor(val);
                  return (
                    <td key={l} className="p-0.5 border-b border-gray-50" title={`${s.Compound} @ ${l}: ${val}%`}>
                      <div className={`h-7 flex items-center justify-center rounded font-bold transition-all ${selectedSite === l ? "ring-1 ring-emerald-400" : ""}`}
                        style={{ backgroundColor: bg, color: text }}>
                        {val > 0 ? (val >= 1 ? val.toFixed(1) : val.toFixed(2)) : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-2 flex items-center gap-4">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Abundance</span>
        {[
          { bg: "#d1fae5", label: "< 0.1%" },
          { bg: "#a7f3d0", label: "0.1–1%" },
          { bg: "#34d399", label: "1–5%" },
          { bg: "#059669", label: "5–10%" },
          { bg: "#064e3b", label: "> 10%" },
        ].map(({ bg, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: bg }} />
            <span className="text-[9px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
