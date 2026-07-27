import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import HiveDetail from './pages/HiveDetail';
import AdminDashboard from './pages/AdminDashboard';
import ActualiteDetail from './pages/ActualiteDetail';

// 1. IMPORTATION DES DEUX PAGES
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/UpdatePassword';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Routes pour la réinitialisation du mot de passe */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Route Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Route dynamique vers l'actualité */}
        <Route path="/actualite/:id" element={<ActualiteDetail />} />
        
        {/* Route dynamique vers les détails de la ruche */}
        <Route path="/hive/:id" element={<HiveDetail />} />
        
        {/* Sécurité : Redirection vers l'accueil si l'URL est inconnue */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}