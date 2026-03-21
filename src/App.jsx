import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HiveDetail from './pages/HiveDetail';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérification de la session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (_event === 'SIGNED_OUT') navigate('/login');
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  if (loading) return (
    <div className="bg-[#020617] h-screen flex items-center justify-center text-amber-500 font-black uppercase text-[10px] tracking-widest">
      Chargement...
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Register />} /> 
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<UpdatePassword />} />
      
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/hive/:id" element={session ? <HiveDetail /> : <Navigate to="/login" replace />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}