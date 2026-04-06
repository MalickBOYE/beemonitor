import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Layout, MapPin, Phone, Loader2, Search, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddHiveModal({ onClose, onRefresh, onSuccess, isOpen }) {
  const [loading, setLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    alert_phone: '',
  });

  // --- LOGIQUE AUTO-COMPLÉTION ADRESSE (API GOUV) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.address.length > 3) {
        try {
          const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(formData.address)}&limit=5`);
          const data = await response.json();
          setAddressSuggestions(data.features || []);
        } catch (error) {
          console.error("Erreur API Adresse:", error);
        }
      } else {
        setAddressSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('hives').insert([
        {
          name: formData.name,      
          address: formData.address,
          alert_phone: formData.alert_phone,
          user_id: user.id
        }
      ]);

      if (error) throw error;

      toast.success('Ruche enregistrée avec succès !');
      
      if (onSuccess) onSuccess();
      if (onRefresh) onRefresh();
      
      onClose(); 
    }  finally {
      setLoading(false);
    }
  };

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Nouvelle <span className="text-amber-500">Ruche</span>
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* IDENTIFICATION */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
              <Layout size={14} className="text-amber-500" /> # Identification
            </label>
            <input
              required
              type="text"
              placeholder="Ex: Ruche Alpha 1"
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:border-amber-500/50 outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          {/* LOCALISATION AVEC SUGGESTIONS API */}
          <div className="relative">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
              <MapPin size={14} className="text-amber-500" /> @ Localisation
            </label>
            <div className="relative">
              <input
                required
                type="text"
                placeholder="Chercher une adresse..."
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:border-amber-500/50 outline-none transition-all"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Search size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600" />
            </div>
            
            {addressSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-6 py-4 text-left text-sm text-slate-300 hover:bg-amber-500 hover:text-black transition-all border-b border-white/5 last:border-none"
                    onClick={() => {
                      setFormData({ ...formData, address: suggestion.properties.label });
                      setAddressSuggestions([]);
                    }}
                  >
                    <div className="font-bold">{suggestion.properties.name}</div>
                    <div className="text-[10px] opacity-70 uppercase tracking-wider">{suggestion.properties.city} ({suggestion.properties.postcode})</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TÉLÉPHONE D'ALERTE */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
              <Phone size={14} className="text-amber-500" /> ! Téléphone d'alerte
            </label>
            <input
              required
              type="tel"
              placeholder="Ex: +33 6 12 34 56 78"
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:border-amber-500/50 outline-none transition-all"
              value={formData.alert_phone}
              onChange={(e) => setFormData({ ...formData, alert_phone: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-amber-500 hover:bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] mt-4 transition-all active:scale-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Traitement en cours...</span>
              </>
            ) : (
              'Enregistrer la ruche'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}