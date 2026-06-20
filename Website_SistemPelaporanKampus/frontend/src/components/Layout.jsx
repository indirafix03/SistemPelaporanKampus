import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children, pageTitle, role }) {
  // Mengambil role dari localStorage jika props 'role' dari halaman induk lupa diisi
  const activeRole = role || localStorage.getItem("role") || "mahasiswa";

  return (
    // PERBAIKAN 1: Ganti 'min-h-screen' menjadi 'h-screen overflow-hidden'
    // Ini mengunci layar utama agar pas 100% tinggi monitor dan memotong luberan konten luar
    <div className="flex bg-gray-50 h-screen overflow-hidden font-sans antialiased">

      {/* Gunakan activeRole yang sudah divalidasi */}
      <Sidebar role={activeRole} />

      {/* PERBAIKAN 2: Berikan 'h-full' agar area kanan mengikuti tinggi container luar */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <Navbar pageTitle={pageTitle} role={activeRole} />

        {/* PERBAIKAN 3: Pastikan 'overflow-y-auto' bekerja maksimal mengisolasi scroll area konten */}
        <main className="flex-1 p-6 max-w-[1200px] w-full mx-auto flex flex-col gap-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}