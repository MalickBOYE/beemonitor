import React from 'react';
import { Wifi, Bluetooth, Activity } from 'lucide-react';

export default function ConnectionBadge({ isBleConnected, onBleClick }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
      {/* MODE CLOUD / ROUTER */}
      <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase tracking-widest">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Wifi size={14} /> SATELLITE LINK
      </div>

      <div className="h-3 w-[1px] bg-white/20" />

      {/* MODE LOCAL / BLUETOOTH */}
      <button 
        onClick={onBleClick}
        className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${isBleConnected ? 'text-blue-400' : 'text-slate-500 hover:text-white'}`}
      >
        <Bluetooth size={14} className={isBleConnected ? "animate-pulse" : ""} /> 
        {isBleConnected ? 'BLE ACTIVE' : 'PAIR DEVICE'}
      </button>

      <div className="h-3 w-[1px] bg-white/20" />

      {/* FLUX DE DONNÉES RÉEL */}
      <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${isBleConnected ? 'text-green-500' : 'text-slate-600'}`}>
        <Activity size={12} className={isBleConnected ? "animate-bounce" : ""} />
        {isBleConnected ? "Live Stream" : "Standby"}
      </div>
    </div>
  );
}