import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    setLoading(true);

    try {
      // Met à jour le mot de passe de l'utilisateur connecté via le token de réinitialisation
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <h1 className="text-2xl font-black text-white text-center mb-2 uppercase italic tracking-tighter">
          Nouveau <span className="text-amber-500">mot de passe</span>
        </h1>
        <p className="text-slate-400 text-center text-xs mb-8 font-medium">
          Saisissez votre nouveau mot de passe ci-dessous.
        </p>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium italic flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-2xl text-sm font-medium text-center space-y-3">
            <CheckCircle size={32} className="mx-auto text-emerald-400" />
            <p>Mot de passe mis à jour avec succès ! Redirection vers la page de connexion...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Nouveau mot de passe" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Confirmer le mot de passe" 
                required 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-amber-500/10 transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? "Mise à jour..." : "Enregistrer le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}