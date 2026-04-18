import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, AlertTriangle, CheckCircle, Cloud } from 'lucide-react';

export default function WeatherWidget({ lat, lng, cityName }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      // Clé API OpenWeatherMap
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; 
      
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=fr`
        );
        
        if (!response.ok) throw new Error("Erreur API");
        
        const data = await response.json();
        setWeather(data);
        setError(false);
      } catch (err) {
        console.error("Erreur météo:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (lat && lng) fetchWeather();
  }, [lat, lng]);

  // 1. État de chargement
  if (loading) return (
    <div className="p-4 bg-black/20 rounded-2xl border border-white/5 animate-pulse">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Analyse du ciel...</span>
    </div>
  );

  // 2. État d'erreur (si la clé n'est pas encore active ou coordonnées invalides)
  if (error || !weather || !weather.main) return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
      <p className="text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
        <AlertTriangle size={12} /> Service Météo Indisponible
      </p>
      <p className="text-slate-500 text-[9px] mt-1 italic">(Activation de la clé en cours ou erreur réseau)</p>
    </div>
  );

  // --- LOGIQUE D'ANALYSE ---
  const temp = weather?.main?.temp ?? 0;
  const humidity = weather?.main?.humidity ?? 0;
  const windSpeed = (weather?.wind?.speed ?? 0) * 3.6; // Conversion m/s en km/h
  
  const rainData = weather?.rain?.['1h'] || weather?.rain?.['3h'] || 0;
  const weatherMain = weather?.weather?.[0]?.main || '';
  const isRaining = weatherMain === 'Rain' || weatherMain === 'Drizzle' || rainData > 0;

  // Déclaration des variables de texte
  let comment = "Conditions idéales pour le butinage ! 🐝";
  let alert = null;

  // Analyse pour le commentaire principal
  if (isRaining) {
    comment = "Il pleut. Les abeilles restent à l'abri dans la ruche. 🌧️";
  } else if (temp < 12) {
    comment = "Il fait frais (moins de 12°C) : activité de vol réduite. ❄️";
  } else if (temp > 35) {
    comment = "Forte chaleur : les ouvrières ventilent la ruche. 🔥";
  }

  // Analyse pour les alertes (priorités)
  const month = new Date().getMonth(); 
  const isWinter = month === 0 || month === 1 || month === 11;
  
  if (isWinter && temp > 18) {
    alert = "Anomalie : Chaleur printanière en hiver ! Risque de réveil précoce. ⚠️";
  } else if (windSpeed > 45) {
    alert = `Vent fort (${windSpeed.toFixed(0)} km/h) : Vol difficile pour les ouvrières. 💨`;
  } else if (rainData > 1) {
    alert = `Précipitations (${rainData}mm) : Risque de refroidissement du couvain.`;
  } else if (temp > 38) {
    alert = "Alerte Canicule : Surveillez l'approvisionnement en eau !";
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {/* GRILLE PRINCIPALE : STATUT ET ALERTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARTE STATUT ACTUEL */}
        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-shadow-sm">Météo Locale</span>
            {isRaining ? <CloudRain size={16} className="text-blue-400" /> : <Sun size={16} className="text-amber-400" />}
          </div>
          
          <p className="text-white text-xl font-black mb-1 uppercase tracking-tighter">
             {temp.toFixed(1)}°C
          </p>
          <p className="text-slate-300 text-[10px] uppercase font-bold mb-2 tracking-wide">
            {weather.weather[0].description}
          </p>
          <p className="text-slate-400 text-[11px] italic leading-tight border-l-2 border-amber-500/50 pl-2">
            "{comment}"
          </p>

          {/* --- LES STICKERS DE DONNÉES (NOUVEAU) --- */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-black">Humidité</span>
              <span className="text-xs text-white font-bold">{humidity}%</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10 mx-1 self-end"></div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-black">Vent</span>
              <span className="text-xs text-white font-bold">{windSpeed.toFixed(0)} <span className="text-[8px]">km/h</span></span>
            </div>
            <div className="w-[1px] h-6 bg-white/10 mx-1 self-end"></div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-black">Précip.</span>
              <span className="text-xs text-white font-bold">{rainData} <span className="text-[8px]">mm</span></span>
            </div>
          </div>
        </div>

        {/* CARTE ALERTES ET PRÉVISIONS (CORRIGÉE) */}
<div className={`p-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-500 ${alert ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
  <div className="flex justify-between items-start mb-3">
    <span className={`text-[9px] font-black uppercase tracking-widest ${alert ? 'text-red-400' : 'text-emerald-400'}`}>
      {alert ? "Vigilance Météo" : "Analyse du Ciel"}
    </span>
    {alert ? <AlertTriangle size={18} className="text-red-400 animate-pulse" /> : <CheckCircle size={18} className="text-emerald-400" />}
  </div>
  
  <p className="text-white text-sm leading-snug font-medium pr-4">
    {alert ? alert : "Les données satellites ne prévoient aucun événement climatique critique pour vos ruches."}
  </p>

  {!alert && (
    <div className="mt-4 flex items-center gap-2 text-emerald-400/60 uppercase text-[8px] font-black tracking-widest">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
      Synchronisation Cloud OK
    </div>
  )}
</div>

      </div>
    </div>
  );
}