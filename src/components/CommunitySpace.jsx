import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MessageSquare, Send, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommunitySpace() {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // --- CHARGER LES MESSAGES ---
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des posts:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // --- PUBLIER UN NOUVEAU MESSAGE ---
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      // 1. Récupérer l'utilisateur connecté pour l'associer au post
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Vous devez être connecté pour publier.");
        setLoading(false);
        return;
      }

      // 2. Insérer le message dans Supabase
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            content: content,
            user_id: user.id,
            user_email: user.email // Stockage temporaire de l'email pour l'affichage
          }
        ]);

      if (error) throw error;

      toast.success("Message publié !");
      setContent(''); // Vide le textarea
      fetchPosts();   // Recharge instantanément la liste pour afficher le nouveau message !
    } catch (error) {
      console.error("Erreur de publication:", error);
      toast.error("Impossible de publier le message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a]/80 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md space-y-8">
      
      {/* EN-TÊTE DE LA SECTION */}
      <div className="flex items-center gap-3">
        <MessageSquare className="text-amber-500" size={24} />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
          Espace Communauté
        </h3>
      </div>

      {/* FORMULAIRE DE PUBLICATION */}
      <form onSubmit={handlePublish} className="space-y-4">
        <textarea
          required
          rows="3"
          placeholder="Partagez vos observations ou posez une question à la communauté..."
          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:border-amber-500/50 outline-none transition-all resize-none placeholder:text-slate-600 text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-amber-500 hover:bg-white text-black px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              <span>Publication...</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>Publier</span>
            </>
          )}
        </button>
      </form>

      {/* SÉPARATEUR VISUEL */}
      <hr className="border-white/5" />

      {/* FIL DES MESSAGES DE LA COMMUNAUTÉ */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
          Discussions récentes
        </h4>

        {fetching ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="animate-spin" size={16} />
            <span>Chargement des messages...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-slate-600 text-sm italic">
            Aucun message pour le moment. Soyez le premier à écrire !
          </div>
        ) : (
          posts.map((post) => (
            <div 
              key={post.id} 
              className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              {/* Infos de l'auteur */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <User size={12} className="text-amber-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    {post.user_email ? post.user_email.split('@')[0] : 'Apiculteur'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-600 uppercase font-semibold">
                  {new Date(post.created_at).toLocaleDateString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Contenu du message */}
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {post.content}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}