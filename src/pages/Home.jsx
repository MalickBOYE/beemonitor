import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, TrendingUp, Users, ArrowRight, ChevronRight, Hexagon } from 'lucide-react';

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1587049352847-81a56d773c1c?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1588614959060-4d144f28b207?q=80&w=2140&auto=format&fit=crop"
];

export default function Home() {
  const navigate = useNavigate();
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <Hexagon className="text-amber-500" size={32} fill="currentColor" fillOpacity={0.2} />
          <div className="flex flex-col">
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none text-white">Beemonitor</h1>
            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-[0.3em]">Live Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            Connexion Admin
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-amber-500 hover:bg-white text-black font-black py-2.5 px-6 rounded-xl transition-all uppercase text-[10px] md:text-xs tracking-widest shadow-lg shadow-amber-500/20"
          >
            Accéder à la plateforme
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        {CAROUSEL_IMAGES.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImg ? 'opacity-40' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] mb-8">
            L'avenir de <br/>
            <span className="text-amber-500">l'apiculture</span> connectée.
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium">
            Surveillez le poids, la température et l'humidité de vos ruches en temps réel. 
            Une solution moderne pour garantir la santé de vos colonies.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="bg-amber-500 hover:bg-white text-black font-black py-4 px-8 rounded-2xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/20"
          >
            Voir les données du rucher <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* OBJECTIFS */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Pourquoi <span className="text-amber-500">Beemonitor</span> ?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon={<Activity size={32} />} title="Temps Réel" desc="Suivi continu synchronisé instantanément sur votre tableau de bord." />
          <FeatureCard icon={<Shield size={32} />} title="Prévention" desc="Analysez l'humidité et la température pour détecter les anomalies." />
          <FeatureCard icon={<TrendingUp size={32} />} title="Productivité" desc="Surveillez le poids pour planifier vos récoltes sereinement." />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black/50 mt-20 text-center">
        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Beemonitor. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all duration-300">
    <div className="h-16 w-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h4 className="text-xl font-black uppercase tracking-tight mb-3">{title}</h4>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);