import React from 'react';
import { 
  MapPin, ArrowRight, Trash2, AlertTriangle, 
  CheckCircle, WifiOff, Activity, Moon 
} from 'lucide-react';

export default function HiveCard({ hive, onNavigate, onDelete }) {
  const lastM = hive.last_data; // Récupère la dernière mesure liée à la ruche
  const now = new Date();

  // --- LOGIQUE DE STATUT INTELLIGENTE ---
  const getStatus = () => {
    // Cas 1 : Pas encore de données reçues (Nouvelle ruche)
    if (!lastM) {
      return { 
        label: "En attente", 
        color: "bg-slate-700 border-slate-600 text-slate-300", 
        icon: <Activity size={10}/> 
      };
    }

    const lastUpdate = new Date(lastM.created_at);
    const diffInMinutes = (now - lastUpdate) / (1000 * 60);
    const hour = now.getHours();
    const isNightTime = hour >= 21 || hour <= 7;

    // Cas 2 : Données récentes (< 45 min)
    if (diffInMinutes < 45) {
      return { 
        label: "Système OK", 
        color: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400", 
        icon: <CheckCircle size={10}/> 
      };
    } 
    // Cas 3 : Plus de données mais c'est la nuit (Deep Sleep)
    else if (isNightTime) {
      return { 
        label: "En Sommeil", 
        color: "bg-blue-500/20 border-blue-500/50 text-blue-400", 
        icon: <Moon size={10} className="animate-pulse" /> 
      };
    } 
    // Cas 4 : Plus de données en pleine journée (Vraie déconnexion)
    else {
      return { 
        label: "Déconnectée", 
        color: "bg-red-500 border-red-400 text-white animate-pulse", 
        icon: <WifiOff size={10}/> 
      };
    }
  };

  const status = getStatus();
  const hasAlerts = lastM && (lastM.temp_int < 32 || lastM.hum_int < 45);

  return (
    <div className={`bg-[#0f172a]/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border transition-all duration-500 group shadow-2xl relative ${
      status.label === 'Déconnectée' ? 'border-red-500/30' : 
      status.label === 'En attente' ? 'border-slate-700' : 
      hasAlerts ? 'border-orange-500/50' : 'border-slate-800 hover:border-amber-500/50'
    }`}>
      
      {/* BADGE DE STATUT DYNAMIQUE */}
      <div className={`absolute top-6 right-6 z-20 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl border transition-colors duration-500 ${status.color}`}>
        {status.icon}
        {status.label}
      </div>

      {/* BOUTON SUPPRIMER (Visible au hover) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(e, hive.id); }}
        className="absolute top-6 left-6 z-20 p-2.5 bg-black/40 hover:bg-red-500 text-white rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={14} />
      </button>

      {/* IMAGE D'ENTÊTE */}
      <div className="relative h-48 overflow-hidden pointer-events-none">
        <img 
          src="/images/abeille.png" 
          className={`w-full h-full object-cover transition-all duration-700 ${status.label === 'Déconnectée' ? 'grayscale opacity-30' : 'opacity-60 group-hover:scale-110'}`} 
          alt="Bee" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
      </div>
      
      {/* CONTENU TECHNIQUE */}
      <div className="p-8">
        <h3 className="text-3xl font-black mb-1 text-white uppercase italic tracking-tighter">
          {hive.name || "RUCHE SANS NOM"}
        </h3>
        
        <p className="text-slate-500 text-[10px] font-bold uppercase mb-8 flex items-center gap-1 tracking-widest">
          <MapPin size={12} className="text-amber-500"/> {hive.address || "ADRESSE NON DÉFINIE"}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* TEMPÉRATURE INTERNE */}
          <div className={`p-4 rounded-2xl border transition-colors ${lastM?.temp_int < 32 ? 'bg-red-500/10 border-red-500/50' : 'bg-[#1e293b]/50 border-white/5'}`}>
            <span className="text-slate-400 text-[9px] font-black uppercase mb-1 block">Temp. Int</span>
            <div className={`text-2xl font-black ${lastM?.temp_int < 32 ? 'text-red-500' : 'text-white'}`}>
              {lastM?.temp_int != null ? `${lastM.temp_int}°C` : '--'}
            </div>
          </div>

          {/* HUMIDITÉ INTERNE */}
          <div className={`p-4 rounded-2xl border transition-colors ${lastM?.hum_int < 45 ? 'bg-red-500/10 border-red-500/50' : 'bg-[#1e293b]/50 border-white/5'}`}>
            <span className="text-slate-400 text-[9px] font-black uppercase mb-1 block">Humi. Int</span>
            <div className={`text-2xl font-black ${lastM?.hum_int < 45 ? 'text-red-500' : 'text-white'}`}>
              {lastM?.hum_int != null ? `${lastM.hum_int}%` : '--'}
            </div>
          </div>
        </div>
        
        {/* BOUTON D'ACTION PRINCIPAL */}
        <button 
          onClick={() => onNavigate(hive.id)} 
          className="w-full flex items-center justify-between bg-amber-500 hover:bg-white text-black p-5 rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20"
        >
          {status.label === 'Déconnectée' ? 'Voir dernier état' : 
           status.label === 'En attente' ? 'Configurer la ruche' : 
           'Analyses détaillées'} 
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}