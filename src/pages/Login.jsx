import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';

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
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      // Récupération du profil pour les droits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, is_approved')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.is_admin) {
        navigate('/admin-dashboard');
      } else if (!profile.is_approved) {
        await supabase.auth.signOut();
        setError("Votre compte est en attente de validation.");
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <h1 className="text-3xl font-black text-white text-center mb-10 uppercase">Connexion</h1>
        
        {error && <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm"><AlertCircle size={18} /> {error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <input type="email" placeholder="Email" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-amber-500/50" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-amber-500/50" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <button disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2">
            {loading ? 'Chargement...' : <><LogIn size={20}/> Se connecter</>}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Pas de compte ? <button onClick={() => navigate('/register')} className="text-amber-500 font-bold">Inscrivez-vous</button>
        </p>
      </div>
    </div>
  );
}