"use client";
import { useState } from "react";
import { Activity } from "lucide-react";

interface Molecule {
  "Rt (min)": number;
  Compound: string;
  SMILES: string;
}

interface Distribution {
  Compound: string;
  L1: number; L2: number; L3: number; L4: number; L5: number; L6: number; L7: number; L8: number;
}

export default function MoleculeCatalog({ smiles, distribution }: { smiles: Molecule[], distribution: Distribution[] }) {
  const [search, setSearch] = useState("");
  const loc_cols = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];

  const filtered = smiles.filter(
    (m) =>
      m.Compound.toLowerCase().includes(search.toLowerCase()) ||
      m.SMILES.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
      {filtered.map((mol) => {
        const distMatch = distribution.find(d => d.Compound === mol.Compound);
        const foundIn = distMatch ? loc_cols.filter(l => (distMatch as any)[l] > 0) : [];

        return (
          <div key={mol.Compound} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col group hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-bold text-gray-800 text-xs leading-tight uppercase tracking-widest">{mol.Compound}</h4>
                <p className="text-[10px] text-gray-400 font-bold mt-1">RT: {mol["Rt (min)"]} MIN</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 transition-colors">
                <Activity size={14} />
              </div>
            </div>
            
            <div className="aspect-square bg-[#F9FAFB] rounded-xl mb-6 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-white transition-colors duration-500">
              <img 
                src={`/ROSMARINUS-SPAINFORESTS/mol_images/${mol.Compound.trim().replace(/\//g, '_').replace(/ /g, '_')}.svg`}
                alt={mol.Compound}
                className="max-h-full max-w-full mix-blend-multiply opacity-70 group-hover:opacity-100 transition-all duration-700"
                onError={(e) => { (e.target as any).style.display = 'none'; }}
              />
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex flex-wrap gap-1">
                {loc_cols.map(l => (
                  <span key={l} className={`text-[9px] px-1.5 py-0.5 rounded font-black transition-all ${foundIn.includes(l) ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-300'}`}>
                    {l}
                  </span>
                ))}
              </div>

              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-white transition-colors">
                <code className="text-[9px] text-gray-400 break-all leading-tight font-mono block">
                  {mol.SMILES}
                </code>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
