import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import React from 'react';
// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HiveDetail from './pages/HiveDetail';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import AdminDashboard from './pages/AdminDashboard';
import PendingValidation from './pages/PendingValidation';

const ADMIN_EMAIL = 'admin@rucheconnectee.com';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Fonction de vérification globale
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession) {
          await handleRedirection(currentSession, window.location.pathname);
        }
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
      } finally {
        setLoading(false);
      }
    };

    // 2. Logique de redirection selon le profil
    const handleRedirection = async (userSession, currentPath) => {
      const user = userSession.user;

      // CAS ADMIN
      if (user.email === ADMIN_EMAIL) {
        if (!currentPath.startsWith('/admin')) {
          navigate('/admin', { replace: true });
        }
        return;
      }

      // CAS UTILISATEUR (Vérification du profil en DB)
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      if (profile.status === 'blocked') {
        await supabase.auth.signOut();
        navigate('/login');
        alert("Votre compte a été suspendu.");
      } 
      else if (profile.status === 'pending') {
        if (currentPath !== '/pending') navigate('/pending', { replace: true });
      } 
      else if (profile.status === 'active') {
        // Redirige vers dashboard uniquement si on vient des pages d'accueil/connexion
        const isPublicPage = ['/', '/login', '/register'].includes(currentPath);
        if (isPublicPage) {
          navigate('/dashboard', { replace: true });
        }
      }
    };

    initializeAuth();

    // 3. Écouteur de changements d'état (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_IN' && newSession) {
        handleRedirection(newSession, window.location.pathname);
      }
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  if (loading) return (
    <div className="bg-[#020617] h-screen flex flex-col items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-amber-500 font-black uppercase text-[10px] tracking-widest animate-pulse">
        Initialisation Beemonitor...
      </p>
    </div>
  );

  return (
    <Routes>
      {/* Routes Publiques */}
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={<Register />} /> 
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<UpdatePassword />} />
      
      {/* Routes Privées Utilisateurs */}
      <Route path="/pending" element={session ? <PendingValidation /> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/hive/:id" element={session ? <HiveDetail /> : <Navigate to="/login" />} />
      
      {/* Route Admin */}
      <Route path="/admin" element={
        session && session.user.email === ADMIN_EMAIL ? <AdminDashboard /> : <Navigate to="/dashboard" />
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}