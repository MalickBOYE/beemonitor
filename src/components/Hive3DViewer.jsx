import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Ring, Text } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Compass, Database, Info } from 'lucide-react';

// Configuration géométrique de la ruche (en mètres)
const H_WIDTH = 0.43;   // Largeur (X local)
const H_LENGTH = 0.535; // Longueur (Z local)
const H_HEIGHT = 0.50;  // Hauteur (Y local)

export default function Hive3DViewer() {
  // Poids simulés ou réels en provenance de Supabase (en kg)
  // Correspondance stricte avec ton câblage ESP32 :
  const [weights, setWeights] = useState({
    p1_avg: 15.2, // GPIO 18 (Avant-Gauche)
    p2_arg: 12.5, // GPIO 19 (Arrière-Gauche - Notre gauche quand on est derrière)
    p3_avd: 14.8, // GPIO 13 (Avant-Droit)
    p4_ard: 16.1, // GPIO 12 (Arrière-Droit - Notre droite quand on est derrière)
  });

  const totalWeight = useMemo(() => {
    return Object.values(weights).reduce((a, b) => a + b, 0);
  }, [weights]);

  // Calcul du Barycentre (X_g, Z_g) dans le repère local de la ruche
  // X local va de -H_WIDTH/2 à +H_WIDTH/2
  // Z local va de -H_LENGTH/2 à +H_LENGTH/2 (Planche d'envol en +Z)
  const barycenter = useMemo(() => {
    if (totalWeight === 0) return { x: 0, z: 0 };
    
    // Côté Droit (p3_avd + p4_ard) vs Côté Gauche (p1_avg + p2_arg)
    const rightWeight = weights.p3_avd + weights.p4_ard;
    const x = H_WIDTH * (rightWeight / totalWeight - 0.5);

    // Côté Avant (p1_avg + p3_avd) vs Côté Arrière (p2_arg + p4_ard)
    const frontWeight = weights.p1_avg + weights.p3_avd;
    const z = H_LENGTH * (frontWeight / totalWeight - 0.5);

    return { x, z };
  }, [weights, totalWeight]);

  // Orientation de la ruche : Sud-Ouest.
  // Dans notre espace 3D : Nord = -Z global, Sud = +Z global, Est = +X global, Ouest = -X global.
  // Le Sud-Ouest se situe à 225° (ou 5*PI/4 radians) par rapport au Nord.
  // Comme la face avant de notre ruche (l'entrée) est par défaut orientée vers le Sud (+Z global),
  // pour la faire pivoter vers le Sud-Ouest, nous devons lui appliquer une rotation Y de +45° (PI/4).
  const hiveRotationY = Math.PI / 4; 

  const handleSliderChange = (key, val) => {
    setWeights(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-[600px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl text-slate-100">
      
      {/* Panneau de contrôle latéral gauche */}
      <div className="w-full lg:w-1/3 p-6 bg-slate-950 flex flex-col justify-between border-r border-slate-800 overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Compass className="text-amber-500 w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-bold">Répartition & Reine</h2>
          </div>
          
          <p className="text-xs text-slate-400 mb-6">
            Orientation : <span className="text-amber-400 font-semibold">Sud-Ouest (225°)</span>. 
            La station météo est située derrière (Nord-Est).
          </p>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">Capteurs de pesée (en kg)</h3>
            
            {/* AVANT GAUCHE */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium">Avant-Gauche (GPIO 18 / P1)</span>
                <span className="font-bold">{weights.p1_avg.toFixed(1)} kg</span>
              </div>
              <input 
                type="range" min="0" max="30" step="0.1" 
                value={weights.p1_avg} 
                onChange={(e) => handleSliderChange('p1_avg', e.target.value)}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* AVANT DROIT */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium">Avant-Droit (GPIO 13 / P3)</span>
                <span className="font-bold">{weights.p3_avd.toFixed(1)} kg</span>
              </div>
              <input 
                type="range" min="0" max="30" step="0.1" 
                value={weights.p3_avd} 
                onChange={(e) => handleSliderChange('p3_avd', e.target.value)}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* ARRIÈRE GAUCHE */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-500 font-medium">Arrière-Gauche (GPIO 19 / P2)</span>
                <span className="font-bold">{weights.p2_arg.toFixed(1)} kg</span>
              </div>
              <input 
                type="range" min="0" max="30" step="0.1" 
                value={weights.p2_arg} 
                onChange={(e) => handleSliderChange('p2_arg', e.target.value)}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* ARRIÈRE DROIT */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-500 font-medium">Arrière-Droit (GPIO 12 / P4)</span>
                <span className="font-bold">{weights.p4_ard.toFixed(1)} kg</span>
              </div>
              <input 
                type="range" min="0" max="30" step="0.1" 
                value={weights.p4_ard} 
                onChange={(e) => handleSliderChange('p4_ard', e.target.value)}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Poids Total Calculé</span>
              <span className="text-lg font-black text-amber-400">{totalWeight.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Barycentre (X, Z) :</span>
              <span className="font-mono text-amber-500/90">
                [{(barycenter.x * 100).toFixed(1)} cm, {(barycenter.z * 100).toFixed(1)} cm]
              </span>
            </div>
          </div>

          <div className="flex gap-2 text-[10px] text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Le point rouge lumineux indique le centre de gravité. Utile pour pister l'emplacement du couvain où réside généralement la reine.</span>
          </div>
        </div>
      </div>

      {/* Rendu 3D Canvas principal */}
      <div className="w-full lg:w-2/3 h-full relative bg-slate-900">
        <Canvas camera={{ position: [0, 4, 6], fov: 45 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 10, 5]} intensity={1.8} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          
          {/* Sol d'herbe simplifiée */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial color="#1b2a1c" roughness={0.9} />
          </mesh>

          {/* Boussole d'orientation spatiale réelle */}
          <CompassRose />

          {/* Groupe de la Ruche orienté SUD-OUEST (Pivot Y) */}
          <group rotation={[0, hiveRotationY, 0]}>
            <HiveModel weights={weights} barycenter={barycenter} />
          </group>

          <OrbitControls 
            enablePan={true}
            maxPolarAngle={Math.PI / 2 - 0.05} // Ne pas passer sous le sol
            minDistance={3}
            maxDistance={10}
          />
        </Canvas>

        {/* Aide visuelle interactive incrustée */}
        <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-xs flex items-center gap-2 pointer-events-none">
          <RotateCcw className="w-4 h-4 text-slate-400 animate-spin-slow" />
          <span>Clic gauche enfoncé pour pivoter la ruche</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPOSANT COMPAS (ORIENTATION CARDINALE)
// ==========================================
function CompassRose() {
  return (
    <group position={[0, -0.05, 0]}>
      {/* Anneau de boussole */}
      <Ring args={[2.0, 2.05, 64]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#334155" />
      </Ring>
      
      {/* Lettres Cardinales */}
      <Text position={[0, 0, -2.3]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.25} color="#ef4444" font="bold">N</Text>
      <Text position={[0, 0, 2.3]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.25} color="#94a3b8">S</Text>
      <Text position={[2.3, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.25} color="#94a3b8">E</Text>
      <Text position={[-2.3, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.25} color="#94a3b8">W</Text>

      {/* Flèche indiquant le Sud-Ouest (Face d'envol de la ruche) */}
      <group rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 0, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.25, 4]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <Text position={[0, 0.01, 1.4]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.12} color="#f59e0b">S-W</Text>
      </group>
    </group>
  );
}

// ==========================================
// COMPOSANT MODÈLE 3D DE LA RUCHE DADANT
// ==========================================
function HiveModel({ weights, barycenter }) {
  // Calculer l'intensité des flèches par rapport au poids
  const maxWeight = Math.max(1, weights.p1_avg, weights.p2_arg, weights.p3_avd, weights.p4_ard);

  return (
    <group position={[0, 0.1, 0]}>
      
      {/* 1. PLANCHE DE SUPPORT EN BOIS (Le châssis) */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[H_WIDTH + 0.04, 0.1, H_LENGTH + 0.04]} />
        <meshStandardMaterial color="#854d0e" roughness={0.8} />
      </mesh>

      {/* Planche d'envol caractéristique à l'avant (+Z local) */}
      <mesh position={[0, 0.01, H_LENGTH / 2 + 0.04]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[H_WIDTH - 0.06, 0.015, 0.12]} />
        <meshStandardMaterial color="#a16207" />
      </mesh>

      {/* 2. LE CORPS PRINCIPAL DE LA RUCHE (Bois brut vieilli) */}
      <mesh position={[0, H_HEIGHT / 2 + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[H_WIDTH, H_HEIGHT, H_LENGTH]} />
        <meshStandardMaterial color="#b45309" roughness={0.9} />
      </mesh>

      {/* Poignée métallique décorative à l'arrière (-Z local) */}
      <mesh position={[0, H_HEIGHT / 2 + 0.1, -H_LENGTH / 2 - 0.01]} castShadow>
        <boxGeometry args={[0.15, 0.02, 0.02]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 3. LE TOIT EN MÉTAL GALVANISÉ (Double pente) */}
      <group position={[0, H_HEIGHT + 0.1, 0]}>
        {/* Pente Gauche */}
        <mesh position={[-H_WIDTH / 4 - 0.01, 0.06, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[H_WIDTH / 2 + 0.04, 0.02, H_LENGTH + 0.05]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Pente Droite */}
        <mesh position={[H_WIDTH / 4 + 0.01, 0.06, 0]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[H_WIDTH / 2 + 0.04, 0.02, H_LENGTH + 0.05]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 4. STATION MÉTÉO EXTÉRIEURE (Positionnée derrière la ruche en -Z local) */}
      <group position={[0, 0.1, -H_LENGTH / 2 - 0.25]}>
        {/* Poteau support */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Boîtier capteurs blanc */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.08, 0.06, 0.08]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
        {/* Coupole anémomètre / abri blanc */}
        <mesh position={[0, 0.47, 0]}>
          <sphereGeometry args={[0.05, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
        </mesh>
        {/* Texte indicateur */}
        <Text position={[0, 0.56, 0]} fontSize={0.08} color="#94a3b8">Station Météo (N-E)</Text>
      </group>

      {/* 5. LE BARYCENTRE DYNAMIQUE (La Reine & le Couvain) */}
      <group position={[barycenter.x, H_HEIGHT / 2 + 0.1, barycenter.z]}>
        {/* Sphère lumineuse représentant la Reine */}
        <mesh castShadow>
          <sphereGeometry args={[0.035, 32, 32]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Halo lumineux d'activité */}
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#f43f5e" transparent={true} opacity={0.25} />
        </mesh>
        <Text position={[0, 0.14, 0]} fontSize={0.06} color="#ef4444" font="bold">Barycentre (Reine)</Text>
      </group>

      {/* 6. LES FLÈCHES DE FORCE AUX 4 PIEDS (PESÉE DYNAMIQUE) */}
      
      {/* Avant-Gauche (GPIO 18 / P1) : Coin [-X, +Z] */}
      <WeightArrow 
        x={-H_WIDTH / 2} z={H_LENGTH / 2} 
        weight={weights.p1_avg} maxWeight={maxWeight} 
        label="GPIO 18 (P1)" color="#10b981" 
      />

      {/* Arrière-Gauche (GPIO 19 / P2) : Coin [-X, -Z] */}
      <WeightArrow 
        x={-H_WIDTH / 2} z={-H_LENGTH / 2} 
        weight={weights.p2_arg} maxWeight={maxWeight} 
        label="GPIO 19 (P2)" color="#f59e0b" 
      />

      {/* Avant-Droit (GPIO 13 / P3) : Coin [+X, +Z] */}
      <WeightArrow 
        x={H_WIDTH / 2} z={H_LENGTH / 2} 
        weight={weights.p3_avd} maxWeight={maxWeight} 
        label="GPIO 13 (P3)" color="#10b981" 
      />

      {/* Arrière-Droit (GPIO 12 / P4) : Coin [+X, -Z] */}
      <WeightArrow 
        x={H_WIDTH / 2} z={-H_LENGTH / 2} 
        weight={weights.p4_ard} maxWeight={maxWeight} 
        label="GPIO 12 (P4)" color="#f59e0b" 
      />
    </group>
  );
}

// ==========================================
// COMPOSANT COMPLÉMENTAIRE : FLÈCHE DE FORCE
// ==========================================
function WeightArrow({ x, z, weight, maxWeight, label, color }) {
  // Calcul de la hauteur proportionnelle au poids (entre 0.05m et 0.6m)
  const height = Math.max(0.05, (weight / maxWeight) * 0.6);
  
  return (
    <group position={[x, -0.05, z]}>
      {/* Le Pied physique (petit cylindre noir) */}
      <mesh position={[0, 0.025, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* La flèche de force verticale montante */}
      <mesh position={[0, -height / 2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, height, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, -0.01, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.025, 0.06, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Étiquette d'information */}
      <group position={[0, -height - 0.1, 0]}>
        <Text fontSize={0.045} color="#cbd5e1" anchorY="top">{`${weight.toFixed(1)} kg`}</Text>
        <Text fontSize={0.03} color="#94a3b8" position={[0, -0.05, 0]} anchorY="top">{label}</Text>
      </group>
    </group>
  );
}