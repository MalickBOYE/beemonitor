import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabaseClient';

// Pages
import Login from './pages/Login';
import Register from './pages/Register'; // N'oublie pas de créer ce fichier
import Dashboard from './pages/Dashboard'; // Ton Dashboard utilisateur
import AdminDashboard from './pages/AdminDashboard'; // Ta page Admin
import HiveDetail from './pages/HiveDetail';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';

// Composant interne pour gérer la navigation et les écouteurs de session
function AppContent({ session, setSession, resetTimer, showTimeoutModal, setShowTimeoutModal, logoutUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Écouteur global de session (déconnexion, suppression de compte, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, setSession]);

  return (
    <>
      {/* MODAL DE TIMEOUT */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-amber-500/50 p-8 rounded-[2.5rem] max-w-sm text-center shadow-2xl">
            <h2 className="text-2xl font-black text-amber-500 mb-4 italic uppercase tracking-tighter">Sécurité</h2>
            <p className="text-slate-300 text-sm mb-8 font-medium">Votre session a expiré après 1 heure d'inactivité.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setShowTimeoutModal(false); resetTimer(); }}
                className="bg-amber-500 text-black font-black py-4 rounded-2xl hover:bg-amber-400 transition-all uppercase text-[10px] tracking-widest"
              >
                Continuer la session
              </button>
              <button 
                onClick={logoutUser}
                className="text-slate-500 text-[10px] font-black uppercase tracking-widest py-2 hover:text-white transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        {/* Public */}
        <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<UpdatePassword />} />
        
        {/* Utilisateur Protégé */}
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/hive/:id" element={session ? <HiveDetail /> : <Navigate to="/login" replace />} />
        
        {/* Admin Protégé */}
        <Route path="/admin-dashboard" element={session ? <AdminDashboard /> : <Navigate to="/login" replace />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const timeoutTimer = useRef(null);

  const logoutUser = async () => {
    await supabase.auth.signOut();
    setShowTimeoutModal(false);
    setSession(null);
  };

  const resetTimer = () => {
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    if (session) {
      timeoutTimer.current = setTimeout(() => {
        setShowTimeoutModal(true);
      }, 3600000); // 1 heure
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    };
  }, [session]);

  if (loading) return (
    <div className="bg-[#020617] h-screen flex items-center justify-center text-amber-500 font-black tracking-widest uppercase text-xs">
      Chargement...
    </div>
  );

  return (
    <Router>
      <AppContent 
        session={session} 
        setSession={setSession} 
        resetTimer={resetTimer} 
        showTimeoutModal={showTimeoutModal} 
        setShowTimeoutModal={setShowTimeoutModal} 
        logoutUser={logoutUser} 
      />
    </Router>
  );
}