"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { CLASS_CONFIG, LOC_COLS } from "../lib/constants";

interface Smiles { Compound: string; class: string; "Rt (min)": number; }
interface Dist { Compound: string; L1: number; L2: number; L3: number; L4: number; L5: number; L6: number; L7: number; L8: number; }

interface Props {
  smiles: Smiles[];
  distribution: Dist[];
  classFilter: string | null;
  searchQuery: string;
  selectedSite: string | null;
}

type SortKey = "Compound" | "class" | "Rt (min)" | typeof LOC_COLS[number];

function cellBg(value: number): string {
  if (value === 0)  return "";
  if (value < 0.1) return "bg-emerald-50 text-gray-500";
  if (value < 1)   return "bg-emerald-100 text-emerald-700";
  if (value < 5)   return "bg-emerald-200 text-emerald-800 font-bold";
  if (value < 10)  return "bg-emerald-400 text-white font-bold";
  return                  "bg-emerald-600 text-white font-black";
}

export default function TableView({ smiles, distribution, classFilter, searchQuery, selectedSite }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("Rt (min)");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const distMap = Object.fromEntries(distribution.map(d => [d.Compound, d]));

  const rows = smiles
    .filter(s =>
      (!classFilter || s.class === classFilter) &&
      (!searchQuery || s.Compound.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .map(s => ({ ...s, dist: distMap[s.Compound] }))
    .sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      if (sortKey === "Compound" || sortKey === "class") {
        av = (a as any)[sortKey] ?? "";
        bv = (b as any)[sortKey] ?? "";
        return av < bv ? -sortDir : av > bv ? sortDir : 0;
      }
      av = LOC_COLS.includes(sortKey as any)
        ? ((a.dist as any)?.[sortKey] ?? 0)
        : (a as any)[sortKey] ?? 0;
      bv = LOC_COLS.includes(sortKey as any)
        ? ((b.dist as any)?.[sortKey] ?? 0)
        : (b as any)[sortKey] ?? 0;
      return ((av as number) - (bv as number)) * sortDir;
    });

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(-1); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (col !== sortKey) return <ChevronUp size={10} className="opacity-20" />;
    return sortDir === -1 ? <ChevronDown size={10} className="text-emerald-600" /> : <ChevronUp size={10} className="text-emerald-600" />;
  }

  function Th({ col, label, cls }: { col: SortKey; label: string; cls?: string }) {
    return (
      <th
        className={`px-2 py-2.5 text-[9px] font-black uppercase tracking-widest cursor-pointer select-none border-b border-gray-100 hover:text-emerald-600 transition-colors ${col === sortKey ? "text-emerald-600" : "text-gray-400"} ${cls ?? ""}`}
        onClick={() => toggleSort(col)}
      >
        <div className="flex items-center gap-0.5">
          {label}
          <SortIcon col={col} />
        </div>
      </th>
    );
  }

  return (
    <div className="overflow-auto h-full rounded-xl border border-gray-100">
      <table className="min-w-full text-[11px] border-collapse">
        <thead className="sticky top-0 z-10 bg-white shadow-sm">
          <tr>
            <Th col="Compound" label="Compound" cls="text-left w-44 pl-4" />
            <Th col="class" label="Class" cls="text-left w-32" />
            <Th col="Rt (min)" label="RT (min)" cls="text-right w-20" />
            {LOC_COLS.map(l => (
              <Th key={l} col={l} label={l} cls={`text-center w-14 ${selectedSite === l ? "text-emerald-600" : ""}`} />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const cfg = CLASS_CONFIG[row.class as keyof typeof CLASS_CONFIG];
            return (
              <tr key={row.Compound} className="hover:bg-gray-50/70 border-b border-gray-50">
                <td className="pl-4 pr-2 py-1.5 font-medium text-gray-800 truncate max-w-[176px]" title={row.Compound}>
                  {row.Compound}
                </td>
                <td className="px-2 py-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: cfg?.bg, color: cfg?.color }}>
                    {row.class}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right text-gray-500 tabular-nums">{row["Rt (min)"]}</td>
                {LOC_COLS.map(l => {
                  const val = row.dist ? (row.dist as any)[l] as number : 0;
                  return (
                    <td key={l} className={`px-2 py-1.5 text-center tabular-nums text-[10px] rounded ${cellBg(val)} ${selectedSite === l ? "ring-1 ring-inset ring-emerald-300" : ""}`}>
                      {val > 0 ? (val >= 1 ? val.toFixed(1) : val.toFixed(2)) : <span className="text-gray-200">—</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
