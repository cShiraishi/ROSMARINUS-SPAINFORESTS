"use client";

interface Molecule {
  "Rt (min)": number;
  Compound: string;
  SMILES: string;
}

interface Distribution {
  Compound: string;
  L1: number; L2: number; L3: number; L4: number; L5: number; L6: number; L7: number; L8: number;
}

interface Props {
  smiles: Molecule[];
  distribution: Distribution[];
  selectedSite: string | null;
}

const LOC_COLS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'] as const;

function abundanceLabel(value: number): { label: string; className: string } {
  if (value >= 10) return { label: 'Major', className: 'bg-emerald-600 text-white' };
  if (value >= 1)  return { label: 'Minor', className: 'bg-emerald-100 text-emerald-700' };
  return { label: 'Trace', className: 'bg-gray-100 text-gray-400' };
}

export default function MoleculeCatalog({ smiles, distribution, selectedSite }: Props) {
  const enriched = smiles.map((mol) => {
    const dist = distribution.find(d => d.Compound === mol.Compound);
    const siteValue = dist && selectedSite ? (dist as any)[selectedSite] as number : null;
    const maxValue = dist ? Math.max(...LOC_COLS.map(l => (dist as any)[l] as number)) : 0;
    const foundIn = dist ? LOC_COLS.filter(l => (dist as any)[l] > 0) : [];
    return { mol, dist, siteValue, maxValue, foundIn };
  });

  const sorted = selectedSite
    ? [...enriched].sort((a, b) => (b.siteValue ?? 0) - (a.siteValue ?? 0))
    : [...enriched].sort((a, b) => b.maxValue - a.maxValue);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
      {sorted.map(({ mol, dist, siteValue, foundIn }) => {
        const displayValue = selectedSite ? siteValue : (dist ? Math.max(...LOC_COLS.map(l => (dist as any)[l] as number)) : 0);
        const badge = displayValue !== null && displayValue !== undefined ? abundanceLabel(displayValue) : null;
        const imgName = mol.Compound.trim().replace(/\//g, '_').replace(/ /g, '_');

        return (
          <div
            key={mol.Compound}
            className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col group hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-bold text-gray-800 text-xs leading-tight uppercase tracking-wider truncate">{mol.Compound}</h4>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">RT: {mol["Rt (min)"]} min</p>
              </div>
              {badge && (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black shrink-0 ${badge.className}`}>
                  {badge.label}
                </span>
              )}
            </div>

            <div className="aspect-square bg-[#F9FAFB] rounded-xl mb-4 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-white transition-colors duration-500">
              <img
                src={`/ROSMARINUS-SPAINFORESTS/mol_images/${imgName}.svg`}
                alt={mol.Compound}
                className="max-h-full max-w-full mix-blend-multiply opacity-70 group-hover:opacity-100 transition-all duration-700"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>

            <div className="mt-auto space-y-3">
              {displayValue !== null && displayValue !== undefined && displayValue > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(displayValue / 30 * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 w-10 text-right">
                    {displayValue.toFixed(2)}%
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {LOC_COLS.map(l => (
                  <span
                    key={l}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-black transition-all ${
                      foundIn.includes(l)
                        ? l === selectedSite
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    {l}
                  </span>
                ))}
              </div>

              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-white transition-colors">
                <code className="text-[9px] text-gray-400 break-all leading-tight font-mono block line-clamp-2">
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
