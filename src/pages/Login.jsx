import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Inscription réussie ! Vérifiez vos emails pour confirmer.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Effets de lumière en arrière-plan */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-block p-4 bg-amber-500 rounded-2xl mb-4 shadow-lg shadow-amber-500/20">
               <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
              {isSignUp ? 'Créer un compte' : 'Bon retour'}
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              {isSignUp ? 'Rejoignez la révolution de l\'apiculture connectée.' : 'Accédez à vos ruchers en temps réel.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* LIEN MOT DE PASSE OUBLIÉ */}
            {!isSignUp && (
              <div className="flex justify-end px-2">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all transform active:scale-95 shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              {loading ? 'Chargement...' : isSignUp ? <><UserPlus size={20}/> S'inscrire</> : <><LogIn size={20}/> Se connecter</>}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-8">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-400 hover:text-amber-500 text-sm font-medium transition-colors"
            >
              {isSignUp ? 'Déjà un compte ? Connectez-vous' : 'Pas encore de compte ? Inscrivez-vous'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}