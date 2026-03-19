import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import HiveDetail from './pages/HiveDetail';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';

// Ce composant interne gère la navigation sécurisée
function AppContent({ session, setSession }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Écouteur de session unique : si on se déconnecte, on va au login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate, setSession]);

  return (
    <Routes>
      {/* --- ACCÈS PUBLIC --- */}
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<UpdatePassword />} />
      
      {/* --- ACCÈS PROTÉGÉ --- */}
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/admin-dashboard" element={session ? <AdminDashboard /> : <Navigate to="/login" replace />} />
      <Route path="/hive/:id" element={session ? <HiveDetail /> : <Navigate to="/login" replace />} />
      
      {/* Redirection si l'URL est erronée */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // ÉTAPE CRUCIALE : On vérifie la session AVANT tout affichage
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  // Écran d'attente propre
  if (loading) {
    return (
      <div className="bg-[#020617] h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
        <span className="text-amber-500 font-black uppercase text-[10px] tracking-widest">Initialisation...</span>
      </div>
    );
  }

  return (
    <Router>
      <AppContent session={session} setSession={setSession} />
    </Router>
  );
}