import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Footer from '../components/Footer';

// Imports des images situées dans assets
import logo from '../assets/logo.png';
import sopra from '../assets/sopra.png';
import ruche from '../assets/Ruche.png';

export default function Home() {
  const navigate = useNavigate();
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActualites();
  }, []);

  const fetchActualites = async () => {
    try {
      const { data, error } = await supabase
        .from('actualites')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setActualites(data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des actualités :", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo La Ruche" className="h-10 w-auto" />
          <h1 className="text-xl font-bold text-[#1a3b47]">La Ruche Connectée</h1>
        </div>
        <div className="flex items-center gap-6">
          <a href="#accueil" className="text-[#1a3b47] font-bold hover:text-[#f3a600]">Accueil</a>
          <button onClick={() => navigate('/login')} className="bg-[#1a3b47] text-white font-bold py-2 px-6 rounded-md hover:bg-[#102730]">
            Connexion
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header id="accueil" className="bg-[#6c7d87] min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="bg-[#dee1e3] px-6 py-4 rounded-xl shadow-lg mb-10">
          <img src={sopra} alt="Sopra Steria" className="h-12 object-contain" />
        </div>
        <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
          Protéger les abeilles <br /> 
          grâce à la <span className="text-[#f3a600]">technologie</span>
        </h2>
        <p className="text-white text-lg md:text-xl max-w-2xl mb-12">
          Surveillez vos ruches à distance, en temps réel, et agissez pour la biodiversité avec notre solution connectée.
        </p>
        <button onClick={() => navigate('/dashboard')} className="bg-[#f3a600] hover:bg-[#d99400] text-[#1a3b47] font-black py-4 px-10 rounded-full shadow-xl transition-transform hover:scale-105 uppercase text-sm tracking-widest">
          Accéder à la plateforme
        </button>
      </header>

      {/* --- SECTION : LE MONDE FASCINANT DES ABEILLES --- */}
      <section className="py-20 px-8 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-4xl font-bold text-[#1a3b47] mb-6">Le monde fascinant des abeilles</h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            Les abeilles jouent un rôle crucial dans notre écosystème en tant que pollinisatrices. 
            Cependant, elles font face à de nombreux défis environnementaux. Comprendre leur comportement 
            est la première étape pour mieux les protéger et assurer la pérennité de leur colonie.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl">
          <img src="/images/abeille.jpg" alt="Le monde des abeilles" className="w-full h-auto object-cover" />
        </div>
      </section>

      {/* --- SECTION : NOTRE RUCHE CONNECTÉE --- */}
      <section className="py-20 px-8 bg-gray-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-4xl font-bold text-[#1a3b47] mb-6">Notre ruche connectée</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Notre solution intègre des capteurs de pointe pour mesurer en temps réel le poids, 
              la température et l'humidité interne de la ruche.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Grâce à cette technologie, l'apiculteur peut intervenir au moment opportun, 
              limitant le stress sur les abeilles et optimisant la production de miel.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img src={ruche} alt="Ruche Connectée" className="w-full h-auto object-cover" />
          </div>
        </div>
      </section>

      {/* --- SECTION : NOS OBJECTIFS --- */}
      <section className="py-20 px-8 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-[#1a3b47] mb-12 text-center">Nos objectifs</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {['Protection de la biodiversité', 'Innovation technologique', 'Accompagnement apicole'].map((item) => (
              <div key={item} className="p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-xl text-[#1a3b47] mb-4">{item}</h4>
                <p className="text-gray-500">Détails sur nos missions pour garantir un avenir meilleur pour nos colonies.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION : DERNIÈRES ACTUALITÉS (DYNAMIQUE) --- */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-[#1a3b47] mb-3">Dernières Actualités</h3>
          <p className="text-gray-600">Suivez nos avancées et les publications de terrain en direct.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#1a3b47]" size={36} />
          </div>
        ) : actualites.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Aucune actualité publiée pour le moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {actualites.map((actu) => {
              const firstImage = actu.blocks?.find(b => b.type === 'image')?.url;
              const firstText = actu.blocks?.find(b => b.type === 'text')?.content;

              return (
                <div 
                  key={actu.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 flex flex-col hover:shadow-xl transition-shadow"
                >
                  {firstImage && (
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img src={firstImage} alt={actu.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#f3a600] mb-2">
                      <Calendar size={14} /> {new Date(actu.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <h4 className="font-bold text-xl text-[#1a3b47] mb-3 leading-snug">{actu.title}</h4>
                    {firstText && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow">{firstText}</p>
                    )}
                    <Link
                      to={`/actualite/${actu.id}`}
                      className="inline-flex items-center gap-2 text-[#1a3b47] font-bold text-sm hover:text-[#f3a600] transition-colors mt-auto pt-4 border-t border-gray-100"
                    >
                      Lire la suite <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
}