import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  Users, CheckCircle, XCircle, Box, MessageSquare, ImagePlus,
  ShieldAlert, ArrowLeft, GripVertical, Type, Save, Eye, X, Plus
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); 

  // Data States
  const [profiles, setProfiles] = useState([]);
  const [hives, setHives] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Éditeur States
  const [articleTitle, setArticleTitle] = useState('');
  const [blocks, setBlocks] = useState([{ id: Date.now().toString(), type: 'text', content: '', file: null }]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdminAuth) {
      if (activeTab === 'users') fetchProfiles();
      if (activeTab === 'hives') fetchHives();
      if (activeTab === 'messages') fetchMessages();
    }
  }, [activeTab, isAdminAuth]);

  // ==========================================
  // SÉCURITÉ
  // ==========================================
  async function checkAdminAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!profile?.is_admin) throw new Error("Non admin");

      setIsAdminAuth(true);
    } catch (err) {
      // console.error("Erreur Auth:", err); // DÉCOMMENTEZ POUR DEBUGGER LES REDIRECTIONS
      toast.error("Accès non autorisé.");
      navigate('/dashboard'); // C'est ici que ça redirigeait en cas d'erreur de base de données
    }
  }

  // ==========================================
  // VRAIS FETCHS (UTILISATEURS, RUCHES, MESSAGES)
  // ==========================================
  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setProfiles(data);
  }

  async function fetchHives() {
    const { data } = await supabase.from('hives').select('*').order('created_at', { ascending: false });
    if (data) setHives(data);
  }

  async function fetchMessages() {
    // Remplacer 'messages' par le vrai nom de votre table de contact si différent
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (data) setMessages(data);
  }

  // ==========================================
  // LOGIQUE ÉDITEUR & PUBLICATION RÉELLE
  // ==========================================
  const handlePublish = async () => {
    if(!articleTitle.trim()) return toast.error("Ajoutez un titre.");
    if(blocks.length === 0) return toast.error("L'article est vide.");
    
    setIsPublishing(true);
    const toastId = toast.loading("Publication en cours...");

    try {
      let processedBlocks = [];

      for (const block of blocks) {
        if (block.type === 'text') {
          processedBlocks.push({ id: block.id, type: 'text', content: block.content });
        } 
        else if (block.type === 'image' && block.file) {
          // 1. Upload l'image dans Supabase Storage (Bucket "images")
          const fileExt = block.file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, block.file);

          if (uploadError) throw uploadError;

          // 2. Récupérer l'URL publique
          const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

          processedBlocks.push({ id: block.id, type: 'image', url: urlData.publicUrl });
        }
      }

      // 3. Insérer dans la table "actualites"
      const { error: dbError } = await supabase.from('actualites').insert([{ 
        title: articleTitle, 
        blocks: processedBlocks 
      }]);

      if (dbError) throw dbError;

      toast.success("Article publié avec succès !", { id: toastId });
      
      // Reset
      setArticleTitle('');
      setBlocks([{ id: Date.now().toString(), type: 'text', content: '' }]);
      setIsPreview(false);

    } catch(err) {
      console.error(err);
      toast.error(`Erreur : ${err.message}`, { id: toastId });
    } finally {
      setIsPublishing(false);
    }
  };

  // --- Fonctions Drag & Drop ---
  const handleDragStart = (e, index) => { setDraggedIndex(index); };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);
    setBlocks(newBlocks);
  };

  if (!isAdminAuth) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto mb-8 flex items-center justify-between bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500 p-3 rounded-2xl">
            <ShieldAlert size={24} className="text-black" />
          </div>
          <h1 className="text-xl font-black uppercase italic leading-none tracking-tighter">Panneau <span className="text-amber-500">Admin</span></h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour App
        </button>
      </nav>

      {/* TABS */}
      <div className="max-w-7xl mx-auto mb-8 flex gap-2">
        {[
          { id: 'users', label: 'Utilisateurs', icon: <Users size={16}/> },
          { id: 'hives', label: 'Ruches', icon: <Box size={16}/> },
          { id: 'messages', label: 'Messages', icon: <MessageSquare size={16}/> },
          { id: 'publications', label: 'Publications', icon: <ImagePlus size={16}/> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* --- VRAI AFFICHAGE DES ONGLETS --- */}
      
      {activeTab === 'users' && (
        <div className="max-w-7xl mx-auto bg-slate-900/50 p-6 rounded-3xl border border-white/10">
           <table className="w-full text-left text-sm text-slate-300">
             <thead><tr className="border-b border-white/10 text-slate-500"><th className="pb-3">ID</th><th className="pb-3">Email</th><th className="pb-3">Admin</th></tr></thead>
             <tbody>
               {profiles.map(p => (
                 <tr key={p.id} className="border-b border-white/5">
                   <td className="py-3 font-mono text-xs">{p.id.substring(0,8)}...</td>
                   <td className="py-3">{p.email || "Non renseigné"}</td>
                   <td className="py-3">{p.is_admin ? <CheckCircle size={16} className="text-green-500"/> : <XCircle size={16} className="text-red-500"/>}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {activeTab === 'hives' && (
        <div className="max-w-7xl mx-auto bg-slate-900/50 p-6 rounded-3xl border border-white/10">
           <table className="w-full text-left text-sm text-slate-300">
             <thead><tr className="border-b border-white/10 text-slate-500"><th className="pb-3">Nom</th><th className="pb-3">Lieu</th><th className="pb-3">Propriétaire</th></tr></thead>
             <tbody>
               {hives.map(h => (
                 <tr key={h.id} className="border-b border-white/5">
                   <td className="py-3 font-bold text-white">{h.name}</td>
                   <td className="py-3">{h.location || "N/A"}</td>
                   <td className="py-3 font-mono text-xs">{h.user_id?.substring(0,8)}...</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="max-w-7xl mx-auto bg-slate-900/50 p-6 rounded-3xl border border-white/10">
           {messages.length === 0 ? <p className="text-slate-500 italic">Aucun message.</p> : (
             <div className="space-y-4">
               {messages.map(m => (
                 <div key={m.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                   <p className="text-amber-500 font-bold mb-2">{m.email}</p>
                   <p className="text-slate-300">{m.content}</p>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {/* --- ONGLET PUBLICATIONS --- */}
      {activeTab === 'publications' && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-900/50 border border-white/10 p-10 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Éditeur d'<span className="text-amber-500">Articles</span></h2>
              <button 
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white"
              >
                {isPreview ? "Mode Édition" : "Aperçu"}
              </button>
            </div>

            {isPreview ? (
              /* APERÇU */
              <div className="bg-white text-gray-900 p-10 rounded-2xl">
                <h1 className="text-4xl font-black mb-8">{articleTitle || "Titre..."}</h1>
                {blocks.map((block) => (
                  <div key={block.id} className="mb-6">
                    {block.type === 'text' && <p className="whitespace-pre-wrap">{block.content}</p>}
                    {block.type === 'image' && block.file && <img src={URL.createObjectURL(block.file)} alt="preview" className="w-full rounded-xl" />}
                  </div>
                ))}
              </div>
            ) : (
              /* ÉDITEUR */
              <div>
                <input 
                  type="text" 
                  placeholder="Titre de l'actualité..."
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-amber-500 mb-8 text-white text-xl"
                />

                <div className="space-y-4 mb-8">
                  {blocks.map((block, index) => (
                    <div 
                      key={block.id}
                      draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)}
                      className="flex bg-black/40 border border-white/10 rounded-2xl overflow-hidden"
                    >
                      <div className="w-10 bg-white/5 flex items-center justify-center cursor-grab border-r border-white/10 text-slate-500">
                        <GripVertical size={20} />
                      </div>
                      
                      <div className="flex-grow p-4">
                        {block.type === 'text' ? (
                          <textarea 
                            rows="3" 
                            placeholder="Texte du paragraphe..."
                            value={block.content}
                            onChange={(e) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                            className="w-full bg-transparent outline-none text-slate-200 resize-none"
                          />
                        ) : (
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setBlocks(blocks.map(b => b.id === block.id ? { ...b, file: e.target.files[0] } : b))}
                            className="text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400"
                          />
                        )}
                      </div>

                      <button onClick={() => setBlocks(blocks.filter(b => b.id !== block.id))} className="w-12 flex items-center justify-center text-red-500 hover:bg-red-500/10 border-l border-white/10">
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mb-10 pb-10 border-b border-white/10">
                  <button onClick={() => setBlocks([...blocks, { id: Date.now().toString(), type: 'text', content: '' }])} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:text-amber-500">
                    <Type size={14} /> Ajouter Texte
                  </button>
                  <button onClick={() => setBlocks([...blocks, { id: Date.now().toString(), type: 'image', file: null }])} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:text-amber-500">
                    <ImagePlus size={14} /> Ajouter Image
                  </button>
                </div>

                <div className="flex justify-end">
                  <button onClick={handlePublish} disabled={isPublishing} className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-black rounded-2xl font-black uppercase disabled:opacity-50">
                    {isPublishing ? "Publication..." : <><Save size={18} /> Mettre en ligne</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}