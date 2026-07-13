import { Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

// Pages
import Dashboard from './pages/Dashboard';
import HiveDetail from './pages/HiveDetail';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <Routes>
      {/* Redirection directe vers les données */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Routes de données accessibles publiquement */}
      <Route path="/hive/:id" element={<HiveDetail />} />
      <Route path="/admin" element={<AdminDashboard />} />
      
      {/* Anciennes routes d'authentification redirigées vers le Dashboard */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
      <Route path="/reset-password" element={<Navigate to="/dashboard" replace />} />
      <Route path="/pending" element={<Navigate to="/dashboard" replace />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}