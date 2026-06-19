import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Redirect berdasarkan role
  if (isAuthenticated) {
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/mahasiswa/dashboard" replace />;
    }
  }

  // Jika belum login, redirect ke login
  return <Navigate to="/login" replace />;
}

export default Home;