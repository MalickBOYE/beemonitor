import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { 
  ArrowLeft, Bluetooth, Wifi, Thermometer, Droplets, 
  Battery, Scale, Download, MapPin, Activity, Settings, 
  Trash2, AlertTriangle, CheckCircle, Eye, Zap 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Sous-composants
import BackgroundSlider from '../components/BackgroundSlider';
import Footer from '../components/Footer';
import HiveSettingsModal from '../components/HiveSettingsModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function HiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [hiveInfo, setHiveInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Nouveaux états IA et Alertes
  const [beeCount, setBeeCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  const last = data.length > 0 ? data[data.length - 1] : null;

  // --- 1. INITIALISATION & REALTIME (WiFi) ---
  useEffect(() => {
    loadInitialData();

    const channel = supabase.channel(`live_hive_${id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'measurements', 
          filter: `hive_id=eq.${id}` 
        }, 
        (payload) => {
          console.log("Nouvelle donnée reçue via WiFi:", payload.new);
          setData(prev => {
            const exists = prev.find(m => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          });
          
          // Vérification immédiate des seuils
          checkThresholds(payload.new);
          toast.success("Données synchronisées (Cloud)");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // --- 2. SURVEILLANCE INACTIVITÉ (1h15 = 75 mins) ---
  useEffect(() => {
    const checkInactivity = () => {
      if (!last) return;
      const lastUpdate = new Date(last.created_at).getTime();
      const now = new Date().getTime();
      const diffMinutes = (now - lastUpdate) / (1000 * 60);
      
      if (diffMinutes > 75) {
        setIsOffline(true);
      } else {
        setIsOffline(false);
      }
    };

    const interval = setInterval(checkInactivity, 30000); // Check toutes les 30s
    checkInactivity();
    return () => clearInterval(interval);
  }, [last]);

  // --- 3. ANALYSE SEUILS CRITIQUES ---
  const checkThresholds = (m) => {
    if (m.temp_int < 32) toast.error("TEMPÉRATURE CRITIQUE : < 32°C", { duration: 6000 });
    if (m.hum_int < 45) toast.error("HUMIDITÉ CRITIQUE : < 45%", { duration: 6000 });
    if (m.weight >= 80) toast.success("RÉCOLTE PRÊTE : 80kg atteints !", { icon: '🍯', duration: 10000 });
  };

  // --- 4. CHARGEMENT INITIAL ---
  async function loadInitialData() {
    setLoading(true);
    try {
      const { data: hive, error: hiveError } = await supabase
        .from('hives')
        .select('*')
        .eq('id', id)
        .single();

      if (hiveError) throw hiveError;
      setHiveInfo(hive);

      const { data: m, error: mError } = await supabase
        .from('measurements')
        .select('*')
        .eq('hive_id', id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (mError) throw mError;
      setData(m || []);
      
      // Lancer la détection IA après le chargement
      fetchBeeDetection();

    } catch (error) {
      console.error("Erreur de chargement:", error.message);
      toast.error("Erreur lors de la récupération");
    } finally {
      setLoading(false);
    }
  }

  // --- 5. VISION IA (Roboflow) ---
  const fetchBeeDetection = async () => {
    // Note: Remplace 'URL_DE_TON_IMAGE' par le lien de la photo prise par ton ESP32-CAM
    try {
      const response = await fetch(
        `https://detect.roboflow.com/bee_detection-9mugi/31?api_key=qxEfJm6Lz6pTmsrUpqzQ&image=URL_DE_TON_IMAGE_ESP32`
      );
      const result = await response.json();
      setBeeCount(result.predictions?.length || 0);
    } catch (err) {
      console.log("IA non disponible ou pas d'image");
    }
  };

  // --- 6. BLUETOOTH (Fonction Originale Restaurée) ---
  const connectBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({ 
        filters: [{ namePrefix: 'BeeMonitor' }], 
        optionalServices: ['environmental_sensing'] 
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('environmental_sensing');
      const characteristic = await service.getCharacteristic('temperature');
      
      setIsBleConnected(true);
      toast.success("Liaison Directe Bluetooth Active");

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (e) => {
        const raw = new TextDecoder().decode(e.target.value);
        const [temp, humi, weight, batt] = raw.split(',');
        
        const measure = { 
          id: Date.now(),
          hive_id: id, 
          temp_int: parseFloat(temp), 
          hum_int: parseFloat(humi), 
          weight: parseFloat(weight), 
          battery: parseFloat(batt), 
          created_at: new Date().toISOString() 
        };
        setData(prev => [...prev, measure]);
        checkThresholds(measure);
      });
    } catch (err) { 
      console.error(err);
      toast.error("Connexion Bluetooth échouée"); 
    }
  };

  // --- 7. EXPORT CSV (Fonction Originale Restaurée) ---
  const exportToCSV = () => {
    if (data.length === 0) {
        toast.error("Aucune donnée à exporter");
        return;
    }
    const headers = "Date,Heure,Poids(kg),Temp_Int(C),Humi_Int(%),Bat(%)\n";
    const csvContent = data.map(m => {
      const d = new Date(m.created_at);
      return `${d.toLocaleDateString()},${d.toLocaleTimeString()},${m.weight || 0},${m.temp_int || 0},${m.hum_int || 0},${m.battery || 0}`;
    }).join("\n");

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${hiveInfo?.name || 'Ruche'}_Export_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-amber-500 gap-4">
      <Activity className="animate-spin" size={32} />
      <span className="font-black tracking-[0.3em] text-[10px] uppercase">Liaison en cours...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-x-hidden font-sans">
      <Toaster position="top-right" />
      <BackgroundSlider />

      {/* --- NAVBAR --- */}
      <nav className="relative z-10 flex items-center justify-between px-4 md:px-8 py-6 backdrop-blur-md bg-black/20 border-b border-white/5">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest">
          <ArrowLeft size={18}/> Retour
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Badge de Statut Dynamique */}
          <div className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border ${isOffline ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'} text-[9px] font-black uppercase tracking-widest`}>
            {isOffline ? <AlertTriangle size={12}/> : <CheckCircle size={12}/>}
            {isOffline ? 'Ruche Déconnectée' : 'Système Online'}
          </div>

          <div className="flex gap-2 mr-2 md:mr-4 border-r border-white/10 pr-2 md:pr-4">
            <button onClick={() => setShowSettings(true)} className="p-2 md:p-3 bg-white/5 rounded-xl text-slate-400 hover:text-amber-500 transition-all border border-white/5" title="Paramètres">
              <Settings size={18} />
            </button>
            <button onClick={() => setShowDelete(true)} className="p-2 md:p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-all border border-white/5" title="Supprimer">
              <Trash2 size={18} />
            </button>
          </div>

          <button onClick={exportToCSV} className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black hover:bg-white/10 transition-all text-slate-300 uppercase tracking-widest">
            <Download size={14}/> CSV
          </button>
          
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 text-amber-500 font-black text-[9px] uppercase tracking-widest">
                <Wifi size={14} className={isOffline ? "" : "animate-pulse"} /> Cloud
              </div>
              <button onClick={connectBluetooth} className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${isBleConnected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>
                <Bluetooth size={14}/> {isBleConnected ? 'Direct' : 'Bluetooth'}
              </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12 w-full flex-grow">
        <div className="bg-slate-900/40 border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-16 backdrop-blur-3xl shadow-2xl">
          
          <div className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-8">
            <div>
              <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter text-amber-500 uppercase leading-tight">
                {hiveInfo?.name || "Sans Nom"}
              </h1>
              <p className="flex items-center gap-2 text-slate-500 text-[10px] md:text-xs font-bold uppercase mt-4 tracking-[0.3em]">
                <MapPin size={16} className="text-amber-500" /> {hiveInfo?.address || "Lieu non défini"}
              </p>
            </div>

            {/* Carte Vision IA Roboflow */}
            <div className="bg-black/40 border border-amber-500/30 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl w-full lg:w-auto">
              <div className="h-16 w-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                <Eye size={32} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Vision Intel (Roboflow)</span>
                <div className="text-3xl font-black text-white">{beeCount} <span className="text-sm text-amber-500 uppercase">Abeilles</span></div>
              </div>
            </div>
          </div>

          {/* Bannière Alerte Inactivité */}
          {isOffline && (
            <div className="mb-8 p-6 bg-red-500/20 border border-red-500/50 rounded-3xl flex items-center gap-4 text-red-200 animate-pulse">
              <AlertTriangle size={24} />
              <div>
                <p className="font-black uppercase text-xs tracking-widest">Alerte Électronique</p>
                <p className="text-sm opacity-80 font-medium">Aucun signal reçu depuis plus de 1h15. Vérifiez l'alimentation ou le signal WiFi.</p>
              </div>
            </div>
          )}

          {/* Grille des KPIs avec Alertes visuelles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
            <Kpi icon={<Scale/>} label="Masse" value={last?.weight} unit="kg" color="text-amber-400" alert={last?.weight >= 80} />
            <Kpi icon={<Thermometer/>} label="Interne" value={last?.temp_int} unit="°C" color="text-orange-500" alert={last?.temp_int < 32} />
            <Kpi icon={<Droplets/>} label="Humidité" value={last?.hum_int} unit="%" color="text-blue-400" alert={last?.hum_int < 45} />
            <Kpi icon={<Battery/>} label="Batterie" value={last?.battery} unit="%" color="text-emerald-500" />
          </div>

          {/* Graphique avec Tooltip stylisé */}
          <div className="bg-black/30 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-8 ml-4">
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-amber-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Flux de Données Temps Réel</h3>
              </div>
            </div>
            
            <div className="h-[350px] md:h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="created_at" 
                    tickFormatter={(str) => new Date(str).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                    stroke="#475569"
                    fontSize={9}
                    tickMargin={10}
                  />
                  <YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', fontSize: '11px'}} 
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                    itemStyle={{fontWeight: '900', textTransform: 'uppercase'}}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                  
                  <Line name="Poids" type="monotone" dataKey="weight" stroke="#fbbf24" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#fbbf24' }} />
                  <Line name="Temp" type="monotone" dataKey="temp_int" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line name="Humi" type="monotone" dataKey="hum_int" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showSettings && (
        <HiveSettingsModal 
          hive={hiveInfo} 
          onClose={() => setShowSettings(false)} 
          onRefresh={loadInitialData} 
        />
      )}
      
      {showDelete && (
        <DeleteConfirmModal 
          hive={hiveInfo} 
          onClose={() => setShowDelete(false)} 
          onDeleted={() => navigate('/dashboard')} 
        />
      )}
    </div>
  );
}

// Composant KPI amélioré pour gérer l'état d'alerte
const Kpi = ({ icon, label, value, unit, color, alert }) => (
  <div className={`bg-[#0f172a]/60 border ${alert ? 'border-red-500 animate-pulse' : 'border-white/5'} p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] hover:bg-white/5 transition-all group shadow-xl`}>
    <div className={`flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${alert ? 'text-red-500' : color} opacity-80 group-hover:opacity-100`}>
      {icon} {label}
    </div>
    <div className="text-2xl md:text-4xl font-black tracking-tighter">
      {value != null ? value : '--'}
      <span className="text-[10px] md:text-xs text-slate-500 ml-2 font-bold uppercase tracking-widest">{unit}</span>
    </div>
  </div>
);