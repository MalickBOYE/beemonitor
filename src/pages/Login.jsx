import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (authError) throw authError;
      
      // Connexion réussie -> Vers le dashboard
      navigate('/dashboard');

    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
      
      <div className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <h1 className="text-3xl font-black text-white text-center mb-10 uppercase italic tracking-tighter">Connexion</h1>
        
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium italic flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="email" placeholder="Email" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white text-sm focus:outline-none focus:border-amber-500/50" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="password" placeholder="Mot de passe" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white text-sm focus:outline-none focus:border-amber-500/50" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <button disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-amber-500/10 transition-all active:scale-95">
            {loading ? "Chargement..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-400 text-sm mb-4">Nouveau ?</p>
          <button 
            type="button"
            onClick={() => navigate('/register')} 
            className="text-amber-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}