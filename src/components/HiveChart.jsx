import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HiveChart({ data }) {
  return (
    <div className="h-[400px] w-full bg-black/20 rounded-3xl p-6 border border-white/5">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="created_at" hide />
          <YAxis stroke="#475569" fontSize={12} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{background: '#020617', border: 'none', borderRadius: '15px'}} 
            itemStyle={{color: '#fbbf24'}}
          />
          <Line name="Poids (kg)" type="monotone" dataKey="weight" stroke="#fbbf24" strokeWidth={4} dot={false} />
          <Line name="Temp (°C)" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}