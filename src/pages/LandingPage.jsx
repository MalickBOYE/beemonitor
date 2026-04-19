import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import techHive from '../assets/Ruche.png'; 
import sopraLogo from '../assets/sopra.png'; // Ajout de l'import du logo Sopra

const backgroundImages = [
  "https://images.unsplash.com/photo-1587334274328-64186a80aeee", 
  "https://images.unsplash.com/photo-1473973266408-ed4e27abdd47"
];

export default function LandingPage() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % backgroundImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold text-cyan-900">La Ruche Connectée</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-cyan-900 font-semibold hover:text-amber-500 transition-colors"
          >
            Accueil
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="bg-cyan-900 text-white px-5 py-2 rounded-lg font-bold hover:bg-cyan-800 transition-colors"
          >
            Connexion
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative h-screen w-full overflow-hidden flex items-center justify-center pt-20">
        {backgroundImages.map((img, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
            <img src={img} className="w-full h-full object-cover" alt="Bees" />
            <div className="absolute inset-0 bg-cyan-950/60" />
          </div>
        ))}
        {/* Ajout de flex flex-col items-center pour bien centrer le logo et le texte */}
        <div className="relative z-10 text-center px-4 max-w-4xl flex flex-col items-center">
          
          {/* --- LOGO SOPRA ICI --- */}
          <div className="mb-8 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 inline-block">
            <img 
              src={sopraLogo} 
              alt="Sopra Steria" 
              className="h-10 md:h-14 w-auto brightness-0 invert" 
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg">
            Protéger les abeilles grâce à la <span className="text-amber-400">technologie</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-10 font-light">
            Surveillez vos ruches à distance, en temps réel, et agissez pour la biodiversité avec notre solution connectée.
          </p>
          <button onClick={() => navigate('/login')} className="bg-amber-500 text-cyan-950 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
            ACCÉDER À LA PLATEFORME
          </button>
        </div>
      </header>

      {/* --- SECTION 1 : POURQUOI UNE RUCHE CONNECTÉE --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-white p-4 rounded-2xl shadow-xl flex justify-center items-center border border-slate-100">
            <img src="/images/bg1.png" alt="Apiculteur" className="w-full h-auto rounded-xl object-cover" />
          </div>
          <div className="bg-cyan-900 p-10 rounded-2xl shadow-xl text-white">
            <h2 className="text-3xl font-bold mb-6 text-amber-400">Pourquoi une ruche connectée ?</h2>
            <p className="text-lg leading-relaxed mb-4">
              La technologie IoT au service de l'apiculture permet de limiter les interventions intrusives. Chaque ouverture de ruche stresse la colonie.
            </p>
            <p className="text-lg leading-relaxed">
              Notre solution remonte des données en temps réel pour anticiper les besoins des abeilles.
            </p>
          </div>
        </div>
      </section>

      {/* --- SECTION 2 : LES ABEILLES --- */}
      <section className="py-20 px-6 bg-slate-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-white p-10 rounded-2xl shadow-xl border-l-8 border-amber-400">
            <h2 className="text-3xl font-bold mb-6 text-cyan-900">Le monde fascinant des abeilles</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Les abeilles ont une durée de vie d'environ 45 jours. La ruche est une société hyper-organisée où chaque abeille a un rôle défini.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Elles communiquent par phéromones et danses complexes. Leur survie est menacée par le changement climatique.
            </p>
          </div>
          <div className="order-1 md:order-2 bg-white p-4 rounded-2xl shadow-xl flex justify-center items-center border border-slate-100">
            {/* MISE À JOUR EN .JPG ICI */}
            <img src="/images/abeille.jpg" alt="Abeille" className="w-full h-auto rounded-xl object-cover" />
          </div>
        </div>
      </section>

      {/* --- SECTION 3 : ÉQUIPEMENT --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-black text-cyan-900 mb-12">Notre ruche est équipée de :</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 transition-transform hover:-translate-y-2">
            <div className="text-5xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold text-cyan-900 mb-2">Balance connectée</h3>
            <p className="text-slate-600">Mesure le poids en continu.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 transition-transform hover:-translate-y-2">
            <div className="text-5xl mb-4">🌡️</div>
            <h3 className="text-xl font-bold text-cyan-900 mb-2">Capteurs internes</h3>
            <p className="text-slate-600">Sondes de température et d'humidité.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 transition-transform hover:-translate-y-2">
            <div className="text-5xl mb-4">📡</div>
            <h3 className="text-xl font-bold text-cyan-900 mb-2">Transmission IoT</h3>
            <p className="text-slate-600">Envoi des données via ESP32.</p>
          </div>
        </div>
      </section>

      {/* --- SECTION : SCHÉMA TECHNIQUE --- */}
      <section className="py-16 px-6 bg-white flex justify-center">
        <div className="max-w-4xl w-full">
          <img src={techHive} alt="Schéma technique" className="w-full h-auto drop-shadow-2xl rounded-3xl" />
        </div>
      </section>

      {/* --- FOOTER BLANC --- */}
      <footer className="bg-white text-slate-800 py-16 px-6 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            <img src="/logo_MESRI_boite_V.png" alt="MESRI" className="h-14 w-auto object-contain" />
            <img src="/logo-auvergne-rhone-alpes.png" alt="Région AURA" className="h-12 w-auto object-contain" />
            <img src="/polytech.png" alt="Polytech" className="h-10 w-auto object-contain" />
            <img src="/logo-abeilles.png" alt="Abeilles" className="h-16 w-auto object-contain" />
            <div className="hidden lg:block w-px h-12 bg-slate-200 mx-2"></div>
            <img src="/sopra.png" alt="Sopra Steria" className="h-8 w-auto object-contain" />
          </div>

          <div className="text-center w-full pt-8 flex flex-col items-center gap-4">
            <div className="flex justify-center gap-3 mb-2">
              <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse delay-75"></span>
              <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse delay-150"></span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
              © 2026 La Ruche Connectée — Tous droits réservés
            </p>
            <p className="text-sm font-bold text-amber-600 uppercase tracking-widest">
              Action pour la biodiversité 🌍
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}