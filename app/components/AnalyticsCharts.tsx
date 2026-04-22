"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Distribution {
  Compound: string;
  L1: number; L2: number; L3: number; L4: number; L5: number; L6: number; L7: number; L8: number;
}

export default function AnalyticsCharts({ distribution }: { distribution: Distribution[] }) {
  const loc_cols = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];
  
  // Calculate richness per site
  const richnessData = loc_cols.map(loc => ({
    site: loc,
    count: distribution.filter(d => (d as any)[loc] > 0).length
  }));

  const COLORS = ['#2D5A27', '#346B2D', '#3B7C33', '#428D39', '#499F3F', '#50B045', '#57C14B', '#5ED251'];

  return (
    <div className="space-y-12">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-forest mb-6">Chemical Richness per Sampling Site</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={richnessData}>
              <XAxis dataKey="site" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#f0f4f0'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {richnessData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
        <h3 className="text-xl font-bold text-forest mb-6">Compound Presence Heatmap</h3>
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 px-4 sticky left-0 bg-white">Compound</th>
              {loc_cols.map(l => <th key={l} className="py-2 px-2 text-center">{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {distribution.slice(0, 15).map((d) => (
              <tr key={d.Compound} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-700 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.02)]">{d.Compound}</td>
                {loc_cols.map(l => {
                  const val = (d as any)[l];
                  const opacity = val > 0 ? Math.min(0.1 + (val / 10), 1) : 0;
                  return (
                    <td key={l} className="p-1">
                      <div 
                        className="h-8 rounded-md flex items-center justify-center text-[10px] font-bold"
                        style={{ 
                          backgroundColor: val > 0 ? `rgba(45, 90, 39, ${opacity})` : 'transparent',
                          color: val > 1 ? 'white' : '#2D5A27'
                        }}
                      >
                        {val > 0 ? val.toFixed(2) : '-'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
