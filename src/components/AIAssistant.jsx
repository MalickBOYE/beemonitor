import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Plus } from 'lucide-react';
import { analyzeHiveHealth } from '../services/aiService';

// Imports des sous-composants
import AddHiveModal from '../components/AddHiveModal';
import HiveCard from '../components/HiveCard';
import AIAssistant from '../components/AIAssistant';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const backgroundImages = ["https://images.unsplash.com/photo-1587334274328-64186a80aeee?q=80&w=2000", "https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?q=80&w=2000"];

export default function Dashboard() {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hiveToDelete, setHiveToDelete] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Bonjour ! Comment se portent vos abeilles aujourd\'hui ?' }]);
  const [bgIndex, setBgIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHives();
    const bgInterval = setInterval(() => setBgIndex((prev) => (prev + 1) % backgroundImages.length), 10000);
    const channel = supabase.channel('dashboard_realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'hives' }, () => fetchHives()).subscribe();
    return () => { supabase.removeChannel(channel); clearInterval(bgInterval); };
  }, []);

  async function fetchHives() {
    const { data } = await supabase.from('hives').select('*').order('created_at', { ascending: false });
    if (data) setHives(data);
    setLoading(false);
  }

  const handleDeleteHive = async () => {
    const { error } = await supabase.from('hives').delete().eq('id', hiveToDelete.id);
    if (!error) {
      setHives(hives.filter(h => h.id !== hiveToDelete.id));
      setHiveToDelete(null);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    const aiResponse = analyzeHiveHealth(chatInput, hives);
    setTimeout(() => setMessages(prev => [...prev, { role: 'bot', text: aiResponse }]), 600);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-x-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 transition-opacity duration-1000">
        <img src={backgroundImages[bgIndex]} className="w-full h-full object-cover opacity-10" alt="BG" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-16 w-16" />
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">BEE MONITOR</h1>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest italic">Live Intelligence</span>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20">
          <Plus size={20} /> Ajouter une ruche
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-10 w-full flex-grow">
        <h2 className="text-4xl font-black mb-10">Tableau de bord <span className="text-amber-500">/</span></h2>
        
        {loading ? (
          <div className="flex justify-center py-20 animate-spin"><div className="rounded-full h-10 w-10 border-b-2 border-amber-500"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hives.map(hive => (
              <HiveCard key={hive.id} hive={hive} onNavigate={(id) => navigate(`/hive/${id}`)} onDelete={setHiveToDelete} />
            ))}
          </div>
        )}
      </main>

      <AIAssistant 
        isOpen={isChatOpen} setIsOpen={setIsChatOpen} 
        messages={messages} input={chatInput} 
        setInput={setChatInput} onSendMessage={handleSendMessage} 
      />

      {hiveToDelete && (
        <DeleteConfirmModal 
          hiveName={hiveToDelete.name} 
          onConfirm={handleDeleteHive} 
          onCancel={() => setHiveToDelete(null)} 
        />
      )}

      {showAddModal && <AddHiveModal onClose={() => setShowAddModal(false)} onRefresh={fetchHives} />}
    </div>
  );
}