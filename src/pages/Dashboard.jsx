import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LayoutDashboard, ShieldCheck, MessageSquare, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import HiveCard from '../components/HiveCard';
import BackgroundSlider from '../components/BackgroundSlider';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';

// IMPORTATION DU MODAL
import AddHiveModal from "../components/AddHiveModal";
import CommunitySpace from '../components/CommunitySpace';

export default function Dashboard() {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserRole();
    fetchHives();

    const channel = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'measurements' }, () => fetchHives())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // VÉRIFICATION DU RÔLE DE L'UTILISATEUR (OPTION A)
  async function checkUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Erreur lors de la récupération du profil:", error);
          setIsAdmin(false);
          return;
        }

        // Vérifie si la colonne is_admin est true OU si le champ role vaut 'admin'
        if (profile && (profile.is_admin === true || profile.role === 'admin')) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification des droits:", err);
      setIsAdmin(false);
    }
  }

  async function fetchHives() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hives')
        .select('*, measurements(temp_int, hum_int, weight, created_at)')
        .order('created_at', { foreignTable: 'measurements', ascending: false });

      if (error) throw error;

      const hivesWithStatus = (data || []).map(hive => {
        const lastM = hive.measurements?.[0];
        let status = lastM ? "online" : "no_data";
        let alerts = [];
        
        if (lastM) {
          const diffMinutes = (new Date() - new Date(lastM.created_at)) / (1000 * 60);
          if (diffMinutes > 75) status = "offline";
          if (lastM.temp_int < 32) alerts.push("Température basse");
          if (lastM.hum_int < 45) alerts.push("Humidité basse");
        }
        
        return { ...hive, status, alerts, last_data: lastM };
      });

      setHives(hivesWithStatus);
    } catch (e) {
      console.error("DÉTAIL ERREUR SUPABASE:", e);
      toast.error("Erreur lors du chargement des ruches");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative font-sans">
      <Toaster position="top-right" />
      <BackgroundSlider />

      <nav className="relative z-20 flex items-center justify-between px-8 py-6 bg-slate-900/40 backdrop-blur-xl border-b border-white/5">
        <div 
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <div className="flex flex-col">
            <h1 className="text-lg font-black uppercase tracking-tighter leading-none">La ruche connectée</h1>
            <span className="text-[8px] text-amber-500 font-bold uppercase tracking-[0.3em]">une solution pour le bien etre des abeilles</span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/login')} 
          className="text-slate-400 hover:text-amber-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all"
        >
          <ShieldCheck size={16} /> Administration
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16 w-full flex-grow">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Bienvenue dans le <br />
              <span className="text-amber-500">monde des abeilles.</span>
            </h2>
            <p className="text-slate-400 mt-4 font-medium italic flex items-center gap-2">
              <LayoutDashboard size={16} className="text-amber-500" />
              Suivi en temps réel de notre rucher connecté.
            </p>
          </div>
          
          {/* Le bouton d'ajout s'affiche UNIQUEMENT si isAdmin est true */}
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-500 hover:bg-white text-black font-black py-3 px-6 rounded-2xl transition-all uppercase text-[10px] tracking-widest flex items-center gap-2"
            >
              <Plus size={16} /> Ajouter une ruche
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {hives.map((hive) => (
              <div key={hive.id} className="flex flex-col gap-3">
                <HiveCard 
                  hive={hive} 
                  onNavigate={() => navigate(`/hive/${hive.id}`)} 
                  onDelete={() => {}} 
                />
                <span className="text-[10px] text-slate-500 text-center uppercase tracking-wider font-medium">
                  Appuyez sur la carte pour voir l'analyse détaillée
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="text-amber-500" />
            <h3 className="font-black uppercase tracking-widest text-sm">Espace Communauté</h3>
          </div>
          <textarea 
            id="communaute-comment"
            name="communaute-comment"
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-amber-500/50 outline-none transition-all"
            placeholder="Partagez votre ressenti sur le rucher..."
          />
          <button className="mt-4 bg-amber-500 hover:bg-white text-black font-black py-3 px-8 rounded-2xl transition-all uppercase text-[10px] tracking-widest">
            Publier
          </button>
        </div>
        <CommunitySpace />
      </main>
      
      <AddHiveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchHives} 
      />

      <Footer />
    </div>
  );
}