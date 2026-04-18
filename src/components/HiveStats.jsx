import React from 'react';
import { Scale, Thermometer, Droplets, Battery } from 'lucide-react';

const Kpi = ({ icon, label, value, unit, colorClass = "group-hover:text-amber-500" }) => (
  <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:bg-white/10 transition-all group">
    <div className={`flex items-center gap-3 text-slate-500 text-[11px] font-black uppercase tracking-widest mb-4 ${colorClass} transition-colors`}>
      {icon} {label}
    </div>
    <div className="text-4xl font-black italic">
      {value ?? '--'} 
      <span className="text-sm text-slate-600 ml-1 font-medium not-italic">{unit}</span>
    </div>
  </div>
);

export default function HiveStats({ lastData }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {/* Ligne 1 : Vitalité & Énergie */}
      <Kpi icon={<Scale/>} label="Poids" value={lastData?.weight} unit="kg" />
      <Kpi icon={<Battery/>} label="Batterie" value={lastData?.battery} unit="%" colorClass="group-hover:text-emerald-500" />
      <div className="hidden lg:block border-l border-white/5 h-full mx-auto" /> {/* Séparateur visuel optionnel */}

      {/* Ligne 2 : Températures (Arduino Sensors) */}
      <Kpi icon={<Thermometer/>} label="Temp. Int" value={lastData?.temp_int} unit="°C" colorClass="group-hover:text-orange-500" />
      <Kpi icon={<Thermometer/>} label="Temp. Ext" value={lastData?.temp_ext} unit="°C" colorClass="group-hover:text-rose-400" />
      
      {/* Ligne 3 : Humidités (Arduino Sensors) */}
      <Kpi icon={<Droplets/>} label="Humi. Int" value={lastData?.hum_int} unit="%" colorClass="group-hover:text-blue-400" />
      <Kpi icon={<Droplets/>} label="Humi. Ext" value={lastData?.hum_ext} unit="%" colorClass="group-hover:text-indigo-400" />
    </div>
  );
}