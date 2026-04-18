import React from 'react';

export default function Footer() {
  return (
    <footer className="relative z-20 w-full bg-white py-12 px-6 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
        
        {/* Section Partenaires - Flexbox optimisée pour l'alignement vertical */}
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          
          {/* MESRI */}
          <img 
            src="/logo_MESRI_boite_V.png" 
            alt="Ministère de l'Enseignement Supérieur" 
            className="h-14 w-auto object-contain" 
          />
          
          {/* Région AURA */}
          <img 
            src="/logo-auvergne-rhone-alpes.png" 
            alt="Région Auvergne-Rhône-Alpes" 
            className="h-12 w-auto object-contain" 
          />
          
          {/* Polytech */}
          <img 
            src="/polytech.png" 
            alt="Polytech Annecy-Chambéry" 
            className="h-10 w-auto object-contain" 
          />

          {/* ABEILLES & ENVIRONNEMENT - Taille ajustée car le logo est large */}
          <img 
            src="/logo-abeilles.png" 
            alt="Abeilles & Environnement" 
            className="h-16 w-auto object-contain transition-transform hover:scale-105" 
          />

          {/* Séparateur vertical (caché sur mobile) */}
          <div className="hidden lg:block w-px h-12 bg-slate-200 mx-2"></div>

          {/* SOPRA STERIA */}
          <img 
            src="/sopra.png" 
            alt="Sopra Steria" 
            className="h-8 w-auto object-contain transition-transform hover:scale-105" 
          />
        </div>

        {/* Copyright & Version */}
        <div className="text-center space-y-3">
          <div className="flex justify-center gap-3">
            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse delay-75"></span>
            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse delay-150"></span>
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">
            © 2026 La Ruche Connectée — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}