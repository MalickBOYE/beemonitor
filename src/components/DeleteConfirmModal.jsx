import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeleteConfirmModal({ hive, onClose, onRefresh, onDeleted }) {
  const handleDelete = async () => {
    const { error } = await supabase.from('hives').delete().eq('id', hive.id);
    if (error) {
      toast.error("Impossible de supprimer la ruche");
    } else {
      toast.success("Ruche supprimée avec succès");
      onRefresh ? onRefresh() : onDeleted();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-red-950/20 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-red-500/20 w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-500" size={40} />
        </div>
        <h3 className="text-xl font-black text-white mb-2 uppercase">Supprimer la ruche ?</h3>
        <p className="text-slate-400 text-sm mb-8 font-medium">Cette action est irréversible. Toutes les mesures de <span className="text-white">"{hive.location}"</span> seront perdues.</p>
        
        <div className="flex flex-col gap-3">
          <button onClick={handleDelete} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest">
            <Trash2 size={18}/> Confirmer la suppression
          </button>
          <button onClick={onClose} className="w-full bg-white/5 text-slate-400 font-black py-4 rounded-2xl hover:text-white transition-all uppercase tracking-widest">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}