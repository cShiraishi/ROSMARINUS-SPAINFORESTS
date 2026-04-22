"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface Distribution {
  Compound: string;
  L1: number; L2: number; L3: number; L4: number; L5: number; L6: number; L7: number; L8: number;
}

export default function AnalyticsCharts({ distribution }: { distribution: Distribution[] }) {
  const loc_cols = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];
  
  const richnessData = loc_cols.map(loc => ({
    site: loc,
    count: distribution.filter(d => (d as any)[loc] > 0).length
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={richnessData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="site" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#34d399', fontSize: 10, fontWeight: 700 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#065f46', fontSize: 10 }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(52, 211, 153, 0.05)' }}
              contentStyle={{ 
                backgroundColor: '#0F160F', 
                border: '1px solid rgba(16, 185, 129, 0.2)', 
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: '#34d399' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
              {richnessData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#059669'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-2 overflow-y-auto max-h-[200px] custom-scrollbar pr-2 uppercase">
        {distribution.slice(0, 50).map((d) => {
          const presenceCount = loc_cols.filter(l => (d as any)[l] > 0).length;
          return (
            <div key={d.Compound} className="flex items-center justify-between py-1.5 px-3 bg-emerald-950/20 rounded-lg border border-emerald-900/10">
              <span className="text-[10px] font-bold text-gray-400 truncate max-w-[200px]">{d.Compound}</span>
              <div className="flex gap-1">
                {loc_cols.map(l => (
                   <div key={l} className={`w-1.5 h-1.5 rounded-full ${ (d as any)[l] > 0 ? 'bg-emerald-500' : 'bg-emerald-900/20'}`} title={l} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
