import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function DetailLaporan() {
  const navigate = useNavigate();
  const { id: report_id } = useParams();
  const { token } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/reports/${encodeURIComponent(report_id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setReport(data);
        } else {
          setError(data.detail || "Gagal memuat detail laporan");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Terjadi kesalahan koneksi ke server.");
      } finally {
        setLoading(false);
      }
    };

    if (token && report_id) fetchDetail();
  }, [token, report_id]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options) + " WIB";
  };

  const getStatusBadge = (status) => {
    const styles = {
      SELESAI: "bg-green-100 text-green-800",
      DIBATALKAN: "bg-[#FFDAD6] text-[#93000A]",
      DIPROSES: "bg-blue-100 text-blue-800",
      PENDING: "bg-[#FE7C6C]/20 text-[#72140F]",
    };
    return (
      <span className={`${styles[status] || "bg-gray-100 text-gray-800"} py-1 px-4 rounded-full text-xs font-bold shrink-0`}>
        {status || "PENDING"}
      </span>
    );
  };

  // ✅ FIX: pakai doc.autoTable() bukan autoTable(doc, ...)
  const handleDownloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(150, 0, 6);
    doc.text("TANDA TERIMA LAPORAN", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text(`ID Laporan: ${report.id || "-"}`, 14, 35);
    doc.text(
      `Tanggal: ${report.created_at
        ? new Date(report.created_at).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
          })
        : "-"}`,
      14, 42
    );

    // ✅ Ambil tanggapan dari log terakhir
    const logList = report.logs || report.timeline_riwayat || [];
    const tanggapan = logList.length > 0
      ? logList[logList.length - 1].catatan || "Belum ada tanggapan"
      : "Belum ada tanggapan";

    const rows = [
      ["Fasilitas", report.fasilitas || "-"],
      ["Lokasi", report.lokasi_spesifik || "-"],
      ["Kategori", report.kategori || "-"],
      ["Status", report.status || "-"],
      ["Deskripsi", report.deskripsi || "-"],
      ["Tanggapan Admin", tanggapan],
    ];

    // ✅ FIX: doc.autoTable() bukan autoTable(doc, ...)
    doc.autoTable({
      startY: 50,
      head: [["Informasi", "Detail"]],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [150, 0, 6], textColor: [255, 255, 255], fontSize: 11 },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: "auto" },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(102, 102, 102);
    doc.text(
      `Dicetak pada: ${new Date().toLocaleString("id-ID")} WIB`,
      pageWidth / 2, finalY, { align: "center" }
    );

    doc.save(`Tanda_Terima_${report.id || "laporan"}.pdf`);
  };

  if (loading) {
    return (
      <Layout role="mahasiswa" pageTitle="Detail Laporan">
        <div className="py-20 text-center italic font-medium text-[#5C403C]">
          Memuat detail laporan...
        </div>
      </Layout>
    );
  }

  if (error || !report) {
    return (
      <Layout role="mahasiswa" pageTitle="Detail Laporan">
        <div className="py-20 text-center text-red-600 font-bold">
          {error || "Laporan tidak ditemukan."}
          <button
            onClick={() => navigate("/mahasiswa/riwayat-laporan")}
            className="block mx-auto mt-4 text-[#960006] underline"
          >
            Kembali ke Riwayat
          </button>
        </div>
      </Layout>
    );
  }

  let fotoList = [];
  if (report.foto_urls && Array.isArray(report.foto_urls)) {
    fotoList = report.foto_urls;
  } else if (report.foto_url && typeof report.foto_url === "string") {
    fotoList = report.foto_url.split(",").filter(url => url.trim() !== "");
  } else if (typeof report.foto === "string") {
    fotoList = report.foto.split(",").filter(url => url.trim() !== "");
  }

  const BASE_URL = "http://127.0.0.1:8000";
  const PLACEHOLDER =
    "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/7w73l09f_expires_30_days.png";

  // ✅ FIX: ambil dari `logs` ATAU `timeline_riwayat` (fallback)
  const logList = report.logs || report.timeline_riwayat || [];

  // ✅ Ambil catatan terbaru dari admin sebagai tanggapan
  const tanggapanAdmin = (() => {
    if (!logList || logList.length === 0) return null;
    // Cari log yang punya catatan dari admin (bukan log pertama "Laporan Diajukan")
    const logsWithCatatan = [...logList]
      .reverse()
      .find(log => log.catatan && !log.catatan.includes("menunggu verifikasi"));
    return logsWithCatatan?.catatan || null;
  })();

  const getFriendlyDescription = (log) => {
    let desc = log.status_log || "Update status";
    const lower = desc.toLowerCase();
    if (lower.includes("diajukan") || lower.includes("pending")) {
      desc = "Laporan berhasil dibuat oleh mahasiswa dan menunggu verifikasi admin.";
    } else if (lower.includes("diproses")) {
      desc = "Laporan sedang dalam proses penanganan oleh tim teknisi.";
    } else if (lower.includes("selesai")) {
      desc = "Laporan telah selesai ditangani.";
    } else if (lower.includes("dibatalkan")) {
      desc = "Laporan dibatalkan.";
    }
    if (log.catatan) {
      desc = log.catatan;
    }
    return desc;
  };

  return (
    <Layout role="mahasiswa" pageTitle="Detail Laporan">
      <div className="flex flex-col w-full gap-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <h1 className="text-[#960006] text-2xl sm:text-[32px] font-bold tracking-tight">
            Detail Laporan {report.id}
          </h1>
          <button
            onClick={() => navigate("/mahasiswa/riwayat-laporan")}
            className="flex items-center text-[#960006] font-bold text-sm hover:underline"
          >
            &larr; Kembali ke Riwayat
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full">

          {/* KOLOM KIRI */}
          <div className="flex-1 flex flex-col gap-6 w-full">

            {/* CARD UTAMA */}
            <div className="bg-white p-5 flex flex-col gap-6 rounded-xl border border-solid border-[#E5BDB8] shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[#281715] text-xl font-bold">
                    {report.fasilitas || "-"}
                  </h2>
                  <p className="text-[#5C403C] text-sm font-medium">
                    {report.lokasi_spesifik || "-"}
                  </p>
                </div>
                {getStatusBadge(report.status)}
              </div>

              {/* FOTO */}
              <div className="w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                {fotoList.length > 0 ? (
                  <div className={`grid ${fotoList.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-2 p-2`}>
                    {fotoList.map((url, idx) => {
                      const fullUrl = url.startsWith("http")
                        ? url
                        : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
                      return (
                        <img
                          key={idx}
                          src={fullUrl}
                          alt={`Foto bukti ${idx + 1}`}
                          className="w-full h-auto max-h-[300px] object-cover rounded border border-gray-100"
                          onError={(e) => { e.target.src = PLACEHOLDER; }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <img
                    src={PLACEHOLDER}
                    className="w-full h-auto max-h-[300px] object-cover mx-auto"
                    alt="Tidak ada foto bukti"
                  />
                )}
              </div>

              {/* DESKRIPSI */}
              <div className="flex flex-col gap-2">
                <h3 className="text-[#960006] text-base font-bold">Deskripsi Laporan</h3>
                <p className="text-[#5C403C] text-sm leading-relaxed font-medium">
                  {report.deskripsi || "-"}
                </p>
              </div>
            </div>

            {/* TANGGAPAN ADMIN */}
            <div className="bg-[#C01212] p-5 flex flex-col gap-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="text-[#FFD1CA] text-lg font-bold">Tanggapan Admin</span>
              </div>
              <div className="bg-white p-4 rounded-lg flex flex-col gap-2 shadow-inner">
                <p className="text-[#281715] text-sm font-semibold leading-relaxed">
                  <span className="text-[#960006] font-bold">Admin: </span>
                  {/* ✅ FIX: ambil dari tanggapanAdmin yang diambil dari logs */}
                  {tanggapanAdmin || "Belum ada tanggapan dari admin."}
                </p>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: TIMELINE */}
          <div className="w-full lg:w-[400px] bg-white p-5 flex flex-col gap-6 rounded-xl border border-solid border-[#E5BDB8] shadow-sm shrink-0">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <svg className="w-5 h-5 text-[#960006]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-[#960006] text-lg font-bold">Timeline Riwayat Laporan</h3>
            </div>

            {/* ✅ FIX: pakai logList yang sudah fallback ke logs atau timeline_riwayat */}
            <div className="flex flex-col gap-4 relative pl-2">
              <div className="absolute left-[5px] top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>

              {logList.length > 0 ? (
                [...logList].reverse().map((log, index) => {
                  const isLatest = index === 0;
                  const desc = getFriendlyDescription(log);

                  return (
                    <div key={log.id || index} className="flex items-start gap-3 relative z-10">
                      <div className="flex items-center justify-center shrink-0 mt-3">
                        <div className={`w-3 h-3 rounded-full ${isLatest ? "bg-[#960006]" : "bg-gray-300"}`}></div>
                      </div>

                      {isLatest ? (
                        <div className="flex-1 bg-[#960006] rounded-xl p-4 flex flex-col gap-1 shadow-md">
                          <h4 className="text-white text-sm font-bold">
                            {log.status_log || "Update Terbaru"}
                          </h4>
                          <p className="text-white/90 text-xs leading-relaxed">{desc}</p>
                          <span className="text-white/70 text-[11px] font-semibold mt-0.5">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col gap-0.5 py-1">
                          <h4 className="text-[#281715] text-sm font-bold">
                            {log.status_log || "Riwayat Sebelumnya"}
                          </h4>
                          <p className="text-[#5C403C] text-xs font-medium leading-relaxed">{desc}</p>
                          <span className="text-[#916F6A] text-[11px] font-bold mt-0.5">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-[#5C403C] text-sm italic pl-4">Belum ada riwayat.</p>
              )}
            </div>

            {/* TOMBOL UNDUH PDF */}
            <button
              className="w-full bg-[#960006] text-white py-3 px-4 rounded-xl font-bold shadow-md hover:bg-[#72140F] transition-all text-sm mt-2 text-center"
              onClick={handleDownloadPDF}
            >
              Unduh Tanda Terima (PDF)
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}