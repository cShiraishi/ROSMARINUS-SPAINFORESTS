"use client";
import { useState } from "react";
import { Search, ChevronRight, Activity } from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filtered.map((mol) => {
        const distMatch = distribution.find(d => d.Compound === mol.Compound);
        const foundIn = distMatch ? loc_cols.filter(l => (distMatch as any)[l] > 0) : [];

        return (
          <div key={mol.Compound} className="bg-[#0F160F] border border-emerald-900/10 rounded-2xl p-6 flex flex-col group hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-bold text-gray-100 text-sm leading-tight group-hover:text-emerald-400 transition-colors uppercase tracking-wider">{mol.Compound}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-black tracking-widest border border-emerald-500/10">
                    RT: {mol["Rt (min)"]}
                  </span>
                </div>
              </div>
              <Activity size={16} className="text-emerald-900/40 group-hover:text-emerald-500 transition-colors" />
            </div>
            
            <div className="aspect-square bg-white rounded-xl mb-6 flex items-center justify-center p-6 relative overflow-hidden ring-1 ring-emerald-500/5 group-hover:ring-emerald-500/20 transition-all">
              <img 
                src={`/ROSMARINUS-SPAINFORESTS/mol_images/${mol.Compound.trim().replace(/\//g, '_').replace(/ /g, '_')}.svg`}
                alt={mol.Compound}
                className="max-h-full max-w-full mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                onError={(e) => { (e.target as any).style.display = 'none'; }}
              />
            </div>

            <div className="mt-auto space-y-4">
               <div className="flex flex-wrap gap-1">
                {loc_cols.map(l => (
                  <span key={l} className={`text-[9px] px-2 py-0.5 rounded-md font-bold transition-all ${foundIn.includes(l) ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-emerald-900/10 text-emerald-900 ring-1 ring-emerald-900/20'}`}>
                    {l}
                  </span>
                ))}
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-emerald-900/5 group-hover:border-emerald-500/10 transition-colors">
                <code className="text-[10px] text-emerald-800 break-all leading-relaxed font-mono opacity-60 group-hover:opacity-100 transition-opacity">
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
