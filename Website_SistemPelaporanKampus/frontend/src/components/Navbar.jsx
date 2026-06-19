import React from "react";
// Pastikan dua hook ini diimport dari react-router-dom
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ pageTitle, role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-[#FFF0EE] h-16 border-b border-solid border-[#E5BDB8] px-6 flex justify-between items-center shadow-sm">
      <h1 className="text-[#960006] text-xl font-bold tracking-tight">{pageTitle}</h1>
      
      <div className="flex items-center gap-6">
        {/* Navigasi Ringkas Atas */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-bold">
          <span 
            onClick={() => navigate(role === "admin" ? "/admin/dashboard" : "/mahasiswa/dashboard")}
            className={`cursor-pointer pb-1 transition-colors ${
              isActive("/mahasiswa/dashboard") || isActive("/admin/dashboard") 
                ? "text-[#960006] border-b-2 border-[#960006]" 
                : "text-[#A53A2F] hover:text-[#960006]"
            }`}
          >
            Beranda
          </span>
          <span 
            onClick={() => navigate(role === "admin" ? "/admin/dashboard" : "/mahasiswa/kirim-laporan")}
            className={`cursor-pointer pb-1 transition-colors ${
              isActive("/mahasiswa/kirim-laporan") 
                ? "text-[#960006] border-b-2 border-[#960006]" 
                : "text-[#A53A2F] hover:text-[#960006]"
            }`}
          >
            {role === "admin" ? "Semua Laporan" : "Laporan Saya"}
          </span>
        </nav>
        
        {/* Ikon Aksi Kanan */}
        <div className="flex items-center gap-4">
          <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/295tfoxn_expires_30_days.png" className="w-4 h-5 object-contain cursor-pointer" alt="Notifikasi" />
          <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/zkwfe3mp_expires_30_days.png" className="w-5 h-5 object-contain cursor-pointer" alt="Pengaturan" />
          <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/vspi7pnr_expires_30_days.png" className="w-7 h-7 rounded-full border border-solid border-[#E5BDB8] object-cover cursor-pointer" alt="Avatar" />
        </div>
      </div>
    </header>
  );
}