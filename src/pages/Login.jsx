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

/**
 * AppContent gère la logique de navigation. 
 * Il DOIT être dans un composant séparé, enfant de <Router>.
 */
function AppContent({ session, setSession }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Écouteur global pour les changements d'état (Login, Logout, Suppression)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      
      // Si déconnexion ou utilisateur supprimé, retour au login immédiat
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [navigate, setSession]);

  return (
    <Routes>
      {/* ROUTES PUBLIQUES */}
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<UpdatePassword />} />
      
      {/* ROUTES PROTÉGÉES */}
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/admin-dashboard" element={session ? <AdminDashboard /> : <Navigate to="/login" replace />} />
      <Route path="/hive/:id" element={session ? <HiveDetail /> : <Navigate to="/login" replace />} />
      
      {/* REDIRECTION PAR DÉFAUT */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Composant Racine (App)
 */
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérification initiale de la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  // Écran de chargement pendant que Supabase vérifie la session
  if (loading) return (
    <div className="bg-[#020617] h-screen flex flex-col items-center justify-center gap-4">
      <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full" />
      <span className="text-amber-500 font-black uppercase text-[10px] tracking-[0.3em]">Initialisation du système...</span>
    </div>
  );

  return (
    <Router>
      <AppContent session={session} setSession={setSession} />
    </Router>
  );
}