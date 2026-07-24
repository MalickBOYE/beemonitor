import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Footer from '../components/Footer';

export default function ActualiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('actualites')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (err) {
        console.error("Erreur lors du chargement de l'article :", err.message);
        setError("Impossible de charger cet article.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchArticle();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1a3b47]" size={40} />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <p className="text-red-500 font-bold text-lg mb-4">{error || "Article introuvable."}</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-4 py-2 bg-[#1a3b47] text-white rounded-xl font-bold"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Barre de navigation simplifiée */}
      <nav className="bg-white px-8 py-4 shadow-sm sticky top-0 z-50 flex items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#1a3b47] font-bold hover:text-[#f3a600] transition-colors">
          <ArrowLeft size={20} /> Retour
        </button>
      </nav>

      {/* Largeur élargie avec max-w-5xl pour occuper plus d'espace */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-black text-[#1a3b47] mb-6 leading-tight">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-10 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} /> Publié le {new Date(article.created_at).toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* Rendu dynamique des blocs de l'article */}
        <div className="space-y-8">
          {article.blocks && article.blocks.map((block, index) => {
            if (block.type === 'text') {
              return <p key={block.id || index} className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{block.content}</p>;
            }
            if (block.type === 'image') {
              return (
                <div key={block.id || index} className="rounded-2xl overflow-hidden shadow-lg my-8 bg-gray-100 max-h-[600px] flex items-center justify-center">
                  <img src={block.url} alt="Illustration de l'article" className="w-full h-auto object-contain max-h-[600px]" />
                </div>
              );
            }
            return null;
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}