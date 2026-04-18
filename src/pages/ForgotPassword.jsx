import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // IMPORTANT: Remplace par ton URL de production réelle
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
        <div className="bg-slate-900/50 border border-white/10 p-10 rounded-[2.5rem] max-w-md text-center">
          <CheckCircle2 className="mx-auto text-amber-500 mb-6" size={60} />
          <h2 className="text-2xl font-black uppercase mb-4">Vérifie tes mails</h2>
          <p className="text-slate-400 mb-8">Un lien de récupération a été envoyé à {email}. Pense à regarder tes spams.</p>
          <button onClick={() => navigate('/login')} className="text-amber-500 font-black uppercase text-[10px] tracking-widest">Retourner au login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Retour</span>
        </button>
        
        <h1 className="text-3xl font-black text-white mb-4 uppercase italic">Oubli ?</h1>
        <p className="text-slate-400 text-sm mb-8">Saisis ton email pour recevoir un lien de réinitialisation.</p>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}

        <form onSubmit={handleResetRequest} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="email" required placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white text-sm focus:border-amber-500/50 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest transition-all">
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
      </div>
    </div>
  );
}