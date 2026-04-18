import React from 'react';
import { Bell } from 'lucide-react';

const KpiCard = ({ icon, title, value, sub, active, onClick, alert }) => (
  <div 
    onClick={onClick}
    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between group
    ${active 
      ? 'bg-bee-gold text-black border-bee-gold shadow-lg shadow-yellow-500/20 translate-x-2' 
      : 'bg-slate-800/40 border-slate-700 text-white hover:bg-slate-800 hover:border-slate-500'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl transition-colors ${active ? 'bg-black/10' : 'bg-slate-700 group-hover:bg-slate-600'}`}>
        {icon}
      </div>
      <div>
        <div className={`text-sm font-medium ${active ? 'opacity-80' : 'text-gray-400'}`}>{title}</div>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <div className={`text-xs mt-1 ${active ? 'opacity-70' : 'text-gray-500'}`}>{sub}</div>}
      </div>
    </div>
    
    {alert && (
      <div className="absolute top-0 right-0 p-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </div>
    )}
  </div>
);

export default KpiCard;