import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Plus, LogOut, LayoutDashboard, Beaker, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Imports des composants
import HiveCard from '../components/HiveCard';
import BackgroundSlider from '../components/BackgroundSlider';
import Footer from '../components/Footer';
import AddHiveModal from '../components/AddHiveModal';
import logo from '../assets/logo.png';

export default function Dashboard() {
  const [hives, setHives] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();

    // Abonnement temps réel : On écoute les changements sur 'hives' ET 'measurements'
    // pour mettre à jour le statut en direct si une donnée arrive
    const channel = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hives' }, () => refreshData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'measurements' }, () => refreshData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Fonction pour rafraîchir sans relancer tout le chargement du profil
  async function refreshData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) fetchHives(user.id, profile?.is_admin);
  }

  async function fetchInitialData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const currentProfile = profileData || {
        first_name: user.user_metadata?.first_name || "Utilisateur",
        last_name: user.user_metadata?.last_name || "",
        is_admin: false
      };
      
      setProfile(currentProfile);
      await fetchHives(user.id, currentProfile.is_admin);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de chargement du dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function fetchHives(userId, isAdmin = false) {
    // On sélectionne la ruche ET la dernière mesure associée (limit 1)
    let query = supabase
      .from('hives')
      .select(`
        *,
        measurements (
          temp_int,
          hum_int,
          weight,
          created_at
        )
      `)
      // On demande de trier les mesures pour avoir la plus récente en premier
      .order('created_at', { foreignTable: 'measurements', ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Erreur fetchHives:", error);
    } else {
      // Pour chaque ruche, on calcule son statut "réel"
      const hivesWithStatus = (data || []).map(hive => {
        const lastM = hive.measurements?.[0]; // On prend la mesure la plus récente
        let status = "online";
        let alerts = [];

        if (lastM) {
          const diffMinutes = (new Date() - new Date(lastM.created_at)) / (1000 * 60);
          
          // 1. Check Inactivité (1h15 = 75 mins)
          if (diffMinutes > 75) status = "offline";

          // 2. Check Seuils Alertes
          if (lastM.temp_int < 32) alerts.push("Température basse");
          if (lastM.hum_int < 45) alerts.push("Humidité basse");
          if (lastM.weight >= 80) alerts.push("Récolte prête");
        } else {
          status = "no_data";
        }

        return { 
          ...hive, 
          status, 
          alerts,
          last_data: lastM 
        };
      });

      setHives(hivesWithStatus);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDeleteHive = async (e, hiveId) => {
    e.stopPropagation();
    if (window.confirm("Supprimer cette ruche ? Toutes les mesures associées seront perdues.")) {
      const { error } = await supabase.from('hives').delete().eq('id', hiveId);
      if (error) {
        toast.error("Action refusée ou erreur de serveur");
      } else {
        toast.success("Ruche supprimée");
        refreshData();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden font-sans">
      <Toaster position="top-right" />
      <BackgroundSlider />

      <nav className="relative z-20 flex items-center justify-between px-8 py-6 bg-slate-900/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <div className="flex flex-col">
            <h1 className="text-lg font-black uppercase tracking-tighter leading-none">Beemonitor</h1>
            <span className="text-[8px] text-amber-500 font-bold uppercase tracking-[0.3em]">
              {profile?.is_admin ? "Administration Mode" : "Live Intelligence"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-amber-500 hover:bg-white text-black font-black py-3 px-6 rounded-2xl transition-all uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus size={16} /> Ajouter une ruche
          </button>
          
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors p-2"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16 w-full flex-grow">
        <div className="mb-12">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Bienvenue <br />
            <span className="text-amber-500 flex items-center gap-3">
              {profile ? `${profile.first_name} ${profile.last_name}` : 'Chargement...'}
              {profile?.is_admin && <ShieldCheck className="text-emerald-500" size={32} title="Compte Administrateur" />}
            </span>
          </h2>
          <p className="text-slate-400 mt-4 font-medium italic flex items-center gap-2">
            <LayoutDashboard size={16} className="text-amber-500" />
            {profile?.is_admin 
              ? "Vue globale de toutes les ruches du réseau (Admin)." 
              : "Voici l'état actuel de votre rucher connecté."}
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {hives.length > 0 ? (
              hives.map((hive) => (
                <div key={hive.id} className="relative group">
                  {/* Petit badge d'état sur la carte */}
                  <div className={`absolute -top-3 -right-3 z-30 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl border ${
                    hive.status === 'offline' ? 'bg-red-500 border-red-400 text-white animate-pulse' : 
                    hive.alerts.length > 0 ? 'bg-orange-500 border-orange-400 text-white' : 
                    'bg-emerald-500 border-emerald-400 text-white'
                  }`}>
                    {hive.status === 'offline' ? 'Déconnectée' : hive.alerts.length > 0 ? 'Alerte' : 'En ligne'}
                  </div>

                  <HiveCard 
                    hive={hive} 
                    onNavigate={() => navigate(`/hive/${hive.id}`)}
                    onDelete={(e) => handleDeleteHive(e, hive.id)}
                  />
                  
                  {/* Overlay d'alerte si problème */}
                  {hive.alerts.length > 0 && hive.status !== 'offline' && (
                    <div className="absolute bottom-24 left-6 z-20 flex gap-2">
                       {hive.alerts.map((a, i) => (
                         <span key={i} className="bg-orange-500/20 backdrop-blur-md border border-orange-500/50 text-orange-500 text-[7px] font-bold px-2 py-1 rounded-md uppercase">
                           {a}
                         </span>
                       ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm">
                <Beaker size={40} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-500 italic">Aucune ruche enregistrée pour le moment.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      {showAddModal && (
        <AddHiveModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}