import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

export default function RiwayatLaporanAdmin() {
  const navigate = useNavigate();

  // State Kontrol Filter & Pencarian
  const [searchId, setSearchId] = useState("");
  const [rentangWaktu, setRentangWaktu] = useState("Bulan Ini");
  const [kategoriFilter, setKategoriFilter] = useState("Semua Kategori");

  // Data tiruan daftar laporan yang telah diselesaikan (Status Final)
  const daftarRiwayat = [
    {
      id: "#REP-8821",
      pelapor: "Indira Ramayani",
      inisial: "IR",
      fasilitas: "AC Ruang Kuliah PB 203",
      teknisi: "Budi Santoso",
      tanggalSelesai: "24 Feb 2026, 14:30"
    },
    {
      id: "#REP-8819",
      pelapor: "Natasya",
      inisial: "NS",
      fasilitas: "Proyektor Lab Komputer 1",
      teknisi: "Agus Setiawan",
      tanggalSelesai: "23 Maret 2026, 11:15"
    },
    {
      id: "#REP-8815",
      pelapor: "Dewi Astuti Muchtar",
      inisial: "DM",
      fasilitas: "Kursi Rusak PBT",
      teknisi: "Heri Jatmiko",
      tanggalSelesai: "22 Maret 2026, 16:45"
    },
    {
      id: "#REP-8810",
      pelapor: "Salsa",
      inisial: "SS",
      fasilitas: "Kekurangan Kursi PBT 203",
      teknisi: "Budi Santoso",
      tanggalSelesai: "12 Mei 2026, 09:00"
    }
  ];

  return (
    <Layout role="admin" pageTitle="Riwayat Laporan">
      <div className="flex flex-col w-full gap-6">
        
        {/* HEADER & PENCARIAN */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full bg-[#FFF0EE] py-4 px-6 rounded-xl border border-[#E5BDB8] shadow-sm">
          <h1 className="text-[#281715] text-2xl font-bold shrink-0">Riwayat Laporan</h1>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="flex items-center bg-[#FFF8F7] py-2 px-4 gap-2 rounded-xl border border-[#E5BDB8] flex-1 sm:w-64">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/09p2pq86_expires_30_days.png"
                className="w-[18px] h-5"
                alt="Search"
              />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Cari ID Laporan..."
                className="bg-transparent text-sm w-full outline-none text-gray-700 placeholder-gray-500 font-medium"
              />
            </div>

            {/* Icon Pendukung Kanan */}
            <div className="flex items-center justify-end gap-4 px-2 shrink-0">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/cg8bjd33_expires_30_days.png" className="w-4 h-5 cursor-pointer" alt="Notification" />
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/kb2fa52g_expires_30_days.png" className="w-5 h-5 cursor-pointer" alt="Settings" />
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/cqnkq9tb_expires_30_days.png" className="w-8 h-8 rounded-full border border-gray-200" alt="Avatar" />
            </div>
          </div>
        </div>

        {/* METRICS CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Metric 1 */}
          <div className="flex flex-col bg-[#FFF8F7] p-5 gap-3 rounded-xl border border-[#E5BDB8] shadow-sm">
            <div className="flex justify-between items-start">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/po1bcj3p_expires_30_days.png" className="w-9 h-9" alt="Icon Success" />
              <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded">+12%</span>
            </div>
            <div>
              <span className="text-[#5C403C] text-sm block mb-0.5">Total Selesai</span>
              <span className="text-[#281715] text-[32px] font-bold leading-none">1,248</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="flex flex-col bg-[#FFF8F7] p-5 gap-3 rounded-xl border border-[#E5BDB8] shadow-sm">
            <div className="flex justify-between items-start">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/c7y3aron_expires_30_days.png" className="w-9 h-8" alt="Icon Clock" />
              <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded">-2 jam</span>
            </div>
            <div>
              <span className="text-[#5C403C] text-sm block mb-0.5">Rerata Respon</span>
              <span className="text-[#281715] text-[32px] font-bold leading-none">4.5j</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="flex justify-between items-center bg-[#FFF8F7] p-5 rounded-xl border border-[#E5BDB8] shadow-sm">
            <div className="flex flex-col gap-2 max-w-[65%]">
              <span className="text-[#5C403C] text-xs font-bold tracking-wider uppercase block">Efisiensi Pemeliharaan</span>
              <h3 className="text-[#281715] text-lg font-bold leading-tight">Status Operasional Optimal</h3>
              <p className="text-[#5C403C] text-[11px] font-medium">Semua sistem berjalan dengan baik di Gedung A & B</p>
            </div>
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/apmee46l_expires_30_days.png"
              className="w-20 h-20 rounded-lg object-cover shrink-0"
              alt="Efficiency Graphic"
            />
          </div>
        </div>

        {/* CONTROL FILTER PANEL */}
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center bg-[#FFF0EE] p-4 rounded-xl gap-4 border border-[#E5BDB8] shadow-sm">
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            {/* Dropdown Rentang Waktu */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-[#916F6A] text-[11px] font-bold">Rentang Waktu</label>
              <select
                value={rentangWaktu}
                onChange={(e) => setRentangWaktu(e.target.value)}
                className="bg-white text-[#281715] text-sm py-2 px-3 rounded border border-[#E5BDB8] outline-none cursor-pointer focus:border-[#960006]"
              >
                <option>Bulan Ini</option>
                <option>Hari Ini</option>
                <option>Semester Ini</option>
                <option>Tahun Ini</option>
              </select>
            </div>

            {/* Dropdown Kategori */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[#916F6A] text-[11px] font-bold">Kategori Fasilitas</label>
              <select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="bg-white text-[#281715] text-sm py-2 px-3 rounded border border-[#E5BDB8] outline-none cursor-pointer focus:border-[#960006]"
              >
                <option>Semua Kategori</option>
                <option>Kelistrikan</option>
                <option>AC / Pendingin</option>
                <option>Mebel / Sarana</option>
              </select>
            </div>
          </div>

          <button 
            onClick={() => alert(`Menerapkan filter: ${rentangWaktu} - ${kategoriFilter}`)}
            className="flex items-center bg-[#FFF8F7] hover:bg-[#FFE2DE] py-2 px-5 gap-2 rounded-xl border border-[#960006] text-[#960006] text-sm font-bold transition-all shrink-0 w-full sm:w-auto justify-center"
          >
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/jeo0yn4t_expires_30_days.png" className="w-4 h-3" alt="filter icon" />
            <span>Terapkan Filter</span>
          </button>
        </div>

        {/* DATA TABEL RIWAYAT SELESAI */}
        <div className="bg-[#FFF8F7] rounded-xl border border-[#E5BDB8] shadow-sm overflow-hidden w-full">
          {/* Header Internal Tabel */}
          <div className="flex justify-between items-center bg-white p-5 border-b border-gray-100">
            <span className="text-[#281715] text-xl font-bold">Daftar Laporan Selesai</span>
            <div className="flex items-center bg-[#D7E2FF] py-1 px-3 gap-1.5 rounded-full">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/tzdbotgi_expires_30_days.png" className="w-3 h-3" alt="badge" />
              <span className="text-[#004491] text-xs font-bold tracking-wide">Status Final</span>
            </div>
          </div>

          {/* Render Element Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF0EE] border-b border-[#E5BDB8]">
                  <th className="py-3.5 px-6 text-[#5C403C] text-xs font-bold tracking-wider">ID LAPORAN</th>
                  <th className="py-3.5 px-6 text-[#5C403C] text-xs font-bold tracking-wider">MAHASISWA PELAPOR</th>
                  <th className="py-3.5 px-6 text-[#5C403C] text-xs font-bold tracking-wider">FASILITAS</th>
                  <th className="py-3.5 px-6 text-[#5C403C] text-xs font-bold tracking-wider">TEKNISI</th>
                  <th className="py-3.5 px-6 text-[#5C403C] text-xs font-bold tracking-wider">TANGGAL SELESAI</th>
                  <th className="py-3.5 px-6 text-center text-[#5C403C] text-xs font-bold tracking-wider">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-[#281715]">
                {daftarRiwayat.map((riwayat, index) => (
                  <tr key={index} className="hover:bg-white/60 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-6 font-bold text-[#960006]">{riwayat.id}</td>
                    
                    {/* Mahasiswa */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FBDBD8] text-[#960006] flex items-center justify-center font-bold text-[10px] shrink-0">
                          {riwayat.inisial}
                        </div>
                        <span className="font-medium">{riwayat.pelapor}</span>
                      </div>
                    </td>

                    {/* Fasilitas */}
                    <td className="py-4 px-6 text-gray-700">{riwayat.fasilitas}</td>

                    {/* Teknisi */}
                    <td className="py-4 px-6 text-gray-700 font-medium">{riwayat.teknisi}</td>

                    {/* Tanggal */}
                    <td className="py-4 px-6 text-gray-500 text-xs">{riwayat.tanggalSelesai}</td>

                    {/* Aksi */}
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => alert(`Membuka detail berkas ${riwayat.id}`)}
                        className="text-[#004694] hover:text-[#002d66] text-xs font-bold underline cursor-pointer transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION PANEL */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white py-4 px-6 gap-4 border-t border-gray-100">
            <span className="text-[#5C403C] text-xs font-medium">
              Menampilkan 4 dari 450 laporan
            </span>
            <div className="flex items-center gap-1.5">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/sezm86xc_expires_30_days.png" className="w-6 h-7 cursor-pointer hover:opacity-80" alt="Prev" />
              <button className="bg-[#960006] text-white py-1 px-3 rounded font-bold text-xs shadow-sm">1</button>
              <button className="text-[#281715] hover:bg-gray-50 py-1 px-3 rounded border border-[#E5BDB8] font-bold text-xs transition-colors">2</button>
              <button className="text-[#281715] hover:bg-gray-50 py-1 px-3 rounded border border-[#E5BDB8] font-bold text-xs transition-colors">3</button>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/0j4q54bk_expires_30_days.png" className="w-6 h-7 cursor-pointer hover:opacity-80" alt="Next" />
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}