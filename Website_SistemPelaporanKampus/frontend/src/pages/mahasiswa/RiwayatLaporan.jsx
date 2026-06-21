import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import jsPDF from "jspdf";
import 'jspdf-autotable';

export default function RiwayatLaporan() {
  const navigate = useNavigate();
  const { token } = useAuth();

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

      const response = await fetch(
        `http://127.0.0.1:8000/api/mahasiswa/reports/history?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setReports(data.daftar_laporan);
        setTotalSelesai(data.total_laporan_diselesaikan_all_time || 0);
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

  // ============================================================
  // PERBAIKAN FUNGSI EXPORT PDF — menggunakan autoTable(doc, ...)
  // ============================================================
  const handleExportPDF = () => {
    if (!reports || reports.length === 0) {
      alert("Tidak ada data laporan untuk diekspor.");
      return;
    }

    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(150, 0, 6);
    doc.text("RIWAYAT LAPORAN FASILITAS KAMPUS", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text(`Tanggal Ekspor: ${new Date().toLocaleString("id-ID")} WIB`, 14, 30);
    doc.text(`Total Laporan: ${totalData}`, 14, 37);

    // Siapkan data tabel
    const tableRows = reports.map((r) => [
      r.id_laporan || r.id || "-",
      new Date(r.created_at).toLocaleDateString("id-ID"),
      r.kategori || "-",
      r.lokasi_spesifik || "-",
      r.status || "-",
    ]);

    // ==========================================
    // PANGGIL autoTable sebagai FUNGSI, bukan method
    // ==========================================
    doc.autoTable({
      startY: 45,
      head: [["ID Laporan", "Tanggal", "Kategori", "Lokasi", "Status"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [150, 0, 6], textColor: [255, 255, 255], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 28 },
        2: { cellWidth: 35 },
        3: { cellWidth: "auto" },
        4: { cellWidth: 28 },
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(153, 153, 153);
        doc.text(
          `Halaman ${doc.internal.getCurrentPageInfo().pageNumber} dari ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      },
    });

    doc.save("Riwayat_Laporan_Saya.pdf");
  };

  // ========== SISANYA TETAP SAMA ==========
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
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
      <span
        className={`${
          isHighlight
            ? "bg-[#D7E2FF] text-[#004491]"
            : "bg-[#FBDBD8] text-[#5C403C]"
        } text-[10px] font-bold py-1 px-3 rounded-xl uppercase whitespace-nowrap`}
      >
        {kat}
      </span>
    );
  };

  return (
    <Layout role="mahasiswa" pageTitle="Riwayat Laporan">
      <div className="flex flex-col w-full gap-8">
        {/* JUDUL & TOMBOL EXPORT */}
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
            onClick={handleExportPDF}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export Riwayat (PDF)</span>
          </button>
        </div>

        {/* FILTER & SEARCH */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-end bg-white p-5 gap-4 rounded-xl border border-solid border-[#E5BDB8] shadow-sm">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[#5C403C] text-xs font-bold">Pencarian Cepat</label>
            <div className="flex items-center bg-[#FFF8F7] py-2.5 px-3 gap-2 rounded border border-solid border-[#E5BDB8]">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
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

        {/* TABEL */}
        <div className="bg-white rounded-xl border border-solid border-[#E5BDB8] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFE9E6] border-b border-[#E5BDB8]">
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">
                    ID LAPORAN
                  </th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">
                    TANGGAL
                  </th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider whitespace-nowrap">
                    KATEGORI
                  </th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">
                    LOKASI
                  </th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">
                    STATUS AKHIR
                  </th>
                  <th className="py-4 px-6 text-right text-[#5C403C] text-xs font-bold tracking-wider">
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-[#5C403C]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center italic font-medium">
                      Memuat riwayat laporan...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center italic font-medium">
                      Tidak ada laporan ditemukan.
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id_laporan} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#960006]">
                        {report.id_laporan}
                      </td>
                      <td className="py-4 px-6">{formatDate(report.created_at)}</td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getKategoriBadge(report.kategori)}
                      </td>
                      <td className="py-4 px-6 font-medium line-clamp-1 mt-3" title={report.lokasi_spesifik}>
                        {report.lokasi_spesifik}
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(report.status)}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() =>
                            navigate(
                              `/mahasiswa/detail-laporan/${encodeURIComponent(
                                report.id_laporan
                              )}`
                            )
                          }
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

          {/* PAGINATION */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-[#FFE9E6] py-4 px-6 gap-4 border-t border-[#E5BDB8]">
            <span className="text-[#5C403C] text-xs font-bold">
              Menampilkan {reports.length} dari {totalData} laporan
            </span>
            <div className="flex items-center gap-1">
              <button
                className={`w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-50 ${
                  currentPage === 1 ? "opacity-30 cursor-not-allowed" : ""
                }`}
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
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
              <button
                className={`w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-50 ${
                  currentPage >= Math.ceil(totalData / limit)
                    ? "opacity-30 cursor-not-allowed"
                    : ""
                }`}
                onClick={() =>
                  currentPage < Math.ceil(totalData / limit) &&
                  setCurrentPage(currentPage + 1)
                }
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full">
          <div className="flex-1 bg-[#FFF0EE] py-5 px-6 flex flex-col gap-2 rounded-xl border border-solid border-[#E5BDB8]">
            <h3 className="text-[#960006] text-xl font-bold">Informasi Penting</h3>
            <p className="text-[#5C403C] text-sm leading-relaxed font-medium">
              Laporan dalam arsip ini adalah riwayat aktivitas Anda selama satu tahun
              akademik terakhir. Gunakan tombol unduh untuk menyimpan tanda terima
              sebagai bukti fisik jika diperlukan oleh biro sarana dan prasarana.
            </p>
          </div>
          <div className="w-full lg:w-64 bg-[#960006] p-5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center shadow-md">
            <span className="text-white text-3xl font-extrabold tracking-tight">
              {totalSelesai}
            </span>
            <span className="text-red-200 text-[10px] font-bold tracking-wider uppercase">
              Laporan Selesai
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}