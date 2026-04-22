"use client";
import { useState } from "react";
import { Search } from "lucide-react";

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
    <div className="space-y-8">
      <div className="flex justify-start">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Chemical Library..."
            className="w-full pl-9 pr-4 py-2 text-sm border-b-2 border-gray-200 focus:border-[#2D5A27] outline-none transition-colors bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((mol) => {
          const distMatch = distribution.find(d => d.Compound === mol.Compound);
          const foundIn = distMatch ? loc_cols.filter(l => (distMatch as any)[l] > 0) : [];

          return (
            <div key={mol.Compound} className="bg-white border-2 border-gray-100 rounded-lg p-5 flex flex-col h-full hover:border-[#A3C9A8] transition-colors">
              <div className="mb-4">
                <p className="font-bold text-[#1A2F1A] text-base leading-tight">{mol.Compound}</p>
                <p className="text-[11px] text-[#4A7C44] mt-1">⏱️ Rt: <b>{mol["Rt (min)"]} min</b></p>
              </div>
              
              <div className="flex-1 flex items-center justify-center min-h-[160px] bg-gray-50 rounded mb-4 p-2 relative overflow-hidden">
                <img 
                  src={`/ROSMARINUS-SPAINFORESTS/mol_images/${mol.Compound.trim().replace(/\//g, '_').replace(/ /g, '_')}.svg`}
                  alt={mol.Compound}
                  className="max-h-full max-w-full"
                  onError={(e) => { (e.target as any).style.display = 'none'; }}
                />
              </div>

              <div className="space-y-3">
                <div className="bg-gray-100 p-2 rounded font-mono text-[9px] text-gray-600 break-all leading-tight">
                  {mol.SMILES}
                </div>
                
                {foundIn.length > 0 && (
                  <div className="text-[10px] text-gray-600">
                    <span className="font-bold">📍 Detected in:</span> {foundIn.join(', ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
