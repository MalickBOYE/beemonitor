import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Vérification des mots de passe
    if (formData.password !== formData.confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    setLoading(true);

    try {
      // 2. Inscription avec les métadonnées pour l'automatisme
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            is_approved: false 
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        alert("Inscription réussie ! Votre compte est en attente de validation par l'administrateur.");
        navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor original */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <button onClick={() => navigate('/login')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={14} /> Retour
        </button>

        <h1 className="text-3xl font-black text-white text-center mb-2 uppercase italic tracking-tighter">
          Créer un <span className="text-amber-500">Compte</span>
        </h1>
        <p className="text-slate-400 text-center text-sm mb-10 font-medium italic">Rejoignez le réseau des ruches connectées.</p>
        
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm italic font-medium">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" placeholder="Prénom" required 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white text-sm focus:outline-none focus:border-amber-500/50" 
                value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
              />
            </div>
            <div className="relative">
              <input 
                type="text" placeholder="Nom" required 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white text-sm focus:outline-none focus:border-amber-500/50" 
                value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
              />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="email" placeholder="Email" required 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white text-sm focus:outline-none focus:border-amber-500/50" 
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="tel" placeholder="Téléphone" required 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white text-sm focus:outline-none focus:border-amber-500/50" 
              value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="password" placeholder="Mot de passe" required 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white text-sm focus:outline-none focus:border-amber-500/50" 
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <div className="relative">
            <input 
              type="password" placeholder="Confirmer le mot de passe" required 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white text-sm focus:outline-none focus:border-amber-500/50" 
              value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 transition-all active:scale-95 uppercase text-[10px] tracking-widest mt-4"
          >
            {loading ? "Création..." : <><UserPlus size={18} /> Créer mon compte</>}
          </button>
        </form>
      </div>
    </div>
  );
}