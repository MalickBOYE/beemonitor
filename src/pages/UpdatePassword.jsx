import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) toast.error(error.message);
    else {
      toast.success("Mot de passe mis à jour !");
      navigate('/login');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-white text-center">
      <form onSubmit={handleUpdate} className="bg-slate-900 p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md">
        <h2 className="text-3xl font-black italic uppercase mb-6 tracking-tighter text-amber-500">Nouveau mot de passe</h2>
        <input 
          type="password" 
          placeholder="Nouveau mot de passe" 
          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 mb-4 text-white"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">
          Mettre à jour
        </button>
      </form>
    </div>
  );
}