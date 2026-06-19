import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Halaman
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import MahasiswaDashboard from '../pages/mahasiswa/Dashboard';
import KirimLaporan from '../pages/mahasiswa/KirimLaporan';
import DetailLaporan from '../pages/mahasiswa/DetailLaporan';
import RiwayatLaporan from '../pages/mahasiswa/RiwayatLaporan';
import AdminDashboard from '../pages/admin/Dashboard';
import KirimLaporanAdmin from '../pages/admin/KirimLaporanAdmin';
import RiwayatLaporanAdmin from '../pages/admin/RiwayatLaporanAdmin';
import DetailLaporanAdmin from '../pages/admin/DetailLaporanAdmin'; // Assuming this will be created

function AppRoutes() {
  return (
    <Routes>
      {/* Home - Redirect berdasarkan login status */}
      <Route path="/" element={<Home />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Mahasiswa Routes */}
      <Route
        path="/mahasiswa/dashboard"
        element={
          <ProtectedRoute requiredRole="mahasiswa">
            <MahasiswaDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mahasiswa/kirim-laporan"
        element={
          <ProtectedRoute requiredRole="mahasiswa">
            <KirimLaporan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mahasiswa/detail-laporan/:id"
        element={
          <ProtectedRoute requiredRole="mahasiswa">
            <DetailLaporan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mahasiswa/riwayat-laporan"
        element={
          <ProtectedRoute requiredRole="mahasiswa">
            <RiwayatLaporan />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kirim-laporan"
        element={
          <ProtectedRoute requiredRole="admin">
            <KirimLaporanAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/riwayat-laporan"
        element={
          <ProtectedRoute requiredRole="admin">
            <RiwayatLaporanAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/detail-laporan/:id"
        element={
          <ProtectedRoute requiredRole="admin">
            <DetailLaporanAdmin /> {/* Placeholder for admin detail page */}
          </ProtectedRoute>
        }
      />

      {/* Default - catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
