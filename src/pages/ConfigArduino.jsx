import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Save, ArrowLeft, Cpu } from 'lucide-react';

const ConfigArduino = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen p-6 pt-24 max-w-2xl mx-auto">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={20} /> Retour
            </button>

            <div className="bg-bee-panel p-8 rounded-3xl border border-slate-700 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-bee-gold p-3 rounded-2xl text-black">
                        <Cpu size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Configuration ESP32</h2>
                        <p className="text-gray-400">Paramétrez la connexion de votre boîtier.</p>
                    </div>
                </div>
                
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">SSID (Nom du WiFi)</label>
                        <div className="relative">
                            <Wifi className="absolute left-3 top-3.5 text-gray-500" size={20} />
                            <input type="text" className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 pl-10 text-white focus:border-bee-gold focus:ring-1 focus:ring-bee-gold outline-none transition-all" placeholder="Livebox-1234" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe WiFi</label>
                        <input type="password" className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white focus:border-bee-gold outline-none transition-all" placeholder="••••••••" />
                    </div>

                    <div className="pt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">ID Unique Ruche</label>
                        <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-gray-500 font-mono text-sm" value="HIVE_XF92_JARDIN_01" readOnly />
                        <p className="text-xs text-gray-500 mt-2">Cet ID ne peut pas être modifié.</p>
                    </div>

                    <button className="w-full bg-bee-gold text-black font-bold py-4 rounded-xl hover:bg-yellow-500 transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4">
                        <Save size={20} /> Sauvegarder dans le module
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConfigArduino;