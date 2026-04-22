"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Molecule {
  "Rt (min)": number;
  Compound: string;
  SMILES: string;
}

export default function MoleculeCatalog({ smiles }: { smiles: Molecule[] }) {
  const [search, setSearch] = useState("");

  const filtered = smiles.filter(
    (m) =>
      m.Compound.toLowerCase().includes(search.toLowerCase()) ||
      m.SMILES.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search molecules or SMILES..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition-all bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {filtered.map((mol, index) => (
            <motion.div
              key={mol.Compound}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-forest text-sm">{mol.Compound}</h3>
                <span className="text-[10px] bg-sage/10 text-sage px-2 py-1 rounded-full font-medium">
                  {mol["Rt (min)"]} min
                </span>
              </div>
              
              <div className="flex-1 min-h-[150px] bg-gray-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden p-2">
                <img 
                  src={`/ROSMARINUS-SPAINFORESTS/mol_images/${mol.Compound.trim().replace(/\//g, '_').replace(/ /g, '_')}.svg`}
                  alt={mol.Compound}
                  className="max-h-full max-w-full"
                  onError={(e) => { (e.target as any).style.display = 'none'; }}
                />
              </div>

              <div className="bg-gray-50 p-2 rounded-lg mt-auto overflow-hidden">
                <code className="text-[10px] text-gray-500 break-all">{mol.SMILES}</code>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
