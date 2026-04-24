"use client";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { LOC_COLS } from "../lib/constants";

interface Dist { Compound: string; L1: number; L2: number; L3: number; L4: number; L5: number; L6: number; L7: number; L8: number; }
interface Location { ref: string; city: string; province: string; }

interface Props {
  distribution: Dist[];
  locations: Location[];
}

export default function CompareView({ distribution, locations }: Props) {
  const [siteA, setSiteA] = useState<string>("L1");
  const [siteB, setSiteB] = useState<string>("L7");

  const chartData = useMemo(() => {
    return distribution
      .map(d => ({
        name: d.Compound,
        [siteA]: (d as any)[siteA] as number,
        [siteB]: (d as any)[siteB] as number,
        total: ((d as any)[siteA] as number) + ((d as any)[siteB] as number),
      }))
      .filter(d => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 18);
  }, [distribution, siteA, siteB]);

  const locLabel = (ref: string) => {
    const l = locations.find(l => l.ref === ref);
    return l ? `${ref} — ${l.city}` : ref;
  };

  return (
    <div className="h-full flex flex-col gap-6 p-2">
      {/* Site selectors */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <select
            value={siteA}
            onChange={e => setSiteA(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
          >
            {LOC_COLS.filter(l => l !== siteB).map(l => (
              <option key={l} value={l}>{locLabel(l)}</option>
            ))}
          </select>
        </div>
        <span className="text-gray-300 font-black text-lg">vs</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-sky-400" />
          <select
            value={siteB}
            onChange={e => setSiteB(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-white"
          >
            {LOC_COLS.filter(l => l !== siteA).map(l => (
              <option key={l} value={l}>{locLabel(l)}</option>
            ))}
          </select>
        </div>
        <span className="text-[10px] text-gray-400 ml-auto">top 18 compounds by combined abundance</span>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 32, top: 0, bottom: 0 }}>
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#D1D5DB", fontSize: 10 }}
              tickFormatter={v => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ fill: "#F9FAFB" }}
              formatter={(v) => [`${Number(v).toFixed(2)}%`]}
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "11px" }}
            />
            <Legend
              formatter={(value) => locLabel(value)}
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            />
            <Bar dataKey={siteA} fill="#10b981" radius={[0, 3, 3, 0]} barSize={10} />
            <Bar dataKey={siteB} fill="#38bdf8" radius={[0, 3, 3, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
