export const LOC_COLS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'] as const;

export const CLASS_ORDER = [
  'Monoterpene HC',
  'Oxygenated MT',
  'Sesquiterpene HC',
  'Oxygenated ST',
  'C8',
] as const;

export const CLASS_CONFIG = {
  'Monoterpene HC':   { color: '#0ea5e9', bg: '#e0f2fe', label: 'Mono HC' },
  'Oxygenated MT':    { color: '#10b981', bg: '#d1fae5', label: 'Oxy MT' },
  'Sesquiterpene HC': { color: '#f59e0b', bg: '#fef3c7', label: 'Sesqui HC' },
  'Oxygenated ST':    { color: '#8b5cf6', bg: '#ede9fe', label: 'Oxy ST' },
  'C8':               { color: '#64748b', bg: '#f1f5f9', label: 'C8' },
} as const;
