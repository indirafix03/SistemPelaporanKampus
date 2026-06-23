import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

export default function KirimLaporanAdmin() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // State untuk form input
  const [kategori, setKategori] = useState("");
  const [fasilitas, setFasilitas] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [prioritas, setPrioritas] = useState("SEDANG");
  const [teknisi, setTeknisi] = useState("");
  const [fotos, setFotos] = useState([]);
  
  // State UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const techniciansList = [
    { nama: "Budi Santoso", bidang: "AC & Pendingin" },
    { nama: "Agus Mulyono", bidang: "Kelistrikan" },
    { nama: "Heri Jatmiko", bidang: "Mebel & Perabot" },
    { nama: "Rian Setiawan", bidang: "Sanitasi & Toilet" },
    { nama: "Fajar Pratama", bidang: "IT & Elektronik" }
  ];

  // Handler file change
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFotos((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  // Handler pengiriman form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!kategori || !fasilitas || !lokasi || !deskripsi) {
      setError("Mohon lengkapi seluruh detail kerusakan terlebih dahulu!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("kategori", kategori.toUpperCase());
      formData.append("fasilitas", fasilitas);
      formData.append("lokasi_spesifik", lokasi);
      formData.append("deskripsi", deskripsi);
      formData.append("prioritas", prioritas);
      if (teknisi) {
        formData.append("teknisi_nama", teknisi);
      }
      if (fotos && fotos.length > 0) {
        fotos.forEach((f) => {
          formData.append("files", f);
        });
      }

      const response = await fetch("http://127.0.0.1:8000/api/admin/reports/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Gagal mengirim laporan internal.");
      }

      alert(`Laporan Staf Berhasil Dibuat!\nID Laporan: ${data.id}`);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat menyambung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="admin" pageTitle="Buat Laporan Khusus">
      <form onSubmit={handleSubmit} className="flex flex-col w-full gap-8">
        
        {/* HEADER FORM */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full bg-[#FFF0EE] py-4 px-6 rounded-xl border border-[#E5BDB8] shadow-sm">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#960006] text-2xl font-bold">Buat Laporan Khusus Admin</h1>
            <p className="text-[#5C403C] text-sm">
              Input temuan kerusakan fasilitas secara mandiri untuk penugasan cepat teknisi lapangan.
            </p>
          </div>
          <div className="flex items-center bg-[#FFE2DE] py-2 px-4 gap-3 rounded-xl border border-[#E5BDB8] shrink-0">
            <span className="text-[#A53A2F] text-xs font-bold tracking-wider">INTERNAL STAFF</span>
            <div className="w-2 h-2 bg-[#A53A2F] rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* FEEDBACK ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* SECTION DETAIL & PARAMETER PENUGASAN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
          
          {/* SISI KIRI: DETAIL KERUSAKAN */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E5BDB8] shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <svg className="w-5 h-5 text-[#281715]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-[#281715] text-xl font-bold">Detail Kerusakan</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kategori Fasilitas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5C403C] text-xs font-bold">Kategori Fasilitas</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="bg-[#FFF8F7] text-[#281715] text-sm p-3 rounded border border-[#E5BDB8] outline-none cursor-pointer focus:border-[#960006]"
                >
                  <option value="">Pilih Kategori...</option>
                  <option value="Fasilitas Kelas">Fasilitas Kelas</option>
                  <option value="Laboratorium">Laboratorium</option>
                  <option value="Toilet">Toilet / Saniter</option>
                  <option value="Fasilitas Umum">Fasilitas Umum</option>
                </select>
              </div>

              {/* Nama Item / Fasilitas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5C403C] text-xs font-bold">Nama Fasilitas / Kerusakan</label>
                <input
                  type="text"
                  value={fasilitas}
                  onChange={(e) => setFasilitas(e.target.value)}
                  placeholder="Contoh: AC Bocor, Proyektor Buram"
                  className="bg-[#FFF8F7] text-[#281715] text-sm p-3 rounded border border-[#E5BDB8] outline-none focus:border-[#960006]"
                />
              </div>

              {/* Lokasi Spesifik */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[#5C403C] text-xs font-bold">Lokasi Spesifik</label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Contoh: Gedung Perkulihan A, Lantai 2, Ruang 203"
                  className="bg-[#FFF8F7] text-[#281715] text-sm p-3 rounded border border-[#E5BDB8] outline-none focus:border-[#960006]"
                />
              </div>
            </div>

            {/* Deskripsi Kerusakan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#5C403C] text-xs font-bold">Deskripsi Kerusakan</label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={4}
                placeholder="Masukkan detail kerusakan secara mendalam untuk membantu penanganan awal oleh tim teknisi..."
                className="bg-[#FFF8F7] text-[#281715] text-sm p-3 rounded border border-[#E5BDB8] outline-none focus:border-[#960006] resize-none w-full leading-relaxed"
              />
            </div>
          </div>

          {/* SISI KANAN: PARAMETER (PRIORITAS & TEKNISI) */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* Box Skala Prioritas */}
            <div className="bg-[#FFF0EE] p-5 rounded-xl border border-[#E5BDB8] shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#960006] rounded"></div>
                <span className="text-[#960006] text-xs font-bold tracking-wider">SKALA PRIORITAS</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: "RENDAH", name: "Rendah (Low)" },
                  { value: "SEDANG", name: "Sedang (Medium)" },
                  { value: "TINGGI", name: "Tinggi (High)" }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => setPrioritas(item.value)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center ${
                      prioritas === item.value
                        ? "bg-[#960006] text-white border-[#960006] shadow-sm"
                        : "bg-white border-gray-200 text-[#281715] hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Box Penugasan Teknisi */}
            <div className="bg-white p-5 rounded-xl border border-[#E5BDB8] shadow-sm flex flex-col gap-4">
              <span className="text-[#5C403C] text-xs font-bold tracking-wider">PENUGASAN TEKNISI</span>
              
              <div className="flex flex-col gap-3">
                <select
                  value={teknisi}
                  onChange={(e) => setTeknisi(e.target.value)}
                  className="bg-[#FFF8F7] text-[#281715] text-sm p-3 rounded border border-[#E5BDB8] outline-none cursor-pointer focus:border-[#960006] w-full"
                >
                  <option value="">Pilih Teknisi Terdekat...</option>
                  {techniciansList.map((t) => (
                    <option key={t.nama} value={t.nama}>
                      {t.nama} ({t.bidang})
                    </option>
                  ))}
                </select>

                <div className="flex items-start bg-[#FFF8F7] p-3 gap-3 rounded border border-dashed border-[#E5BDB8]">
                  <svg className="w-4 h-5 mt-0.5 shrink-0 text-[#5C403C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[#5C403C] text-[11px] font-medium leading-relaxed">
                    Penugasan kerja akan dikirim secara instan ke sistem internal teknisi setelah form disubmit.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION UNGHAH FOTO */}
        <div className="bg-white p-6 rounded-xl border border-[#E5BDB8] shadow-sm flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <svg className="w-5 h-5 text-[#281715]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-[#281715] text-xl font-bold">Unggah Bukti Foto</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {/* Tombol Picu Upload */}
            <label className="flex flex-col items-center justify-center py-6 px-8 rounded-xl border-2 border-dashed border-[#E5BDB8] hover:bg-gray-50/50 cursor-pointer transition-colors">
              <svg className="w-6 h-6 mb-2 text-[#5C403C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[#5C403C] text-xs font-bold">
                {fotos.length > 0 ? "Tambah Foto" : "Tambah Foto"}
              </span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                multiple
                onChange={handleFileChange}
              />
            </label>

            {/* Thumbnail Pratinjau Foto */}
            {fotos.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {fotos.map((f, index) => (
                  <div key={index} className="relative border border-gray-200 rounded-xl overflow-hidden p-1 bg-gray-50 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 relative">
                      <img
                        src={URL.createObjectURL(f)}
                        className="w-full h-full object-cover rounded-lg"
                        alt={`preview ${index}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFotos(fotos.filter((_, idx) => idx !== index));
                        }}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shadow-md"
                      >
                        &times;
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate max-w-[90px] mt-1">{f.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AREA TOMBOL AKSI FORM */}
        <div className="flex justify-end items-center pt-4 gap-4 w-full">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="py-2.5 px-6 rounded-xl border border-[#916F6A] text-[#5C403C] text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#960006] text-white py-2.5 px-8 rounded-xl text-sm font-bold shadow-md hover:bg-[#7a0005] disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Menyimpan Laporan..." : "Submit & Tugaskan"}
          </button>
        </div>

      </form>
    </Layout>
  );
}