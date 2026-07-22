import React from 'react';
import { Scale, Battery, Thermometer, Droplets } from 'lucide-react';

export default function HiveStats({ lastData }) {
  // EXTRACTION ABSOLUE ET SANS EXCEPTION DE TOUS TES CAPTEURS SUPABASE
  const totalWeight = Number(lastData?.weight || 0);
  const battery     = lastData?.battery ?? 0;
  const tempInt     = lastData?.temp_int ?? 0;
  const tempExt     = lastData?.temp_ext ?? 0;
  const humInt      = lastData?.hum_int ?? 0;
  const humExt      = lastData?.hum_ext ?? 0; 
  const weightP1    = Number(lastData?.weight_p1 || 0);
  const weightP2    = Number(lastData?.weight_p2 || 0);
  const weightP3    = Number(lastData?.weight_p3 || 0);
  const weightP4    = Number(lastData?.weight_p4 || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      
      {/* CARD POIDS REEL GLOBAL */}
      <div className="bg-black/30 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-400 mb-4">
          <Scale size={20} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Poids Global</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black font-mono tracking-tight text-white">
            {totalWeight > 0 ? totalWeight.toFixed(1) : "0.0"}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase">kg</span>
        </div>
      </div>

      {/* CARD BATTERIE */}
      <div className="bg-black/30 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-400 mb-4">
          <Battery size={20} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Batterie Airbox</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black font-mono tracking-tight text-white">
            {battery}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase">%</span>
        </div>
      </div>

      {/* CARD TEMPÉRATURES */}
      <div className="bg-black/30 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-400 mb-4">
          <Thermometer size={20} className="text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Températures</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase">TEMP. INT</span>
            <span className="font-mono font-bold text-white">{Number(tempInt).toFixed(1)}°C</span>
          </div>
          <div className="flex justify-between text-xs border-t border-white/5 pt-2">
            <span className="text-slate-500 font-bold uppercase">TEMP. EXT</span>
            <span className="font-mono font-bold text-slate-400">{Number(tempExt).toFixed(1)}°C</span>
          </div>
        </div>
      </div>

      {/* CARD HUMIDITÉS */}
      <div className="bg-black/30 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-400 mb-4">
          <Droplets size={20} className="text-sky-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Humidité</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase">HUM. INT</span>
            <span className="font-mono font-bold text-white">{Number(humInt).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs border-t border-white/5 pt-2">
            <span className="text-slate-500 font-bold uppercase">HUM. EXT</span>
            <span className="font-mono font-bold text-slate-400">{Number(humExt).toFixed(1)}%</span>
          </div>
        </div>
      </div>

    </div>
  );
}