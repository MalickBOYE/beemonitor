import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Calendar, 
  Search, 
  Clock,
  UserCheck,
  ShieldAlert,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const ADMIN_EMAIL = 'admin@rucheconnectee.com';

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  async function checkAdminAndFetchData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== ADMIN_EMAIL) {
        toast.error("Accès non autorisé");
        navigate('/dashboard');
        return;
      }

      await fetchProfiles();
    } catch (error) {
      console.error("Erreur admin:", error);
    } finally {
      // Sécurité pour éviter le blocage infini de l'écran
      setLoading(false);
    }
  }

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      toast.error("Impossible de charger les profils");
      console.error(error);
    }
  }

  const handleUpdateStatus = async (userId, newStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(`Utilisateur ${newStatus === 'active' ? 'activé' : 'bloqué'}`);
      fetchProfiles();
    }
  };

  const filteredProfiles = profiles.filter(p => 
    `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* BARRE DE NAVIGATION ADMIN */}
      <nav className="max-w-7xl mx-auto mb-12 flex items-center justify-between bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
            <ShieldAlert size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase italic leading-none tracking-tighter">Panneau <span className="text-amber-500">Admin</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Session: {ADMIN_EMAIL}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase">
                <ArrowLeft size={16} /> Retour App
            </button>
            <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                <LogOut size={20} />
            </button>
        </div>
      </nav>

      {/* RECHERCHE ET STATS */}
      <div className="max-w-7xl mx-auto mb-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text"
            placeholder="Rechercher par nom ou email..."
            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-16 pr-6 outline-none focus:border-amber-500/50 transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Users size={20} /></div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase">Inscrits</p>
            <p className="text-xl font-black">{profiles.length}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl text-green-500"><UserCheck size={20} /></div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase">À Valider</p>
            <p className="text-xl font-black">{profiles.filter(p => p.status === 'pending').length}</p>
          </div>
        </div>
      </div>

      {/* TABLEAU DES MEMBRES */}
      <div className="max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Utilisateur</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">État du compte</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Dernière activité</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
                <tr><td colSpan="4" className="py-20 text-center text-slate-500 italic">Chargement sécurisé des profils...</td></tr>
            ) : filteredProfiles.length === 0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-slate-500 italic">Aucun profil trouvé.</td></tr>
            ) : filteredProfiles.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-amber-500 font-black shadow-inner">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white uppercase italic tracking-tighter">{user.first_name} {user.last_name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    user.status === 'active' ? 'bg-green-500/10 text-green-400' :
                    user.status === 'blocked' ? 'bg-red-500/10 text-red-400' :
                    'bg-amber-500/10 text-amber-400 animate-pulse'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      user.status === 'active' ? 'bg-green-400' :
                      user.status === 'blocked' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    {user.status || 'pending'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <Clock size={14} className="text-slate-600" />
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('fr-FR') : 'Inactif'}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {user.status !== 'active' && (
                      <button 
                        onClick={() => handleUpdateStatus(user.id, 'active')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black rounded-xl text-[10px] font-black uppercase transition-transform hover:scale-105"
                      >
                        <CheckCircle size={14} /> Valider
                      </button>
                    )}
                    {user.status !== 'blocked' && (
                      <button 
                        onClick={() => handleUpdateStatus(user.id, 'blocked')}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Bloquer"
                      >
                        <XCircle size={20} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}