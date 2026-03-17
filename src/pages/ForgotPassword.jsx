import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // C'est l'adresse de ton site sur Vercel ou localhost
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) toast.error(error.message);
    else toast.success("Email de récupération envoyé !");
    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
      <Toaster />
      <form onSubmit={handleReset} className="bg-slate-900 p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md">
        <h2 className="text-3xl font-black italic uppercase mb-6 tracking-tighter">Réinitialiser</h2>
        <input 
          type="email" 
          placeholder="Ton email" 
          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 mb-4"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">
          {loading ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>
    </div>
  );
}