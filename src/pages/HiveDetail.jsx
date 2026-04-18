import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Legend, CartesianGrid 
} from 'recharts';
import { 
  ArrowLeft, Bluetooth, Wifi, MapPin, Activity, Settings, 
  Trash2, Download, CheckCircle, Moon, WifiOff, Eye 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Sous-composants
import BackgroundSlider from '../components/BackgroundSlider';
import Footer from '../components/Footer';
import HiveSettingsModal from '../components/HiveSettingsModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import WeatherWidget from '../components/WeatherWidget';
import HiveStats from '../components/HiveStats'; // Utilisation du composant dédié
import { getBeeCount } from '../services/beeCount';

export default function HiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [hiveInfo, setHiveInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [beeCount, setBeeCount] = useState(0);
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [now, setNow] = useState(new Date());

  const last = data.length > 0 ? data[data.length - 1] : null;

  // Rafraîchissement horloge pour le statut
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- LOGIQUE IA ---
  const analyzeBees = useCallback(async (imageUrl, measurementId) => {
    if (!imageUrl) return;
    try {
      const count = await getBeeCount(imageUrl);
      setBeeCount(count);
      await supabase.from('measurements').update({ bee_count: count }).eq('id', measurementId);
    } catch (err) {
      console.error("IA Error:", err);
    }
  }, []);

  // --- CHARGEMENT ---
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: hive } = await supabase.from('hives').select('*').eq('id', id).single();
      setHiveInfo(hive);

      const { data: m } = await supabase.from('measurements')
        .select('*').eq('hive_id', id).order('created_at', { ascending: true }).limit(100);
      
      setData(m || []);
      if (m?.[m.length - 1]?.bee_count) setBeeCount(m[m.length - 1].bee_count);
    } catch (error) {
      toast.error("Erreur de liaison");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInitialData();
    const channel = supabase.channel(`live_hive_${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'measurements', filter: `hive_id=eq.${id}` }, 
      (payload) => {
        setData(prev => [...prev, payload.new].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
        if (payload.new.image_url) analyzeBees(payload.new.image_url, payload.new.id);
        toast.success("Synchronisation Cloud");
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, loadInitialData, analyzeBees]);

  // --- ACTIONS ---
  const exportToCSV = () => {
    if (data.length === 0) return toast.error("Aucune donnée");
    const headers = "Date,Heure,Poids(kg),Temp_Int(C),Temp_Ext(C),Humi_Int(%),Humi_Ext(%),Abeilles\n";
    const csvContent = data.map(m => {
      const d = new Date(m.created_at);
      return `${d.toLocaleDateString()},${d.toLocaleTimeString()},${m.weight},${m.temp_int},${m.temp_ext},${m.hum_int},${m.hum_ext},${m.bee_count}`;
    }).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${hiveInfo?.name}_Export.csv`);
    link.click();
  };

  const connectBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({ 
        filters: [{ namePrefix: 'BeeMonitor' }], 
        optionalServices: ['environmental_sensing'] 
      });
      await device.gatt.connect();
      setIsBleConnected(true);
      toast.success("Liaison Directe Active");
    } catch (err) { toast.error("Échec Bluetooth"); }
  };

  // --- GESTION DU STATUT (DYNAMIQUE) ---
  const getStatus = () => {
    if (!last) return { label: "Inactif", color: "text-slate-500", icon: <WifiOff size={12}/> };
    const diff = (now - new Date(last.created_at)) / 60000;
    const hour = now.getHours();
    const isNight = hour >= 21 || hour <= 7;

    if (diff < 45) return { label: "Online", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/50", icon: <CheckCircle size={12}/> };
    if (isNight) return { label: "Sommeil", color: "text-blue-400 bg-blue-500/10 border-blue-500/50", icon: <Moon size={12}/> };
    return { label: "Offline", color: "text-red-400 bg-red-500/10 border-red-500/50", icon: <WifiOff size={12}/> };
  };

  const status = getStatus();

  if (loading) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-amber-500 gap-4">
      <Activity className="animate-spin" size={32} />
      <span className="font-black tracking-[0.3em] text-[10px] uppercase">Liaison en cours...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
      <Toaster position="top-right" />
      <BackgroundSlider />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-black/20 border-b border-white/5">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white uppercase text-[10px] font-black tracking-widest transition-all">
          <ArrowLeft size={18}/> Retour
        </button>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${status.color} text-[9px] font-black uppercase tracking-widest`}>
            {status.icon} {status.label}
          </div>

          <div className="flex gap-2 border-r border-white/10 pr-4">
            <button onClick={() => setShowSettings(true)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-amber-500 transition-all border border-white/5"><Settings size={18}/></button>
            <button onClick={() => setShowDelete(true)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-all border border-white/5"><Trash2 size={18}/></button>
          </div>

          <button onClick={exportToCSV} className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black hover:bg-white/10 transition-all text-slate-300 uppercase tracking-widest">
            <Download size={14}/> CSV
          </button>
          
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-2 px-4 py-2 text-amber-500 font-black text-[9px] uppercase tracking-widest">
              <Wifi size={14} className={status.label === "Online" ? "animate-pulse" : ""} /> Cloud
            </div>
            <button onClick={connectBluetooth} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${isBleConnected ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              <Bluetooth size={14}/> {isBleConnected ? 'Direct' : 'BT'}
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12 w-full flex-grow">
        <div className="bg-slate-900/40 border border-white/10 rounded-[3.5rem] p-16 backdrop-blur-3xl shadow-2xl">
          
          <div className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-8">
            <div>
              <h1 className="text-7xl font-black italic text-amber-500 uppercase leading-none mb-4 tracking-tighter">{hiveInfo?.name}</h1>
              <p className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <MapPin size={16} className="text-amber-500" /> {hiveInfo?.address}
              </p>
              {hiveInfo && <div className="mt-8"><WeatherWidget lat={hiveInfo.latitude} lng={hiveInfo.longitude} /></div>}
            </div>

            <div className="bg-black/40 border border-amber-500/30 p-8 rounded-[2.5rem] flex items-center gap-8 shadow-xl">
              <div className="h-16 w-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500"><Eye size={32} /></div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">IA Vision Analysis</span>
                <div className="text-4xl font-black text-white">{beeCount} <span className="text-sm text-amber-500">ABEILLES</span></div>
              </div>
            </div>
          </div>

          {/* COMPOSANT KPI DES CAPTEURS ARDUINO AVEC ALERTES */}
          <HiveStats lastData={last} />

          <div className="bg-black/30 rounded-[2.5rem] p-10 border border-white/5 h-[500px]">
            <div className="flex items-center gap-3 mb-8 ml-4">
              <Activity size={18} className="text-amber-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Flux de données</h3>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="created_at" 
                  tickFormatter={(t) => new Date(t).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})} 
                  stroke="#475569" fontSize={10} 
                />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background: '#0f172a', border: 'none', borderRadius: '15px'}} labelFormatter={(l) => new Date(l).toLocaleString('fr-FR')} />
                <Legend verticalAlign="top" align="right" />
                <Line name="Poids" type="monotone" dataKey="weight" stroke="#fbbf24" strokeWidth={4} dot={false} />
                <Line name="Temp Int" type="monotone" dataKey="temp_int" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line name="Temp Ext" type="monotone" dataKey="temp_ext" stroke="#fb7185" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line name="Humi Int" type="monotone" dataKey="hum_int" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line name="Humi Ext" type="monotone" dataKey="hum_ext" stroke="#818cf8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
      <Footer />
      {showSettings && <HiveSettingsModal hive={hiveInfo} onClose={() => setShowSettings(false)} onRefresh={loadInitialData} />}
      {showDelete && <DeleteConfirmModal hive={hiveInfo} onClose={() => setShowDelete(false)} onDeleted={() => navigate('/dashboard')} />}
    </div>
  );
}