import React from 'react';
import { MapPin, ArrowRight, Trash2, AlertTriangle, CheckCircle, WifiOff, Activity, database } from 'lucide-react';

export default function HiveCard({ hive, onNavigate, onDelete }) {
  const isOffline = hive.status === 'offline';
  const isNew = hive.status === 'no_data'; // Pour ta Ruche Prairie sans microcontrôleur
  const hasAlerts = hive.alerts && hive.alerts.length > 0;
  const lastM = hive.last_data;

  return (
    <div className={`bg-[#0f172a]/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border transition-all duration-500 group shadow-2xl relative ${
      isOffline ? 'border-red-500/30' : isNew ? 'border-slate-700' : hasAlerts ? 'border-orange-500/50' : 'border-slate-800 hover:border-amber-500/50'
    }`}>
      
      {/* BADGE DE STATUT */}
      <div className={`absolute top-6 right-6 z-20 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl border ${
        isOffline ? 'bg-red-500 border-red-400 text-white animate-pulse' : 
        isNew ? 'bg-slate-700 border-slate-600 text-slate-300' :
        hasAlerts ? 'bg-orange-500 border-orange-400 text-white' : 
        'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
      }`}>
        {isOffline ? <WifiOff size={10}/> : isNew ? <Activity size={10}/> : hasAlerts ? <AlertTriangle size={10}/> : <CheckCircle size={10}/>}
        {isOffline ? 'Déconnectée' : isNew ? 'En attente signal' : hasAlerts ? 'Alerte' : 'Système OK'}
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(e, hive.id); }}
        className="absolute top-6 left-6 z-20 p-2.5 bg-black/40 hover:bg-red-500 text-white rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={14} />
      </button>

      <div className="relative h-48 overflow-hidden pointer-events-none">
        <img 
          src="/images/abeille.png" 
          className={`w-full h-full object-cover transition-all duration-700 ${isOffline ? 'grayscale opacity-30' : 'opacity-60 group-hover:scale-110'}`} 
          alt="Bee" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
      </div>
      
      <div className="p-8">
        <h3 className="text-3xl font-black mb-1 text-white uppercase italic tracking-tighter">
          {hive.name || "RUCHE SANS NOM"}
        </h3>
        
        <p className="text-slate-500 text-[10px] font-bold uppercase mb-8 flex items-center gap-1 tracking-widest">
          <MapPin size={12} className="text-amber-500"/> {hive.address || "ADRESSE NON DÉFINIE"}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-2xl border ${lastM?.temp_int < 32 ? 'bg-red-500/10 border-red-500/50' : 'bg-[#1e293b]/50 border-white/5'}`}>
            <span className="text-slate-400 text-[9px] font-black uppercase mb-1 block">Temp</span>
            <div className={`text-2xl font-black ${lastM?.temp_int < 32 ? 'text-red-500' : 'text-white'}`}>
              {lastM?.temp_int != null ? `${lastM.temp_int}°C` : '--'}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${lastM?.hum_int < 45 ? 'bg-red-500/10 border-red-500/50' : 'bg-[#1e293b]/50 border-white/5'}`}>
            <span className="text-slate-400 text-[9px] font-black uppercase mb-1 block">Humi</span>
            <div className={`text-2xl font-black ${lastM?.hum_int < 45 ? 'text-red-500' : 'text-white'}`}>
              {lastM?.hum_int != null ? `${lastM.hum_int}%` : '--'}
            </div>
          </div>
        </div>
        
        {/* BOUTON TOUJOURS ACTIF */}
        <button 
          onClick={() => onNavigate(hive.id)} 
          className="w-full flex items-center justify-between bg-amber-500 hover:bg-white text-black p-5 rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20"
        >
          {isOffline ? 'Voir dernier état' : isNew ? 'Configurer la ruche' : 'Analyses détaillées'} 
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}