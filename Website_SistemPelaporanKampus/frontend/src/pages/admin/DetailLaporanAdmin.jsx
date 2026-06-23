import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

export default function DetailLaporanAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // State Management
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDirOpen, setIsDirOpen] = useState(false);

  const techniciansList = [
    {
      nama: "Budi Santoso",
      telepon: "0823-4567-8901",
      bidang: "AC & Pendingin Ruangan",
      spesialisasi: "Perbaikan AC Bocor, Isi Freon, Fan Motor",
      status: "Tersedia"
    },
    {
      nama: "Agus Mulyono",
      telepon: "0812-3456-7890",
      bidang: "Kelistrikan & Penerangan",
      spesialisasi: "Instalasi Jaringan Listrik, Saklar, Lampu Padam",
      status: "Sibuk"
    },
    {
      nama: "Heri Jatmiko",
      telepon: "0899-0123-4567",
      bidang: "Mebel & Perabot Fisik",
      spesialisasi: "Kursi/Meja Rusak, Papan Tulis, Pintu Kelas",
      status: "Tersedia"
    },
    {
      nama: "Rian Setiawan",
      telepon: "0878-9012-3456",
      bidang: "Sanitasi, Toilet & Plumbing",
      spesialisasi: "Pipa Bocor, Wastafel Mampet, Kran Air Rusak",
      status: "Tersedia"
    },
    {
      nama: "Fajar Pratama",
      telepon: "0856-7890-1234",
      bidang: "IT & Media Elektronik",
      spesialisasi: "LCD Proyektor, Kabel HDMI/VGA, Router/WiFi",
      status: "Tersedia"
    }
  ];

  // Form inputs
  const [statusInput, setStatusInput] = useState("PENDING");
  const [priorityInput, setPriorityInput] = useState("RENDAH");
  const [teknisiInput, setTeknisiInput] = useState("");
  const [catatanInput, setCatatanInput] = useState("");

  // Options
  const statusOptions = [
    { value: "PENDING", label: "PENDING (Menunggu Verifikasi)" },
    { value: "DIPROSES", label: "DIPROSES (Pengerjaan)" },
    { value: "SELESAI", label: "SELESAI" },
    { value: "DIBATALKAN", label: "DIBATALKAN" }
  ];

  const priorityOptions = [
    { value: "RENDAH", label: "Rendah" },
    { value: "SEDANG", label: "Sedang" },
    { value: "TINGGI", label: "Tinggi" }
  ];

  const fetchReportDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reports/${encodeURIComponent(id)}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (res.ok) {
        setReport(data);
        setStatusInput(data.status);
        setPriorityInput(data.prioritas || "RENDAH");
        setTeknisiInput(data.teknisi_nama || "");
      } else {
        setError(data.detail || "Gagal memuat detail laporan.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchReportDetail();
    }
  }, [token, id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setError("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/reports/${encodeURIComponent(id)}/action`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: statusInput,
          prioritas: priorityInput,
          teknisi_nama: teknisiInput || null,
          deskripsi_tanggapan_admin: catatanInput || null
        })
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Server Error (HTTP ${res.status})`);
      }

      if (res.ok) {
        setReport(data);
        setSuccessMessage("Perubahan status dan pengelolaan berhasil disimpan! Mengalihkan ke dashboard...");
        setCatatanInput(""); // Clear comment input
        
        // Otomatis kembali ke dashboard setelah 1.5 detik
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);

        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(data.detail || "Gagal menyimpan perubahan.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Kesalahan koneksi ke server saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (report) {
      setStatusInput(report.status);
      setPriorityInput(report.prioritas || "RENDAH");
      setTeknisiInput(report.teknisi_nama || "");
      setCatatanInput("");
      setSuccessMessage("");
      setError("");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
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

  const getStatusBadge = (status) => {
    const styles = {
      "PENDING": "bg-[#FFDAD6] text-[#93000A] border border-[#ffb4aa]",
      "DIPROSES": "bg-[#D7E2FF] text-[#004491] border border-[#adc6ff]",
      "SELESAI": "bg-emerald-100 text-emerald-800 border border-emerald-200",
      "DIBATALKAN": "bg-gray-100 text-gray-800 border border-gray-200"
    };
    return (
      <span className={`${styles[status] || "bg-gray-100 text-gray-800"} py-1 px-4 rounded-full text-xs font-bold shrink-0 border`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      "LOW": "bg-gray-100 text-gray-800 border border-gray-200",
      "RENDAH": "bg-gray-100 text-gray-800 border border-gray-200",
      "MEDIUM": "bg-amber-100 text-amber-800 border border-amber-200",
      "SEDANG": "bg-amber-100 text-amber-800 border border-amber-200",
      "HIGH": "bg-orange-100 text-orange-800 border border-orange-200",
      "TINGGI": "bg-orange-100 text-orange-800 border border-orange-200",
      "CRITICAL": "bg-red-100 text-red-800 border border-red-200"
    };
    const labels = {
      "LOW": "Rendah",
      "RENDAH": "Rendah",
      "MEDIUM": "Sedang",
      "SEDANG": "Sedang",
      "HIGH": "Tinggi",
      "TINGGI": "Tinggi",
      "CRITICAL": "Kritis"
    };
    return (
      <span className={`${styles[priority] || "bg-gray-100 text-gray-800"} py-0.5 px-3 rounded text-xs font-bold border`}>
        {labels[priority] || "Belum Ditentukan"}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout role="admin" pageTitle="Detail Laporan">
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#960006] border-t-transparent rounded-full animate-spin"></div>
          <span className="italic font-medium text-[#5C403C]">Memuat detail laporan...</span>
        </div>
      </Layout>
    );
  }

  if (error && !report) {
    return (
      <Layout role="admin" pageTitle="Detail Laporan">
        <div className="py-20 text-center text-red-600 font-bold max-w-md mx-auto flex flex-col gap-4">
          <p>{error}</p>
          <button 
            onClick={() => navigate("/admin/dashboard")} 
            className="px-4 py-2 bg-[#960006] text-white rounded hover:bg-[#72140F] transition-all text-sm font-semibold self-center"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin" pageTitle={`Detail Laporan ${report.id}`}>
      <div className="flex flex-col w-full gap-6">

        {/* FEEDBACK BANNER */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-fade-in">
            <span className="text-sm font-medium">{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm">&times;</button>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-fade-in">
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-bold text-sm">&times;</button>
          </div>
        )}

        {/* BREADCRUMB & TITLE HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full bg-[#FFF0EE] p-5 rounded-xl border border-[#E5BDB8] shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs text-[#5C403C] font-semibold">
              <span className="hover:underline cursor-pointer" onClick={() => navigate("/admin/dashboard")}>Dashboard</span>
              <span>&rsaquo;</span>
              <span className="text-[#960006]">Detail {report.id}</span>
            </div>
            <h1 className="text-[#960006] text-2xl md:text-3xl font-bold tracking-tight">
              Kelola Detail Laporan
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-lg border border-[#916f6a] text-[#960006] font-bold text-sm bg-white hover:bg-gray-50 transition-all focus:ring-2 focus:ring-[#960006]"
            >
              Reset Input
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#960006] hover:bg-[#72140F] disabled:bg-gray-400 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 focus:ring-2 focus:ring-red-400"
            >
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </header>

        {/* MAIN CONTROLLER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">

          {/* LEFT PANEL: DETAILS & CONTROL FORM */}
          <div className="lg:col-span-2 flex flex-col gap-6 w-full">
            
            {/* CARD 1: DETAIL TIKET LAPORAN */}
            <article className="bg-white p-6 rounded-xl border border-[#E5BDB8] shadow-sm flex flex-col gap-6">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#FE7C6C]/20 text-[#960006] flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[#960006] text-xl font-bold leading-tight">
                      {report.fasilitas}
                    </h2>
                    <p className="text-[#5C403C] text-sm font-medium mt-0.5">
                      Kategori: <span className="font-semibold text-gray-700">{report.kategori}</span>
                    </p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(report.status)}
                </div>
              </div>

              {/* METADATA GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                
                {/* Reporter / Pelapor */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#5C403C] text-xs font-bold uppercase tracking-wider">Pelapor</span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FBDBD8] text-[#960006] flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitial(report.pelapor?.nama_lengkap)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#281715]">{report.pelapor?.nama_lengkap || "Anonim"}</span>
                      <span className="text-xs text-[#5C403C]">ID: {report.pelapor?.nomor_identitas || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#5C403C] text-xs font-bold uppercase tracking-wider">Prioritas Saat Ini</span>
                  <div className="flex items-center mt-1">
                    {getPriorityBadge(report.prioritas)}
                  </div>
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#5C403C] text-xs font-bold uppercase tracking-wider">Tanggal Laporan</span>
                  <p className="font-semibold text-[#281715]">
                    {formatDate(report.created_at)}
                  </p>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#5C403C] text-xs font-bold uppercase tracking-wider">Lokasi Gedung / Kelas</span>
                  <p className="font-semibold text-[#281715]">
                    {report.lokasi_spesifik}
                  </p>
                </div>
              </div>

              {/* PHOTO ATTACHMENT */}
              <div className="flex flex-col gap-2">
                <span className="text-[#5C403C] text-xs font-bold uppercase tracking-wider">Lampiran Foto Bukti</span>
                {report.foto_url ? (
                  <div className={`grid ${report.foto_url.split(",").length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-2 p-2 w-full bg-[#ffe9e6] rounded-lg border border-[#E5BDB8]`}>
                    {report.foto_url.split(",").map((url, idx) => {
                      const fullUrl = url.startsWith("http")
                        ? url
                        : `http://127.0.0.1:8000${url.startsWith("/") ? "" : "/"}${url}`;
                      return (
                        <img
                          key={idx}
                          src={fullUrl}
                          alt={`Bukti foto ${idx + 1}`}
                          className="w-full h-auto max-h-80 object-cover object-center hover:scale-[1.02] transition-transform duration-350 rounded border border-gray-150"
                          onError={(e) => {
                            e.target.src = "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/7w73l09f_expires_30_days.png";
                          }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">Tidak ada foto bukti dilampirkan</span>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[#5C403C] text-xs font-bold uppercase tracking-wider">Deskripsi Masalah</span>
                <div className="bg-[#FFF8F7] p-4 rounded-lg border border-[#E5BDB8] shadow-inner text-[#281715] text-sm font-medium leading-relaxed">
                  {report.deskripsi}
                </div>
              </div>

            </article>

            {/* CARD 2: FORM PENGELOLAAN / TINDAKAN ADMIN */}
            <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-[#E5BDB8] shadow-sm flex flex-col gap-6">
              <h2 className="text-[#960006] text-xl font-bold border-b border-gray-100 pb-3">
                Tindakan Pengelolaan Laporan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* UBAH STATUS */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#5C403C] text-xs font-bold uppercase tracking-wider">Ubah Status</label>
                  <div className="relative">
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full bg-[#FFF8F7] border border-[#E5BDB8] rounded-lg px-4 py-2.5 text-[#281715] text-sm font-semibold outline-none focus:ring-2 focus:ring-[#FE7C6C] transition-all cursor-pointer"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* UBAH PRIORITAS */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#5C403C] text-xs font-bold uppercase tracking-wider">Prioritas Kerja</label>
                  <div className="relative">
                    <select
                      value={priorityInput}
                      onChange={(e) => setPriorityInput(e.target.value)}
                      className="w-full bg-[#FFF8F7] border border-[#E5BDB8] rounded-lg px-4 py-2.5 text-[#281715] text-sm font-semibold outline-none focus:ring-2 focus:ring-[#FE7C6C] transition-all cursor-pointer"
                    >
                      {priorityOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* NAMA TEKNISI */}
              <div className="flex flex-col gap-2">
                <label className="text-[#5C403C] text-xs font-bold uppercase tracking-wider">Petugas Teknisi Terkait</label>
                <input
                  type="text"
                  value={teknisiInput}
                  onChange={(e) => setTeknisiInput(e.target.value)}
                  placeholder="Contoh: Pak Mulyono (Teknisi Kelistrikan)"
                  className="w-full bg-[#FFF8F7] border border-[#E5BDB8] rounded-lg px-4 py-2.5 text-[#281715] text-sm font-medium outline-none focus:ring-2 focus:ring-[#FE7C6C] transition-all placeholder-gray-400"
                />
              </div>

              {/* TANGGAPAN ADMIN */}
              <div className="flex flex-col gap-2">
                <label className="text-[#5C403C] text-xs font-bold uppercase tracking-wider">Catatan Progres / Tanggapan Resmi Admin</label>
                <textarea
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  rows="4"
                  placeholder="Tambahkan catatan untuk mahasiswa pelapor mengenai progres perbaikan. Catatan ini juga akan dimasukkan ke log riwayat..."
                  className="w-full bg-[#FFF8F7] border border-[#E5BDB8] rounded-lg p-4 text-[#281715] text-sm font-medium outline-none focus:ring-2 focus:ring-[#FE7C6C] transition-all resize-none placeholder-gray-400"
                ></textarea>
              </div>

              {/* ACTION BUTTON BOTTOM */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-lg bg-[#960006] text-white hover:bg-[#72140F] disabled:bg-gray-400 font-bold text-sm shadow-md transition-all flex items-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-[#960006]"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Simpan Perubahan
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT PANEL: TIMELINE & ACTIONS DIRECTORY */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* CARD 3: TIMELINE / LOG RIWAYAT */}
            <section className="bg-white rounded-xl border border-[#E5BDB8] shadow-sm overflow-hidden flex flex-col">
              
              <div className="bg-[#FFF0EE] p-5 border-b border-[#E5BDB8] flex items-center gap-3">
                <svg className="w-5 h-5 text-[#960006]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-[#960006] text-lg font-bold">
                  Log Riwayat & Progres
                </h2>
              </div>

              {/* TIMELINE TREE */}
              <div className="p-5 flex flex-col gap-6 relative">
                
                {/* VERTICAL LINE */}
                <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-[#E5BDB8] z-0"></div>

                {report.logs && report.logs.length > 0 ? (
                  [...report.logs].reverse().map((log, index) => (
                    <div key={log.id} className="flex items-start gap-4 relative z-10 animate-fade-in">
                      
                      {/* NODE ICON */}
                      <div className="w-5 h-5 rounded-full bg-white border-4 border-[#E5BDB8] flex items-center justify-center shrink-0 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? "bg-[#960006]" : "bg-gray-400"}`}></div>
                      </div>

                      {/* CONTENT */}
                      <div className="flex flex-col gap-1">
                        <h4 className={`text-sm font-bold ${index === 0 ? "text-[#960006]" : "text-[#281715]"}`}>
                          {log.status_log}
                        </h4>
                        {log.catatan && (
                          <p className="text-gray-600 text-xs italic bg-gray-50 p-2 rounded border border-gray-150 leading-relaxed font-medium">
                            "{log.catatan}"
                          </p>
                        )}
                        <span className="text-[#916F6A] text-[10px] font-bold">
                          Oleh: {log.oleh_user} &bull; {formatDate(log.created_at)}
                        </span>
                      </div>

                    </div>
                  ))
                ) : (
                  <p className="text-center italic text-xs text-[#5C403C] py-4">Belum ada riwayat tercatat.</p>
                )}

              </div>
            </section>

            {/* CARD 4: HELP DIRECTORY */}
            <section className="bg-gradient-to-br from-[#960006] to-[#C01212] p-6 rounded-xl shadow-md text-white flex flex-col gap-4 relative overflow-hidden">
              {/* Backglow decoration */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg text-[#FFD1CA]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-[#FFD1CA] text-lg font-bold">
                  Hubungi Teknisi
                </h3>
              </div>

              <p className="text-red-100 text-xs leading-relaxed opacity-90">
                Butuh bantuan teknis lebih lanjut atau koordinasi cepat dengan tim teknisi lapangan? Buka direktori nomor kontak teknisi yang tersedia.
              </p>

              <button
                type="button"
                onClick={() => setIsDirOpen(true)}
                className="w-full bg-white hover:bg-red-50 text-[#960006] py-2.5 px-4 rounded-lg font-bold text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 focus:ring-2 focus:ring-white"
              >
                <span>Buka Direktori Teknisi</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </section>

          </div>

        </div>

      </div>

      {/* MODAL DIREKTORI TEKNISI */}
      {isDirOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl border border-[#E5BDB8] shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-fade-up">
            
            {/* Modal Header */}
            <div className="bg-[#FFF0EE] px-6 py-4 border-b border-[#E5BDB8] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-[#960006]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-[#960006] text-lg font-bold">Direktori & Penugasan Teknisi</h3>
              </div>
              <button 
                onClick={() => setIsDirOpen(false)}
                className="text-[#916F6A] hover:text-[#960006] font-bold text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-4">
              <p className="text-[#5C403C] text-sm leading-relaxed">
                Pilih teknisi yang sesuai dengan bidang fasilitas yang rusak untuk menetapkannya langsung ke form penugasan, atau klik nomor telepon untuk menghubungi mereka.
              </p>
              
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#FFF0EE] border-b border-[#E5BDB8] text-[#5C403C] text-xs font-bold uppercase">
                      <th className="py-3 px-4">Nama Teknisi</th>
                      <th className="py-3 px-4">Keahlian / Spesialisasi</th>
                      <th className="py-3 px-4">Telepon</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 text-[#281715]">
                    {techniciansList.map((tech) => (
                      <tr key={tech.nama} className="hover:bg-[#FFF8F7] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#281715]">{tech.nama}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold block text-sm">{tech.bidang}</span>
                          <span className="text-xs text-[#5C403C] block">{tech.spesialisasi}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#004491] hover:underline">
                          <a href={`tel:${tech.telepon}`}>{tech.telepon}</a>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            tech.status === "Tersedia" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {tech.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setTeknisiInput(tech.nama);
                              setIsDirOpen(false);
                            }}
                            className="bg-[#960006] text-white hover:bg-[#72140F] py-1 px-3 rounded text-xs font-bold shadow-sm transition-all"
                          >
                            Pilih Teknisi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-150 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDirOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg text-xs font-bold transition-all"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
}