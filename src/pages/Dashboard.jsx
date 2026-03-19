import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Plus, User, LogOut, ShieldAlert } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Composants
import HiveCard from '../components/HiveCard';
import BackgroundSlider from '../components/BackgroundSlider';
import Footer from '../components/Footer';
import AddHiveModal from '../components/AddHiveModal';

export default function Dashboard() {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    
    // Temps réel pour les ruches
    const channel = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hives' }, () => fetchHives())
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, []);

  async function loadUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // 1. Récupérer le profil (Nom, Prénom, Rôle)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      // 2. Récupérer les ruches
      await fetchHives();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHives() {
    const { data } = await supabase
      .from('hives')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setHives(data);
  }

  const handleDelete = async (e, hive) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer définitivement la ruche "${hive.name}" ?`)) {
      const { error } = await supabase.from('hives').delete().eq('id', hive.id);
      if (!error) toast.success("Ruche supprimée");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-x-hidden">
      <Toaster position="bottom-center" />
      <BackgroundSlider />

      {/* Barre de Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="h-14 w-14 object-contain" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none text-amber-500">Bee Monitor</h1>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">Utilisateur</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={() => setShowAddModal(true)} className="bg-white/5 hover:bg-amber-500 hover:text-black border border-white/10 p-3 rounded-xl transition-all">
            <Plus size={20} />
          </button>
          <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-xl border border-red-500/20 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12 w-full flex-grow">
        
        {/* SECTION BIENVENUE PERSONNALISÉE */}
        <header className="mb-12">
          {profile?.is_admin ? (
            <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-3xl flex items-start gap-4 animate-pulse">
              <ShieldAlert className="text-red-500 shrink-0" size={32} />
              <div>
                <h2 className="text-xl font-black text-red-500 uppercase tracking-tighter">Accès Administrateur</h2>
                <p className="text-red-200/70 text-sm italic">Attention ! Vos actions peuvent être irréversibles.</p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter">
                Bienvenue, <span className="text-amber-500">{profile?.first_name || 'Ami'}</span>
              </h2>
              <p className="text-slate-400 mt-2 font-medium tracking-wide">
                {profile?.first_name} {profile?.last_name} — Voici l'état de vos ruchers.
              </p>
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hives.length > 0 ? (
              hives.map((hive) => (
                <HiveCard 
                  key={hive.id} 
                  hive={hive} 
                  onNavigate={(id) => navigate(`/hive/${id}`)} 
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                <p className="text-slate-500 italic">Aucune ruche enregistrée pour le moment.</p>
                <button onClick={() => setShowAddModal(true)} className="mt-4 text-amber-500 font-bold hover:underline">
                  Ajouter ma première ruche
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      {showAddModal && <AddHiveModal onClose={() => setShowAddModal(false)} onRefresh={fetchHives} />}
    </div>
  );
}