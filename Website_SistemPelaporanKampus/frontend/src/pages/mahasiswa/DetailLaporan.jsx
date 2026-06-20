import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

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
        const response = await fetch(`http://127.0.0.1:8000/api/mahasiswa/reports/${encodeURIComponent(report_id)}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setReport(data);
        } else {
          setError(data.detail || "Gagal memuat detail laporan");
        }
      } catch (err) {
        setError("Terjadi kesalahan koneksi ke server.");
      } finally {
        setLoading(false);
      }
    };

    if (token && report_id) fetchDetail();
  }, [token, report_id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options) + " WIB";
  };

  const getStatusBadge = (status) => {
    const styles = {
      "SELESAI": "bg-green-100 text-green-800",
      "DIBATALKAN": "bg-[#FFDAD6] text-[#93000A]",
      "DIPROSES": "bg-blue-100 text-blue-800",
      "PENDING": "bg-[#FE7C6C]/20 text-[#72140F]"
    };
    return (
      <span className={`${styles[status] || "bg-gray-100 text-gray-800"} py-1 px-4 rounded-full text-xs font-bold shrink-0`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout role="mahasiswa" pageTitle="Detail Laporan">
        <div className="py-20 text-center italic font-medium text-[#5C403C]">Memuat detail laporan...</div>
      </Layout>
    );
  }

  if (error || !report) {
    return (
      <Layout role="mahasiswa" pageTitle="Detail Laporan">
        <div className="py-20 text-center text-red-600 font-bold">
          {error || "Laporan tidak ditemukan."}
          <button onClick={() => navigate(-1)} className="block mx-auto mt-4 text-[#960006] underline">Kembali</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="mahasiswa" pageTitle="Detail Laporan">
      <div className="flex flex-col w-full gap-6">
        
        {/* ACTION HEADER: TOMBOL KEMBALI & JUDUL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <h1 className="text-[#960006] text-2xl sm:text-[32px] font-bold tracking-tight">
            Detail Laporan {report.id_laporan}
          </h1>
          <button 
            onClick={() => navigate("/mahasiswa/riwayat-laporan")}
            className="flex items-center text-[#960006] font-bold text-sm hover:underline"
          >
            &larr; Kembali ke Riwayat
          </button>
        </div>

        {/* MAIN GRID LAYOUT: KONTEN KIRI & TIMELINE KANAN */}
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
          
          {/* KOLOM KIRI: DETAIL FOTO, DESKRIPSI & TANGGAPAN */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            
            {/* CARD UTAMA LAPORAN */}
            <div className="bg-white p-5 flex flex-col gap-6 rounded-xl border border-solid border-[#E5BDB8] shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[#281715] text-xl font-bold">
                    {report.fasilitas}
                  </h2>
                  <p className="text-[#5C403C] text-sm font-medium">
                    {report.lokasi_spesifik}
                  </p>
                </div>
                {getStatusBadge(report.status)}
              </div>

              {/* FOTO BUKTI */}
              <div className="w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={report.foto_urls && report.foto_urls.length > 0 
                    ? `http://127.0.0.1:8000${report.foto_urls[0]}` 
                    : "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/7w73l09f_expires_30_days.png"}
                  className="w-full h-auto max-h-[400px] object-cover mx-auto"
                  alt="Foto Bukti Kerusakan"
                />
              </div>

              {/* DESKRIPSI */}
              <div className="flex flex-col gap-2">
                <h3 className="text-[#960006] text-base font-bold">
                  Deskripsi Laporan
                </h3>
                <p className="text-[#5C403C] text-sm leading-relaxed font-medium">
                  {report.deskripsi}
                </p>
              </div>
            </div>

            {/* CARD TANGGAPAN ADMIN */}
            <div className="bg-[#C01212] p-5 flex flex-col gap-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 text-white">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/5rn4ppvm_expires_30_days.png" 
                  className="w-5 h-5 object-contain brightness-200"
                  alt="Admin Response"
                />
                <span className="text-[#FFD1CA] text-lg font-bold">Tanggapan Admin</span>
              </div>
              <div className="bg-white p-4 rounded-lg flex flex-col gap-2 shadow-inner">
                <p className="text-[#281715] text-sm font-semibold leading-relaxed">
                  <span className="text-[#960006] font-bold">Admin:</span> {report.tanggapan_admin}
                </p>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: TIMELINE PROGRESS LAPORAN */}
          <div className="w-full lg:w-[400px] bg-white p-5 flex flex-col gap-6 rounded-xl border border-solid border-[#E5BDB8] shadow-sm shrink-0">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/u8n24ui3_expires_30_days.png" 
                className="w-5 h-5 object-contain"
                alt="Timeline Icon"
              />
              <h3 className="text-[#960006] text-lg font-bold">Timeline Riwayat Laporan</h3>
            </div>

            {/* NODE TIMELINE CONTAINER */}
            <div className="flex flex-col gap-6 relative pl-2">
              
              {/* Garis vertikal penghubung timeline */}
              <div className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>

              {/* LOOP DATA TIMELINE DARI BACKEND */}
              {[...report.timeline_riwayat].reverse().map((log, index) => (
                <div key={log.id} className="flex items-start gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-[#E5BDB8] flex items-center justify-center shrink-0">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-[#960006]" : "bg-gray-300"}`}></div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className={`text-sm font-bold ${index === 0 ? "text-[#960006]" : "text-[#281715]"}`}>
                      {log.status_log}
                    </h4>
                    <p className="text-[#5C403C] text-xs font-medium">{log.catatan}</p>
                    <span className="text-[#916F6A] text-[11px] font-bold mt-0.5">{formatDate(log.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* TOMBOL UNDUH */}
            <button 
              className="w-full bg-[#960006] text-white py-3 px-4 rounded-xl font-bold shadow-md hover:bg-[#72140F] transition-all text-sm mt-2 text-center"
              onClick={() => alert("Mengunduh tanda terima PDF...")}
            >
              Unduh Tanda Terima (PDF)
            </button>
          </div>

        </div>

      </div>
    </Layout>
  );
}