import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children, pageTitle, role }) {
  // Mengambil role dari localStorage jika props 'role' dari halaman induk lupa diisi
  const activeRole = role || localStorage.getItem("role") || "mahasiswa";

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans antialiased">
      {/* Gunakan activeRole yang sudah divalidasi */}
      <Sidebar role={activeRole} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle={pageTitle} role={activeRole} />

        <main className="flex-1 p-6 max-w-[1200px] w-full mx-auto flex flex-col gap-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}