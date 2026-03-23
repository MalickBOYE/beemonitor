import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { 
  ArrowLeft, Bluetooth, Wifi, Thermometer, Droplets, 
  Battery, Scale, Download, MapPin, Activity, Settings, Trash2 
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

  // Correction : On utilise les noms de colonnes de la base de données
  const last = data.length > 0 ? data[data.length - 1] : null;

  useEffect(() => {
    loadInitialData();

    // ECOUTE CLOUD (WIFI)
    const channel = supabase.channel(`live_hive_${id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
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
          toast.success("Ruche mise à jour (WiFi)");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

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

    } catch (error) {
      console.error("Erreur de chargement:", error.message);
      toast.error("Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  }

  // --- BLUETOOTH ---
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
          hive_id: id, 
          temp_int: parseFloat(temp), 
          hum_int: parseFloat(humi), 
          weight: parseFloat(weight), 
          battery: parseFloat(batt), 
          created_at: new Date().toISOString() 
        };
        setData(prev => [...prev, measure]);
      });
    } catch (err) { 
      console.error(err);
      toast.error("Connexion Bluetooth échouée"); 
    }
  };

  // --- EXPORT fichier CSV ---
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
      <Toaster position="bottom-center" />
      <BackgroundSlider />

      <nav className="relative z-10 flex items-center justify-between px-4 md:px-8 py-6 backdrop-blur-md bg-black/20 border-b border-white/5">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest">
          <ArrowLeft size={18}/> Retour
        </button>

        <div className="flex items-center gap-2 md:gap-4">
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
                <Wifi size={14} className="animate-pulse" /> Cloud
              </div>
              <button onClick={connectBluetooth} className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${isBleConnected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>
                <Bluetooth size={14}/> {isBleConnected ? 'Direct' : 'Bluetooth'}
              </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12 w-full flex-grow">
        <div className="bg-slate-900/40 border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-16 backdrop-blur-3xl shadow-2xl">
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter text-amber-500 uppercase leading-tight">
              {hiveInfo?.name || "Sans Nom"}
            </h1>
            <p className="flex items-center gap-2 text-slate-500 text-[10px] md:text-xs font-bold uppercase mt-4 tracking-[0.3em]">
              <MapPin size={16} className="text-amber-500" /> {hiveInfo?.address || "Lieu non défini"}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
            <Kpi icon={<Scale/>} label="Masse" value={last?.weight} unit="kg" color="text-amber-400" />
            <Kpi icon={<Thermometer/>} label="Interne" value={last?.temp_int} unit="°C" color="text-orange-500" />
            <Kpi icon={<Droplets/>} label="Humidité" value={last?.hum_int} unit="%" color="text-blue-400" />
            <Kpi icon={<Battery/>} label="Batterie" value={last?.battery} unit="%" color="text-emerald-500" />
          </div>

          <div className="bg-black/30 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-8 ml-4">
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-amber-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Live Data Analytics</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {data.length} points enregistrés
              </span>
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

const Kpi = ({ icon, label, value, unit, color }) => (
  <div className="bg-[#0f172a]/60 border border-white/5 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] hover:bg-white/5 transition-all group shadow-xl">
    <div className={`flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${color} opacity-80 group-hover:opacity-100`}>
      {icon} {label}
    </div>
    <div className="text-2xl md:text-4xl font-black tracking-tighter">
      {value != null ? value : '--'}
      <span className="text-[10px] md:text-xs text-slate-500 ml-2 font-bold uppercase tracking-widest">{unit}</span>
    </div>
  </div>
);