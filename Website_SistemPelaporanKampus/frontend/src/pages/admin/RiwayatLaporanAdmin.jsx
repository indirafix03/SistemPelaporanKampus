import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

export default function RiwayatLaporanAdmin() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // State Kontrol Filter & Pencarian
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("SELESAI");
  const [kategoriFilter, setKategoriFilter] = useState("Semua Kategori");
  
  // Data State
  const [reports, setReports] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 4; // limit per page

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchId) params.append("q_search", searchId);
      
      // Filter status final (SELESAI atau DIBATALKAN)
      if (statusFilter) {
        params.append("status_filter", statusFilter);
      }
      
      params.append("skip", (currentPage - 1) * limit);
      params.append("limit", limit);

      const res = await fetch(`http://127.0.0.1:8000/api/reports?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        // Filter kategori secara lokal di frontend karena backend tidak memiliki field kategori di query filter
        let list = data.daftar_laporan || [];
        if (kategoriFilter !== "Semua Kategori") {
          list = list.filter(r => r.kategori.toUpperCase() === kategoriFilter.toUpperCase());
        }
        setReports(list);
        setTotalData(kategoriFilter !== "Semua Kategori" ? list.length : data.total_data);
      } else {
        setError(data.detail || "Gagal mengambil riwayat laporan.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token, currentPage, statusFilter]);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchHistory();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString("id-ID", options) + " WIB";
  };

  const getInitial = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Layout role="admin" pageTitle="Riwayat Laporan">
      <div className="flex flex-col w-full gap-6">
        
        {/* HEADER & PENCARIAN */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full bg-[#FFF0EE] py-4 px-6 rounded-xl border border-[#E5BDB8] shadow-sm">
          <h1 className="text-[#960006] text-2xl font-bold shrink-0">Riwayat Laporan Kampus</h1>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="flex items-center bg-[#FFF8F7] py-2 px-4 gap-2 rounded-xl border border-[#E5BDB8] flex-1 sm:w-64">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Cari ID/nama/fasilitas..."
                className="bg-transparent text-sm w-full outline-none text-gray-700 placeholder-gray-500 font-medium"
              />
            </div>
            
            <button 
              onClick={handleFilter}
              className="bg-[#960006] hover:bg-[#72140F] text-white py-2 px-5 rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              Cari
            </button>
          </div>
        </div>

        {/* METRICS CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Metric 1 */}
          <div className="flex flex-col bg-white p-5 gap-3 rounded-xl border border-[#E5BDB8] shadow-sm">
            <div className="flex justify-between items-start">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div>
              <span className="text-[#5C403C] text-sm block mb-0.5">Total Riwayat Selesai</span>
              <span className="text-[#281715] text-[32px] font-bold leading-none">
                {loading ? "..." : totalData}
              </span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="flex flex-col bg-white p-5 gap-3 rounded-xl border border-[#E5BDB8] shadow-sm">
            <div className="flex justify-between items-start">
              <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded">Rata-rata</span>
            </div>
            <div>
              <span className="text-[#5C403C] text-sm block mb-0.5">Respons Perbaikan</span>
              <span className="text-[#281715] text-[32px] font-bold leading-none">4.5 Jam</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="flex justify-between items-center bg-[#FFF8F7] p-5 rounded-xl border border-[#E5BDB8] shadow-sm">
            <div className="flex flex-col gap-2 max-w-[65%]">
              <span className="text-[#5C403C] text-xs font-bold tracking-wider uppercase block">SOP Layanan</span>
              <h3 className="text-[#281715] text-lg font-bold leading-tight">Operasional Terstandar</h3>
              <p className="text-[#5C403C] text-[11px] font-medium">Seluruh penugasan diselesaikan berdasarkan regulasi kampus.</p>
            </div>
            <div className="p-3 bg-red-50 text-[#960006] rounded-xl shrink-0">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        {/* CONTROL FILTER PANEL */}
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center bg-[#FFF0EE] p-4 rounded-xl gap-4 border border-[#E5BDB8] shadow-sm">
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            {/* Filter Status */}
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-[#916F6A] text-[11px] font-bold">Status Final</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white text-[#281715] text-sm py-2.5 px-3 rounded border border-[#E5BDB8] outline-none cursor-pointer focus:border-[#960006] font-semibold"
              >
                <option value="SELESAI">Selesai (Resolved)</option>
                <option value="DIBATALKAN">Dibatalkan (Cancelled)</option>
              </select>
            </div>

            {/* Dropdown Kategori */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[#916F6A] text-[11px] font-bold">Kategori Fasilitas</label>
              <select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="bg-white text-[#281715] text-sm py-2.5 px-3 rounded border border-[#E5BDB8] outline-none cursor-pointer focus:border-[#960006] font-semibold"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="Fasilitas Kelas">Fasilitas Kelas</option>
                <option value="Laboratorium">Laboratorium</option>
                <option value="Toilet">Toilet / Saniter</option>
                <option value="Fasilitas Umum">Fasilitas Umum</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleFilter}
            className="flex items-center bg-[#FFF8F7] hover:bg-[#FFE2DE] py-2 px-5 gap-2 rounded-xl border border-[#960006] text-[#960006] text-sm font-bold transition-all shrink-0 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Terapkan Filter</span>
          </button>
        </div>

        {/* FEEDBACK ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* DATA TABEL RIWAYAT SELESAI */}
        <div className="bg-white rounded-xl border border-[#E5BDB8] shadow-sm overflow-hidden w-full">
          {/* Header Internal Tabel */}
          <div className="flex justify-between items-center bg-gray-50/50 p-5 border-b border-gray-100">
            <span className="text-[#281715] text-xl font-bold">Daftar Laporan Diarsipkan</span>
            <div className="flex items-center bg-[#D7E2FF] py-1 px-3 gap-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#004491] rounded-full"></span>
              <span className="text-[#004491] text-xs font-bold tracking-wide">Status Final</span>
            </div>
          </div>

          {/* Render Element Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF0EE] border-b border-[#E5BDB8]">
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">ID LAPORAN</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">MAHASISWA PELAPOR</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">FASILITAS / LOKASI</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">TEKNISI</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">TANGGAL UPDATE</th>
                  <th className="py-4 px-6 text-center text-[#5C403C] text-xs font-bold tracking-wider">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-[#281715]">
                {loading ? (
                  <tr><td colSpan="6" className="py-10 text-center italic font-medium">Memuat riwayat laporan...</td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan="6" className="py-10 text-center italic font-medium">Tidak ada riwayat laporan ditemukan.</td></tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-[#960006] block">{report.id}</span>
                      </td>
                      
                      {/* Mahasiswa */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#FBDBD8] text-[#960006] flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitial(report.pelapor?.nama_lengkap)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{report.pelapor?.nama_lengkap || "Staf/Admin"}</span>
                            <span className="text-[10px] text-gray-500">ID: {report.pelapor?.nomor_identitas || "-"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Fasilitas & Lokasi */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-800 block">{report.fasilitas}</span>
                        <span className="text-[#916F6A] text-xs block">{report.lokasi_spesifik}</span>
                      </td>

                      {/* Teknisi */}
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        {report.teknisi_nama || "Tidak ditugaskan"}
                      </td>

                      {/* Tanggal */}
                      <td className="py-4 px-6 text-gray-500 text-xs">
                        {formatDate(report.updated_at)}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => navigate(`/admin/detail-laporan/${encodeURIComponent(report.id)}`)}
                          className="text-[#004694] hover:text-[#002d66] text-xs font-bold underline cursor-pointer transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION PANEL */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white py-4 px-6 gap-4 border-t border-gray-100">
            <span className="text-[#5C403C] text-xs font-medium">
              Menampilkan {reports.length > 0 ? (currentPage - 1) * limit + 1 : 0}-
              {Math.min(currentPage * limit, totalData)} dari {totalData} riwayat laporan
            </span>
            <div className="flex items-center gap-1.5">
              <svg 
                className={`w-6 h-7 cursor-pointer border rounded p-1 hover:bg-gray-50 ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : ""}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              {[...Array(Math.ceil(totalData / limit))].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)}
                  className={`py-1 px-3 rounded font-bold text-xs ${currentPage === i + 1 ? "bg-[#960006] text-white" : "text-[#281715] hover:bg-gray-50 transition-colors border"}`}
                >
                  {i + 1}
                </button>
              ))}
              <svg 
                className={`w-6 h-7 cursor-pointer border rounded p-1 hover:bg-gray-50 ${currentPage >= Math.ceil(totalData / limit) ? "opacity-30 cursor-not-allowed" : ""}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                onClick={() => currentPage < Math.ceil(totalData / limit) && setCurrentPage(currentPage + 1)}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}