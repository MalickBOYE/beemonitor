import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Plus, LogOut, LayoutDashboard, Beaker, ShieldCheck } from 'lucide-react';
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

    // Abonnement temps réel
    const channel = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hives' }, () => fetchHives())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchInitialData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // 1. Récupérer le profil réel depuis la table 'profiles'
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      } else {
        // Backup si le profil n'est pas encore créé par le trigger
        setProfile({
          first_name: user.user_metadata?.first_name || "Utilisateur",
          last_name: user.user_metadata?.last_name || "",
          is_admin: false
        });
      }

      // 2. Charger les ruches (en passant l'ID user et le statut admin)
      await fetchHives(user.id, profileData?.is_admin);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de chargement du dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function fetchHives(userId, isAdmin = false) {
    let query = supabase.from('hives').select('*');

    // SI l'utilisateur n'est PAS admin, on ne lui montre que SES ruches
    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erreur fetchHives:", error);
    } else {
      setHives(data || []);
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
        // On rafraîchit avec les données actuelles
        const { data: { user } } = await supabase.auth.getUser();
        fetchHives(user.id, profile?.is_admin);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
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
                <HiveCard 
                  key={hive.id} 
                  hive={hive} 
                  onNavigate={() => navigate(`/hive/${hive.id}`)}
                  onDelete={(e) => handleDeleteHive(e, hive.id)}
                />
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
          onSuccess={async () => {
            const { data: { user } } = await supabase.auth.getUser();
            fetchHives(user.id, profile?.is_admin);
            setShowAddModal(false);
            toast.success("Ruche ajoutée !");
          }}
        />
      )}
    </div>
  );
}