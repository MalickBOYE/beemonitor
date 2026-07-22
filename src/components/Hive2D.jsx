import React from 'react';
import { Crosshair, ArrowRight, ArrowUp, Flame } from 'lucide-react';

export default function Hive2D({ data = [] }) {
  // Dimensions physiques de la plaque de référence (en mm)
  const L = 535; 
  const W = 430; 

  const calculatePointsForData = (measurements) => {
    return measurements.map(m => {
      const w1 = Number(m.weight_p1 || 0);
      const w2 = Number(m.weight_p2 || 0);
      const w3 = Number(m.weight_p3 || 0);
      const w4 = Number(m.weight_p4 || 0);
      const total = w1 + w2 + w3 + w4;

      let x_mm = W / 2;
      let y_mm = L / 2;

      if (total > 0) {
        // Calculs physiques basés sur la géométrie du châssis
        x_mm = (1 / total) * ((w1 + w2) * 342.59 + (w3 + w4) * 88.37);
        y_mm = (1 / total) * ((w1 + w3) * 62.48 + (w2 + w4) * 472.29);
      }

      const dateObj = new Date(m.created_at);
      const hours = dateObj.getHours();

      let colorClass = "bg-sky-400 shadow-sky-500/50"; // Matin (Bleu)
      if (hours >= 11 && hours < 16) {
        colorClass = "bg-emerald-400 shadow-emerald-500/50"; // Midi (Vert)
      } else if (hours >= 16 && hours < 20) {
        colorClass = "bg-amber-400 shadow-amber-500/50"; // Soir (Jaune)
      } else if (hours >= 20 || hours < 6) {
        colorClass = "bg-slate-400 shadow-slate-500/50"; // Nuit (Gris/Autre)
      }

      return {
        x: (x_mm / W) * 100,
        y: (y_mm / L) * 100,
        x_mm,
        y_mm,
        total,
        colorClass,
        time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        hour: hours,
        created_at: m.created_at
      };
    });
  };

  const points = calculatePointsForData(data);
  const latestPoint = points[points.length - 1] || { x: 50, y: 50, x_mm: 0, y_mm: 0, total: 0, colorClass: "bg-sky-400" };

  return (
    <div className="flex flex-col gap-8 mt-8">
      
      {/* VUE PRINCIPALE : CHÂSSIS 2D */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2 flex justify-center items-center relative p-6 bg-slate-950/40 rounded-[2.5rem] border border-white/5 overflow-hidden">
          <div className="relative w-full max-w-[380px] aspect-[1/1.2] flex items-center justify-center">
            
            <img 
              src="/images/Chassis.png" 
              alt="Châssis Ruche" 
              className="w-full h-full object-contain opacity-75 select-none pointer-events-none"
            />

            {/* Cadre de référence ajusté : axe Y abaissé pour coller au bord bas du bois */}
            <div className="absolute top-[7%] bottom-[2%] left-[8%] right-[8%] z-10 border-l border-b border-slate-500/40">
              
              <div className="absolute -bottom-[0.5px] -right-4 text-slate-400">
                <ArrowRight size={12} />
                <span className="text-[7px] font-black uppercase text-slate-500 absolute top-3 -left-2 whitespace-nowrap">Axe X</span>
              </div>
              <div className="absolute -top-4 -left-[0.5px] text-slate-400">
                <ArrowUp size={12} />
                <span className="text-[7px] font-black uppercase text-slate-500 absolute top-0 -left-8 whitespace-nowrap">Axe Y</span>
              </div>

              {/* ORIGINE (0,0) CALIBRÉE SUR LE COIN INFÉRIEUR GAUCHE DE LA PLANCHE */}
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 translate-y-1/2 shadow-[0_0_10px_rgba(239,68,68,0.9)] z-30">
                <span className="absolute top-3 left-3 text-[6px] font-black text-red-400 bg-black/90 px-1 py-0.5 rounded border border-red-500/30 whitespace-nowrap">
                  ORIGINE (0,0)
                </span>
              </div>

              {/* POINTS CHRONOLOGIQUES SANS POINTILLÉS */}
              {points.map((pt, index) => {
                const isLatest = index === points.length - 1;
                return (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 translate-y-1/2 group cursor-pointer z-20"
                    style={{ left: `${pt.x}%`, bottom: `${pt.y}%` }}
                  >
                    {isLatest && (
                      <div className="w-4 h-4 bg-amber-500 rounded-full animate-ping absolute -top-0.5 -left-0.5 scale-150 opacity-30" />
                    )}
                    
                    <div className={`rounded-full transition-all duration-300 border border-black/40 ${
                      isLatest ? 'w-3 h-3 bg-amber-400 ring-4 ring-amber-500/20' : `w-2 h-2 ${pt.colorClass}`
                    }`} />

                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[8px] font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 text-slate-200">
                      <span className="text-amber-400 font-bold">{pt.time}</span> | X: {pt.x_mm.toFixed(1)}mm Y: {pt.y_mm.toFixed(1)}mm
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* PANNEAU LATÉRAL (CENTRE DE MASSE) AVEC CONTEXTE DIDACTIQUE */}
        <div className="flex flex-col gap-6">
          
          {/* Indicateur du point le plus récent */}
          <div className="bg-slate-950/20 p-6 rounded-2xl border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-3">
              État de la colonie
            </span>
            <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${latestPoint.colorClass} shadow-inner`}>
                     <Crosshair size={32} className="text-white/30" />
                </div>
                <div>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                        {latestPoint.time}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        Dernier relevé
                    </div>
                </div>
            </div>
          </div>

          {/* Coordonnées et Explications du Centre de Masse */}
          <div className="bg-amber-950/20 p-6 rounded-2xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.02)]">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-[12px] font-black uppercase tracking-wider text-amber-500">
                Coordonnées du Centre de Masse
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm font-mono mb-6">
              <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wide">Axe X</span>
                <span className="text-amber-400 text-xl font-black">{latestPoint.x_mm.toFixed(0)}<span className="text-sm ml-1 opacity-70">mm</span></span>
              </div>
              <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wide">Axe Y</span>
                <span className="text-amber-400 text-xl font-black">{latestPoint.y_mm.toFixed(0)}<span className="text-sm ml-1 opacity-70">mm</span></span>
              </div>
            </div>

            <div className="bg-amber-900/30 p-5 rounded-xl border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
              <strong className="text-amber-100 block mb-1.5">Qu'est-ce que c'est ?</strong>
              Le centre de masse représente la position géographique moyenne de la colonie dans la ruche à un instant T. Sur cette représentation, on a le chassis sur lequel est posé la ruche et qui contient des capteurs de poids. Chaque capteur de poids est à une force (poids). La connaissance de ces valeurs permet d'estimer à quel endroit du chassis on a plus d'effort et de déduire des informations.
            </div>
            <div className="bg-black/30 p-5 rounded-xl border border-white/5 text-xs text-slate-400 leading-relaxed mt-4">
              <strong className="text-slate-200 block mb-1.5">À quoi ça sert ?</strong>
              Suivre son évolution permet de visualiser les migrations du couvain ou la disposition des réserves de miel. Un déplacement soudain peut indiquer un essaimage imminent.
            </div>
          </div>
          
        </div>

      </div>

      {/* 📊 HEATMAP AVEC LÉGENDE HARMONISÉE ET TITRE CORRIGÉ */}
      <div className="bg-black/30 rounded-[2.5rem] p-10 border border-white/5">
        <div className="flex items-center gap-3 mb-10 ml-2">
          <Flame size={20} className="text-amber-500" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
            Modèle de Densité de Présence
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          
          <div className="md:col-span-2 bg-slate-950/80 p-6 rounded-3xl border border-white/5 flex justify-center items-center relative overflow-hidden aspect-[1.4/1]">
            <div className="relative w-full max-w-[400px] aspect-[1/1.2] flex items-center justify-center">
              
              <img 
                src="/images/Chassis.png" 
                alt="Châssis Fond Thermique" 
                className="w-full h-full object-contain opacity-50 select-none pointer-events-none filter contrast-125"
              />

              <div className="absolute top-[7%] bottom-[2%] left-[8%] right-[8%] z-10 pointer-events-none">
                {points.map((pt, index) => {
                  const factor = (index + 1) / points.length;
                  return (
                    <div 
                      key={`pitch-heat-${index}`}
                      className="absolute rounded-full transform -translate-x-1/2 translate-y-1/2 mix-blend-screen filter blur-2xl"
                      style={{
                        left: `${pt.x}%`,
                        bottom: `${pt.y}%`,
                        width: `${80 + factor * 50}px`,
                        height: `${80 + factor * 50}px`,
                        background: `radial-gradient(circle, rgba(225,29,72,${0.6 * factor}) 0%, rgba(251,191,36,${0.5 * factor}) 35%, rgba(52,211,153,${0.3 * factor}) 65%, rgba(14,165,233,${0.2 * factor}) 85%, transparent 100%)`
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-black/40 p-8 rounded-3xl border border-white/5 h-full flex flex-col justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-4">Échelle d'Intensité de Présence</span>
            
            <div 
              className="w-full h-4 rounded-full mb-5 shadow-inner"
              style={{ background: 'linear-gradient(to right, #0ea5e9, #34d399, #fbbf24, #e11d48)' }}
            ></div>
            
            <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400 font-bold mb-5">
              <span>Faible</span>
              <span>Moyenne</span>
              <span>Forte concentration</span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Plus la brillance et l'intensité lumineuse (en <strong>rouge vif</strong>) sont élevées sur une zone, plus cela révèle une forte concentration et une présence accrue des abeilles à cet endroit précis du châssis.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}