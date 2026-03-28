import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Loader2, CloudLightning, Snowflake } from 'lucide-react';

export default function WeatherWidget({ address }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour transformer le code météo en icône et texte
  const getWeatherInfo = (code) => {
    if (code === 0) return { icon: <Sun className="text-amber-400" size={24} />, text: "Ciel dégagé" };
    if (code >= 1 && code <= 3) return { icon: <Cloud className="text-slate-300" size={24} />, text: "Nuageux" };
    if (code >= 51 && code <= 67) return { icon: <CloudRain className="text-blue-400" size={24} />, text: "Pluvieux" };
    if (code >= 71 && code <= 77) return { icon: <Snowflake className="text-white" size={24} />, text: "Neige" };
    if (code >= 95) return { icon: <CloudLightning className="text-purple-400" size={24} />, text: "Orageux" };
    return { icon: <Cloud className="text-slate-400" size={24} />, text: "Inconnu" };
  };

  useEffect(() => {
    if (!address) {
      setError("Aucune adresse définie");
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        setLoading(true);
        // 1. Trouver les coordonnées GPS à partir de l'adresse
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(address)}&count=1&language=fr&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
          throw new Error("Adresse introuvable");
        }

        const { latitude, longitude, name } = geoData.results[0];

        // 2. Récupérer la météo avec ces coordonnées
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`);
        const weatherData = await weatherRes.json();

        setWeather({
          location: name,
          temp: weatherData.current.temperature_2m,
          humidity: weatherData.current.relative_humidity_2m,
          wind: weatherData.current.wind_speed_10m,
          code: weatherData.current.weather_code
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [address]);

  if (loading) return <div className="flex items-center gap-2 text-slate-400 p-4 bg-[#1e293b]/50 rounded-2xl"><Loader2 className="animate-spin" size={20}/> Chargement météo...</div>;
  if (error) return <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 text-xs">Météo : {error}</div>;
  if (!weather) return null;

  const info = getWeatherInfo(weather.code);

  return (
    <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Météo locale</h4>
          <p className="text-white font-bold text-sm">{weather.location}</p>
        </div>
        {info.icon}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0f172a]/50 p-3 rounded-xl border border-white/5 flex flex-col items-center">
          <Thermometer size={14} className="text-amber-500 mb-1" />
          <span className="text-white font-black">{weather.temp}°C</span>
        </div>
        <div className="bg-[#0f172a]/50 p-3 rounded-xl border border-white/5 flex flex-col items-center">
          <Droplets size={14} className="text-blue-500 mb-1" />
          <span className="text-white font-black">{weather.humidity}%</span>
        </div>
        <div className="bg-[#0f172a]/50 p-3 rounded-xl border border-white/5 flex flex-col items-center">
          <Wind size={14} className="text-teal-500 mb-1" />
          <span className="text-white font-black">{weather.wind} <span className="text-[9px]">km/h</span></span>
        </div>
      </div>
      <p className="text-center text-slate-400 text-xs font-medium mt-3">{info.text}</p>
    </div>
  );
}