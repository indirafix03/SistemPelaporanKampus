import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

export default function KirimLaporan() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // State untuk menangkap inputan Form Laporan Kerusakan
  const [kategori, setKategori] = useState("");
  const [fasilitas, setFasilitas] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fungsi pengiriman form laporan ke API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!kategori || !fasilitas || !lokasi || !deskripsi) {
      setError("Harap isi semua kolom laporan yang tersedia!");
      return;
    }
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("kategori", kategori);
      formData.append("fasilitas", fasilitas);
      formData.append("lokasi_spesifik", lokasi);
      formData.append("deskripsi", deskripsi);
      if (foto) { // Backend mengharapkan 'files' sebagai list, meskipun hanya satu file
        formData.append("files", foto);
      }

      const response = await fetch("http://127.0.0.1:8000/api/mahasiswa/reports", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Gagal mengirim laporan");
      }
      
      alert(`Laporan Berhasil Dikirim!\nID Laporan: ${data.id_laporan}`);
      navigate("/mahasiswa/dashboard");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi menangkap file saat user memilih foto bukti
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };

  return (
    // Membungkus halaman dengan Layout dinamis khusus role mahasiswa
    <Layout role="mahasiswa" pageTitle="Buat Laporan">
      
      {/* AREA HEADER UTAMA HALAMAN */}
      <div>
        <h1 className="text-[#960006] text-[32px] font-bold leading-tight">
          Buat Laporan Kerusakan
        </h1>
        <p className="text-[#A53A2F] text-base mt-1">
          Bantu kami menjaga kenyamanan fasilitas kampus dengan melaporkan setiap kendala yang Anda temui.
        </p>
      </div>

      {/* STRUKTUR GRID: FORMULIR KIRI & ALUR PANDUAN KANAN */}
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
        
        {/* INTERACTIVE FORMULIR COMPONENT */}
        <form 
          onSubmit={handleSubmit}
          className="flex-1 w-full bg-white p-6 flex flex-col gap-5 rounded-xl border border-solid border-[#E5BDB8] shadow-sm"
        >
          {/* Alert Pesan Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-xs font-medium">
              {error}
            </div>
          )}

          {/* Row Grid: Pilihan Dropdown Kategori & Jenis Fasilitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[#5C403C] text-xs font-bold">Pilih Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full bg-[#FFF0EE] text-[#281715] text-sm py-2.5 px-3 rounded border border-solid border-[#E5BDB8] outline-none cursor-pointer focus:border-[#960006] font-medium"
              >
                <option value="" disabled>-- Pilih Kategori --</option>
                <option value="Fasilitas Kelas">Fasilitas Kelas</option>
                <option value="Laboratorium">Laboratorium</option>
                <option value="Toilet">Toilet / Saniter</option>
                <option value="Fasilitas Umum">Fasilitas Umum</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[#5C403C] text-xs font-bold">Pilih Fasilitas</label>
              <select
                value={fasilitas}
                onChange={(e) => setFasilitas(e.target.value)}
                className="w-full bg-[#FFF0EE] text-[#281715] text-sm py-2.5 px-3 rounded border border-solid border-[#E5BDB8] outline-none cursor-pointer focus:border-[#960006] font-medium"
              >
                <option value="" disabled>-- Pilih Fasilitas --</option>
                <option value="Air Conditioner (AC)">Air Conditioner (AC)</option>
                <option value="Proyektor / LCD">Proyektor / LCD</option>
                <option value="Kursi Kuliah">Kursi Kuliah</option>
                <option value="Meja Dosen">Meja Dosen</option>
                <option value="Lampu Ruangan">Lampu Ruangan</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Input Elemen: Isian Detail Lokasi */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[#5C403C] text-xs font-bold">Detail Lokasi</label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Gedung A, Ruang 302, Pojok Kanan"
              className="w-full bg-[#FFF0EE] text-gray-800 text-sm py-2.5 px-3 rounded border border-solid border-[#E5BDB8] outline-none focus:border-[#960006] font-medium placeholder-gray-400"
            />
          </div>

          {/* Input Elemen: Textarea Deskripsi Kerusakan */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[#5C403C] text-xs font-bold">Deskripsi Kerusakan</label>
            <textarea
              rows="4"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan detail kerusakan (misal: AC tidak dingin, hanya keluar angin)..."
              className="w-full bg-[#FFF0EE] text-gray-800 text-sm py-2.5 px-3 rounded border border-solid border-[#E5BDB8] outline-none focus:border-[#960006] resize-none font-medium placeholder-gray-400"
            />
          </div>

          {/* Input Elemen: Drag & Drop / Klik Area File Upload */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[#5C403C] text-xs font-bold">Unggah Foto Bukti</label>
            <label className="flex flex-col items-center justify-center w-full bg-[#FFF0EE] py-6 rounded-lg border-2 border-dashed border-[#E5BDB8] cursor-pointer hover:bg-[#FFFBBF]/20 transition-all">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/lpz0tycd_expires_30_days.png" 
                className="w-8 h-9 object-contain mb-1"
                alt="Upload File Icon"
              />
              <span className="text-[#5C403C] text-sm font-semibold text-center px-4">
                {foto ? `File Terpilih: ${foto.name}` : "Klik atau tarik foto ke sini"}
              </span>
              <span className="text-[#916F6A] text-xs font-bold mt-0.5">
                Format JPG, PNG (Maks. 5MB)
              </span>
            </label>
          </div>

          {/* Aksi Form: Tombol Kirim */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-[#960006] text-white py-3 px-6 rounded-xl font-bold shadow-md hover:bg-[#72140F] transition-all mt-2 text-sm ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Sedang Mengirim..." : "Kirim Laporan"}
          </button>
        </form>

        {/* ================= RIGHT SIDE PANEL (ALUR & PANDUAN) ================= */}
        <div className="flex flex-col shrink-0 w-full lg:w-80 gap-6">
          
          {/* Card Panel 1: Langkah-langkah Alur Pelaporan */}
          <div className="flex flex-col bg-[#C01212] p-5 gap-4 rounded-xl shadow-sm">
            <span className="text-[#FFD1CA] text-xl font-bold tracking-tight">Alur Pelaporan</span>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="bg-[#FFD1CA] text-[#960006] text-xs font-bold py-1 px-2.5 rounded-full shrink-0">1</div>
                <p className="text-[#FFD1CA] text-xs leading-relaxed font-semibold">Identifikasi kerusakan dan ambil foto yang jelas.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#FFD1CA] text-[#960006] text-xs font-bold py-1 px-2.5 rounded-full shrink-0">2</div>
                <p className="text-[#FFD1CA] text-xs leading-relaxed font-semibold">Pilih kategori dan fasilitas yang sesuai.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-[#FFD1CA] text-[#960006] text-xs font-bold py-1 px-2.5 rounded-full shrink-0">3</div>
                <p className="text-[#FFD1CA] text-xs leading-relaxed font-semibold">Kirim dan pantau status di riwayat.</p>
              </div>
            </div>
          </div>

          {/* Card Panel 2: Panduan Visual Ketentuan Foto Bukti */}
          <div className="flex flex-col bg-white rounded-xl border border-[#E5BDB8] overflow-hidden shadow-sm">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tsysz2q6QH/le14stgh_expires_30_days.png" 
              className="w-full h-44 object-cover"
              alt="Ilustrasi Panduan Foto"
            />
            <div className="p-4 flex flex-col gap-1">
              <span className="text-[#960006] text-lg font-bold">Panduan Foto</span>
              <p className="text-[#5C403C] text-xs leading-relaxed font-medium">
                Pastikan foto memperlihatkan kerusakan secara jelas agar teknisi kami dapat merespons dengan tepat.
              </p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}