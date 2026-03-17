import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// On importe ton logo ici
import logo from '../assets/logo.png'; 

const images = [
  "https://images.unsplash.com/photo-1587334274328-64186a80aeee", 
  "https://images.unsplash.com/photo-1473973266408-ed4e27abdd47"
];

export default function LandingPage() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % images.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {images.map((img, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
          <img src={img} className="w-full h-full object-cover" alt="Bees" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      ))}
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        
        {/* Ajout du logo juste au-dessus du titre */}
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-16 w-auto" // Ajuste la taille ici (h-16 = 64px)
          />
          <h1 className="text-6xl font-black text-white">
            La Ruche connectée
            {/* Le <span> orange a été supprimé ici */}
          </h1>
        </div>

        <p className="text-xl text-slate-300 mb-8 max-w-2xl italic">
          Surveiller vos ruche, à distance, en temps réel 
        </p>

        <button 
          onClick={() => navigate('/login')} 
          className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
        >
          ACCÉDER À LA PLATEFORME
        </button>
      </div>
    </div>
  );
}