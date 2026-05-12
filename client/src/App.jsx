import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import HospitalDashboard from './pages/HospitalDashboard';
import DonorDashboard from './pages/DonorDashboard';
import RequestBlood from './pages/RequestBlood';
import AdminPanel from './pages/AdminPanel';
import BloodBankDashboard from './pages/BloodBankDashboard';
import ProfileSettings from './pages/ProfileSettings';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', background: '#0B1F3A', color: '#fff', fontWeight: 600, fontSize: '14px' },
          success: { style: { background: '#1ABC9C' } },
          error: { style: { background: '#E74C3C' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Hospital */}
        <Route path="/hospital" element={
          <ProtectedRoute allowedRoles={['HOSPITAL']}>
            <HospitalDashboard />
          </ProtectedRoute>
        } />
        <Route path="/hospital/request" element={
          <ProtectedRoute allowedRoles={['HOSPITAL']}>
            <RequestBlood />
          </ProtectedRoute>
        } />

        {/* Donor */}
        <Route path="/donor" element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorDashboard />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPanel />
          </ProtectedRoute>
        } />

        <Route path="/blood-bank" element={
          <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
            <BloodBankDashboard />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['DONOR', 'HOSPITAL']}>
            <ProfileSettings />
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
