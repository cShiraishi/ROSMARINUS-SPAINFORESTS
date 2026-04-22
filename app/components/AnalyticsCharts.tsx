"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={richnessData}>
            <XAxis 
              dataKey="site" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#D1D5DB', fontSize: 10 }}
            />
            <Tooltip 
              cursor={{ fill: '#F9FAFB' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E5E7EB', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
              {richnessData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 space-y-1 overflow-y-auto max-h-[160px] custom-scrollbar pr-2">
        {distribution.slice(0, 50).map((d) => {
          const presenceCount = loc_cols.filter(l => (d as any)[l] > 0).length;
          return (
            <div key={d.Compound} className="flex items-center justify-between py-1 px-3 bg-gray-50 rounded border border-gray-100">
              <span className="text-[10px] font-medium text-gray-500 truncate max-w-[150px]">{d.Compound}</span>
              <div className="flex gap-1">
                {loc_cols.map(l => (
                   <div key={l} className={`w-1.5 h-1.5 rounded-full ${ (d as any)[l] > 0 ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.2)]' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
