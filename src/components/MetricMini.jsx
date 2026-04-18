import React from 'react';

const MetricMini = ({ icon, label, value, color }) => (
  <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
    <div className={`flex items-center gap-2 ${color} mb-1`}>
      {icon} 
      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-lg font-bold text-white">{value}</div>
  </div>
);

export default MetricMini;