import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Shield, TrendingUp, Users, ArrowRight, ChevronRight, Hexagon } from 'lucide-react';

// Images pour le carrousel (tu pourras remplacer par tes propres images)
const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1587049352847-81a56d773c1c?q=80&w=2070&auto=format&fit=crop", // Apiculteur
  "https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?q=80&w=2072&auto=format&fit=crop", // Rayon de miel
  "https://images.unsplash.com/photo-1588614959060-4d144f28b207?q=80&w=2140&auto=format&fit=crop"  // Ruches en nature
];

export default function Home() {
  const navigate = useNavigate();
  const [currentImg, setCurrentImg] = useState(0);

  // Gestion du défilement des images toutes les 5 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <Hexagon className="text-amber-500" size={32} fill="currentColor" fillOpacity={0.2} />
          <div className="flex flex-col">
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none text-white">Beemonitor</h1>
            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-[0.3em]">Live Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
            Connexion
          </Link>
          <button 
            onClick={() => navigate('/register')}
            className="bg-amber-500 hover:bg-white text-black font-black py-2.5 px-6 rounded-xl transition-all uppercase text-[10px] md:text-xs tracking-widest shadow-lg shadow-amber-500/20"
          >
            Créer ma ruche
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION (Carrousel) --- */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Images en background */}
        {CAROUSEL_IMAGES.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImg ? 'opacity-40' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        ))}
        {/* Overlay gradient pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Nouveau : Version 2.0 disponible</span>
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] mb-8">
            L'avenir de <br/>
            <span className="text-amber-500">l'apiculture</span> connectée.
          </h2>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium">
            Surveillez le poids, la température et l'humidité de vos ruches en temps réel. 
            Anticipez les essaimages, optimisez vos récoltes et protégez vos abeilles grâce à nos capteurs ESP32.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/register')} className="bg-amber-500 hover:bg-white text-black font-black py-4 px-8 rounded-2xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/20">
              Rejoindre le projet <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4 px-8 rounded-2xl transition-all uppercase text-xs tracking-widest backdrop-blur-md">
              Accéder au Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* --- OBJECTIFS --- */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Pourquoi <span className="text-amber-500">Beemonitor</span> ?</h3>
          <p className="text-slate-400 max-w-xl mx-auto">Un outil conçu par des passionnés, pour des passionnés, afin de garantir la santé des colonies face aux défis climatiques.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Activity size={32} />}
            title="Temps Réel"
            desc="Suivi continu via WiFi ou Bluetooth. Vos données sont synchronisées instantanément sur votre tableau de bord sécurisé."
          />
          <FeatureCard 
            icon={<Shield size={32} />}
            title="Prévention"
            desc="Analysez l'humidité et la température interne pour prévenir l'essaimage et détecter rapidement les anomalies."
          />
          <FeatureCard 
            icon={<TrendingUp size={32} />}
            title="Productivité"
            desc="Surveillez la courbe de poids pour connaître le moment exact des miellées et planifier vos récoltes sans déranger la ruche."
          />
        </div>
      </section>

      {/* --- PARTENAIRES --- */}
      <section className="py-20 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Ils soutiennent le projet</h4>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Remplace par les vrais logos de tes partenaires */}
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><Users className="text-amber-500"/> FabLab Local</div>
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">Syndicat Apicole</div>
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">Lycée Tech</div>
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">Région Innov'</div>
          </div>
        </div>
      </section>

      {/* --- FOOTER / LIENS UTILES --- */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black/50 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Hexagon className="text-amber-500" size={24} />
              <h2 className="text-lg font-black uppercase tracking-tighter">Beemonitor</h2>
            </div>
            <p className="text-slate-500 text-sm max-w-sm">
              Projet Open-Source de monitoring de ruches. Notre mission est d'accompagner les apiculteurs dans la transition numérique pour la sauvegarde des abeilles.
            </p>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-4">Liens utiles</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Documentation ESP32</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Code source (GitHub)</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Schémas électroniques</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-sm mb-4">Contact</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li>contact@beemonitor.fr</li>
              <li>+33 6 00 00 00 00</li>
              <li className="pt-4"><Link to="/login" className="text-amber-500 hover:text-white flex items-center gap-1 font-bold">Espace Membre <ChevronRight size={14}/></Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center mt-12 pt-8 border-t border-white/5 text-slate-600 text-xs">
          © {new Date().getFullYear()} Beemonitor. Tous droits réservés.
        </div>
      </footer>

    </div>
  );
}

// Sous-composant pour les cartes Objectifs
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all duration-300 group">
    <div className="h-16 w-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all">
      {icon}
    </div>
    <h4 className="text-xl font-black uppercase tracking-tight mb-3">{title}</h4>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);