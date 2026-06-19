import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role: authRole, logout } = useAuth();

  // Prioritaskan role dari AuthContext agar navigasi selalu konsisten dengan akun yang login
  const currentRole = authRole || role || "mahasiswa";

  // Memeriksa rute aktif secara akurat sesuai path URL saat ini
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-solid border-[#E5BDB8] flex flex-col items-center pt-8 shrink-0 hidden md:flex">
      {/* Logo Kampus */}
      <div className="flex flex-col items-center mb-8">
        <img
          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/e968ul9b_expires_30_days.png"
          className="w-14 h-16 object-contain mb-2"
          alt="Logo Kampus"
        />
        <h2 className="text-[#960006] text-lg font-bold">Fasilitas Kampus</h2>
        <span className="text-[#5C403C] text-[10px] font-bold tracking-wider uppercase">Portal Pelaporan</span>
      </div>

      {/* Menu Navigasi Dinamis */}
      <div className="w-full flex-1 px-4 flex flex-col gap-1.5">
        
        {/* Menu 1: Beranda */}
        <div 
          onClick={() => navigate(currentRole === "admin" ? "/admin/dashboard" : "/mahasiswa/dashboard")}
          className={`flex items-center py-3 px-4 rounded-xl cursor-pointer text-sm transition-colors ${
            isActive("/admin/dashboard") || isActive("/mahasiswa/dashboard")
              ? "bg-[#FE7C6C]/20 text-[#72140F] font-bold" 
              : "text-[#5C403C] hover:bg-gray-50 font-semibold"
          }`}
        >
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/kp1cvuyo_expires_30_days.png"
            className="w-4 h-4 mr-3 object-contain"
            alt="Home"
          />
          <span>Beranda</span>
        </div>

        {/* Menu 2: Laporan Saya */}
        <div 
          onClick={() => navigate(currentRole === "admin" ? "/admin/kirim-laporan" : "/mahasiswa/kirim-laporan")} 
          className={`flex items-center py-3 px-4 rounded-xl cursor-pointer text-sm transition-colors ${
            isActive("/admin/kirim-laporan") || isActive("/mahasiswa/kirim-laporan")
              ? "bg-[#FE7C6C]/20 text-[#72140F] font-bold" 
              : "text-[#5C403C] hover:bg-gray-50 font-semibold"
          }`}
        >
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/1furp97l_expires_30_days.png"
            className="w-4 h-4 mr-3 object-contain"
            alt="Laporan"
          />
          <span>Laporan Saya</span>
        </div>

        {/* Menu 3: Riwayat */}
        <div 
          onClick={() => navigate(currentRole === "admin" ? "/admin/riwayat-laporan" : "/mahasiswa/riwayat-laporan")} 
          className={`flex items-center py-3 px-4 rounded-xl cursor-pointer text-sm transition-colors ${
            isActive("/admin/riwayat-laporan") || isActive("/mahasiswa/riwayat-laporan")
              ? "bg-[#FE7C6C]/20 text-[#72140F] font-bold" 
              : "text-[#5C403C] hover:bg-gray-50 font-semibold"
          }`}
        >
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/mdmdza00_expires_30_days.png"
            className="w-4 h-4 mr-3 object-contain"
            alt="Riwayat"
          />
          <span>Riwayat</span>
        </div>
      </div>

      {/* Tombol Logout */}
      <div className="w-full p-4 border-t border-gray-100">
        <div 
          onClick={handleLogout}
          className="flex items-center text-[#5C403C] hover:bg-red-50 hover:text-[#960006] py-3 px-4 rounded-xl cursor-pointer text-sm font-bold transition-colors"
        >
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/3ecjwxqh_expires_30_days.png"
            className="w-4 h-4 mr-3 object-contain"
            alt="Logout"
          />
          <span>Logout</span>
        </div>
      </div>
    </aside>
  );
}