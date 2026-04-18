import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, Mail } from 'lucide-react';
import BackgroundSlider from '../components/BackgroundSlider';

export default function PendingValidation() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <BackgroundSlider />
      
      <div className="relative z-10 bg-slate-900/60 border border-white/10 backdrop-blur-2xl p-12 rounded-[3rem] max-w-lg text-center shadow-2xl">
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Clock size={40} className="text-amber-500" />
        </div>

        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4">
          Compte en <span className="text-amber-500">Attente</span>
        </h1>
        
        <p className="text-slate-400 font-medium leading-relaxed mb-8">
          Bienvenue ! Votre demande d'inscription a bien été reçue. Un administrateur doit valider votre accès avant que vous puissiez gérer vos ruches.
        </p>

        <div className="bg-black/20 rounded-2xl p-6 mb-8 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 italic">Besoin d'aide ?</p>
          <a href="mailto:admin@rucheconnectee.com" className="text-amber-500 font-bold hover:underline flex items-center justify-center gap-2">
            <Mail size={16} /> admin@rucheconnectee.com
          </a>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 mx-auto text-slate-500 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest"
        >
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>
    </div>
  );
}