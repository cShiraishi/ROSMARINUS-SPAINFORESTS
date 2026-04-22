"use client";
import { motion } from "framer-motion";
import { Trees, Microscope, MapPin, Database } from "lucide-react";

interface StatsProps {
  locations: number;
  compounds: number;
}

export default function Stats({ locations, compounds }: StatsProps) {
  const stats = [
    { label: "Sampling Sites", value: locations, icon: MapPin },
    { label: "Molecules Isolated", value: compounds, icon: Microscope },
    { label: "Altitude Range", value: "260 - 1120m", icon: Trees },
    { label: "Data Points", value: "+1,200", icon: Database },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-forest/10 hover:shadow-md transition-shadow flex items-center space-x-4"
        >
          <div className="bg-forest/10 p-3 rounded-xl">
            <stat.icon className="w-6 h-6 text-forest" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-forest">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
