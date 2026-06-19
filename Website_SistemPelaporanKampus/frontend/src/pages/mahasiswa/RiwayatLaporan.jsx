import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

export default function RiwayatLaporan() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // State untuk data dan filter
  const [reports, setReports] = useState([]);
  const [totalSelesai, setTotalSelesai] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const limit = 4;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q_search", search);
      if (kategori) params.append("kategori", kategori);
      params.append("skip", (currentPage - 1) * limit);
      params.append("limit", limit);

      const response = await fetch(`http://127.0.0.1:8000/api/mahasiswa/reports/history?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setReports(data.daftar_laporan);
        setTotalSelesai(data.total_laporan_diselesaikan_all_time);
        setTotalData(data.total_data);
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token, currentPage]);

  const handleFilter = () => {
    setCurrentPage(1);
    if (currentPage === 1) fetchHistory();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SELESAI":
        return (
          <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-bold py-1 px-3 rounded-xl gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>Selesai
          </span>
        );
      case "DIBATALKAN":
        return (
          <span className="inline-flex items-center bg-[#FFDAD6] text-[#93000A] text-xs font-bold py-1 px-3 rounded-xl gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#BA1A1A] rounded-full"></span>Dibatalkan
          </span>
        );
      case "DIPROSES":
        return (
          <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-bold py-1 px-3 rounded-xl gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>Diproses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-bold py-1 px-3 rounded-xl gap-1.5">
            <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>Menunggu
          </span>
        );
    }
  };

  const getKategoriBadge = (kat) => {
    const isHighlight = ["LISTRIK", "SANITASI", "TOILET / SANITER"].includes(kat);
    return (
      <span className={`${isHighlight ? "bg-[#D7E2FF] text-[#004491]" : "bg-[#FBDBD8] text-[#5C403C]"} text-[10px] font-bold py-1 px-3 rounded-xl uppercase whitespace-nowrap`}>
        {kat}
      </span>
    );
  };

  return (
    <Layout role="mahasiswa" pageTitle="Riwayat Laporan">
      
      {/* AREA UTAMA HALAMAN */}
      <div className="flex flex-col w-full gap-8">
        
        {/* JUDUL HALAMAN & AKSI EXPORT */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#281715] text-[32px] font-bold tracking-tight">
              Arsip Laporan Saya
            </h1>
            <p className="text-[#5C403C] text-base">
              Pantau dan tinjau riwayat laporan fasilitas yang telah selesai diproses.
            </p>
          </div>
          <button 
            className="flex items-center bg-[#FFF8F7] py-[11px] px-[25px] gap-[7px] rounded-lg border border-solid border-[#916F6A] hover:bg-[#FFE9E6] transition-colors font-bold text-[#960006]"
            onClick={() => alert("Mengekspor PDF...")}
          >
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/wrb9axap_expires_30_days.png" 
              className="w-5 h-5 object-contain"
              alt="Icon PDF"
            />
            <span>Export Riwayat (PDF)</span>
          </button>
        </div>

        {/* INTERACTIVE FILTER & SEARCH BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-end bg-white p-5 gap-4 rounded-xl border border-solid border-[#E5BDB8] shadow-sm">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[#5C403C] text-xs font-bold">Pencarian Cepat</label>
            <div className="flex items-center bg-[#FFF8F7] py-2.5 px-3 gap-2 rounded border border-solid border-[#E5BDB8]">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/flif2fmt_expires_30_days.png" 
                className="w-4 h-4 object-contain"
                alt="Search Icon"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Masukkan nama gedung atau ID Laporan..."
                className="bg-transparent text-sm w-full outline-none text-gray-700 placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#5C403C] text-xs font-bold">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full bg-[#FFF8F7] text-[#281715] text-sm py-2.5 px-3 rounded border border-solid border-[#E5BDB8] outline-none cursor-pointer font-medium"
            >
              <option value="">Semua Kategori</option>
              <option value="Fasilitas Kelas">Fasilitas Kelas</option>
              <option value="Laboratorium">Laboratorium</option>
              <option value="Toilet">Toilet / Saniter</option>
              <option value="Fasilitas Umum">Fasilitas Umum</option>
            </select>
          </div>

          <button
            className="w-full bg-[#A53A2F] text-white py-2.5 px-6 rounded font-bold shadow-sm hover:bg-[#960006] transition-colors text-sm"
            onClick={handleFilter}
          >
            Terapkan
          </button>
        </div>

        {/* CONTAINER DATA TABEL RIWAYAT */}
        <div className="bg-white rounded-xl border border-solid border-[#E5BDB8] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFE9E6] border-b border-[#E5BDB8]">
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">ID LAPORAN</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">TANGGAL</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider whitespace-nowrap">KATEGORI</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">LOKASI</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">STATUS AKHIR</th>
                  <th className="py-4 px-6 text-right text-[#5C403C] text-xs font-bold tracking-wider">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-[#5C403C]">
                {loading ? (
                  <tr><td colSpan="6" className="py-10 text-center italic font-medium">Memuat riwayat laporan...</td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan="6" className="py-10 text-center italic font-medium">Tidak ada laporan ditemukan.</td></tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id_laporan} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#960006]">{report.id_laporan}</td>
                      <td className="py-4 px-6">{formatDate(report.created_at)}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{getKategoriBadge(report.kategori)}</td>
                      <td className="py-4 px-6 font-medium line-clamp-1 mt-3" title={report.lokasi_spesifik}>
                        {report.lokasi_spesifik}
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(report.status)}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate(`/mahasiswa/detail-laporan/${report.id_laporan}`)}
                          className="text-[#A53A2F] hover:text-[#960006] font-bold text-sm inline-flex items-center gap-1"
                        >
                          <span>Lihat Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PANEL PAGINATION BAWAH TABEL */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-[#FFE9E6] py-4 px-6 gap-4 border-t border-[#E5BDB8]">
            <span className="text-[#5C403C] text-xs font-bold">
              Menampilkan {reports.length} dari {totalData} laporan
            </span>
            <div className="flex items-center gap-1">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/bemvbqmq_expires_30_days.png" 
                className={`w-[22px] h-[25px] object-contain cursor-pointer ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : "opacity-100"}`}
                alt="Prev"
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              />
              {[...Array(Math.ceil(totalData / limit))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`py-1 px-3 rounded font-bold text-xs transition-colors ${
                    currentPage === i + 1 
                      ? "bg-[#960006] text-white" 
                      : "text-[#281715] hover:bg-white/40"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/9tr76xja_expires_30_days.png" 
                className={`w-[22px] h-[25px] object-contain cursor-pointer ${currentPage >= Math.ceil(totalData / limit) ? "opacity-30 cursor-not-allowed" : "opacity-100"}`}
                alt="Next"
                onClick={() => currentPage < Math.ceil(totalData / limit) && setCurrentPage(currentPage + 1)}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM INFORMASI EXTRA FOOTER */}
        <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full">
          <div className="flex-1 bg-[#FFF0EE] py-5 px-6 flex flex-col gap-2 rounded-xl border border-solid border-[#E5BDB8]">
            <h3 className="text-[#960006] text-xl font-bold">Informasi Penting</h3>
            <p className="text-[#5C403C] text-sm leading-relaxed font-medium">
              Laporan dalam arsip ini adalah riwayat aktivitas Anda selama satu tahun akademik terakhir. 
              Gunakan tombol unduh untuk menyimpan tanda terima sebagai bukti fisik jika diperlukan oleh biro sarana dan prasarana.
            </p>
          </div>
          
          <div className="w-full lg:w-64 bg-[#960006] p-5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center shadow-md">
            <span className="text-white text-3xl font-extrabold tracking-tight">{totalSelesai}</span>
            <span className="text-red-200 text-[10px] font-bold tracking-wider uppercase">Laporan Selesai</span>
          </div>
        </div>

      </div>
    </Layout>
  );
}