"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Distribution {
  Compound: string;
  L1: number; L2: number; L3: number; L4: number; L5: number; L6: number; L7: number; L8: number;
}

interface Props {
  distribution: Distribution[];
  selectedSite: string | null;
}

const LOC_COLS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'] as const;

export default function AnalyticsCharts({ distribution, selectedSite }: Props) {
  const chartData = selectedSite
    ? distribution
        .map(d => ({ name: d.Compound, value: (d as any)[selectedSite] as number }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    : distribution
        .map(d => ({
          name: d.Compound,
          value: parseFloat((LOC_COLS.reduce((s, l) => s + (d as any)[l], 0) / LOC_COLS.length).toFixed(3)),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

  const colors = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  return (
    <div className="h-full flex flex-col gap-4">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
        {selectedSite ? `Top compounds — ${selectedSite}` : 'Top compounds — avg all sites'}
      </p>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 24, top: 0, bottom: 0 }}>
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#D1D5DB', fontSize: 9 }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 9, fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ fill: '#F9FAFB' }}
              formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Abundance']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
