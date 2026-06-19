import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

export default function KirimLaporanAdmin() {
  const navigate = useNavigate();

  // State untuk form input
  const [kategori, setKategori] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [prioritas, setPrioritas] = useState("Medium");
  const [teknisi, setTeknisi] = useState("");
  const [foto, setFoto] = useState([]);

  // Handler pengiriman form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!kategori || !lokasi || !deskripsi) {
      alert("Mohon lengkapi detail kerusakan terlebih dahulu!");
      return;
    }
    alert(`Laporan Berhasil Dikirim!\nPrioritas: ${prioritas}\nTeknisi: ${teknisi || "Belum ditentukan"}`);
    navigate("/admin/dashboard");
  };

  return (
    <Layout role="admin" pageTitle="Buat Laporan Khusus">
      <form onSubmit={handleSubmit} className="flex flex-col w-full gap-8">
        
        {/* HEADER FORM */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full bg-[#FFF0EE] py-4 px-6 rounded-xl border border-[#E5BDB8] shadow-sm">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#281715] text-2xl font-bold">Buat Laporan Khusus Admin</h1>
            <p className="text-[#5C403C] text-sm">
              Input temuan kerusakan fasilitas secara mandiri untuk penugasan cepat teknisi lapangan.
            </p>
          </div>
          <div className="flex items-center bg-[#FFE2DE] py-2 px-4 gap-3 rounded-xl border border-[#E5BDB8] shrink-0">
            <span className="text-[#A53A2F] text-xs font-bold tracking-wider">INTERNAL STAFF</span>
            <div className="w-2 h-2 bg-[#A53A2F] rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* SECTION DETAIL & PARAMETER PENUGASAN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
          
          {/* SISI KIRI: DETAIL KERUSAKAN */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E5BDB8] shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/zql7p62i_expires_30_days.png"
                className="w-5 h-5"
                alt="icon-detail"
              />
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
                  <option value="Kelistrikan">Kelistrikan & Lampu</option>
                  <option value="Pendingin Ruangan">AC / Pendingin Ruangan</option>
                  <option value="Mebel">Kursi, Meja & Papan Tulis</option>
                  <option value="Sanitasi">Sanitasi & Toilet</option>
                  <option value="Fasilitas Umum">Gedung / Infrastruktur</option>
                </select>
              </div>

              {/* Lokasi Spesifik */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#5C403C] text-xs font-bold">Lokasi Spesifik</label>
                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Gedung, Lantai, No Ruang..."
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
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Low", style: "border-gray-300 text-gray-700 checked:bg-gray-100" },
                  { name: "Medium", style: "border-yellow-500 text-yellow-800 bg-yellow-50" },
                  { name: "High", style: "border-orange-500 text-orange-800" },
                  { name: "Critical", style: "border-red-600 text-red-800" }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setPrioritas(item.name)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center ${
                      prioritas === item.name
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
                  <option value="Budi">Budi (Teknisi AC)</option>
                  <option value="Agus">Agus (Teknisi Listrik)</option>
                  <option value="Siti">Siti (Biro Sarpras Gdg A)</option>
                </select>

                <div className="flex items-start bg-[#FFF8F7] p-3 gap-3 rounded border border-dashed border-[#E5BDB8]">
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/qq2bx2gx_expires_30_days.png"
                    className="w-4 h-5 mt-0.5 shrink-0"
                    alt="info"
                  />
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
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/99jtll3r_expires_30_days.png"
              className="w-5 h-4"
              alt="icon-upload"
            />
            <h2 className="text-[#281715] text-xl font-bold">Unggah Bukti Foto</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {/* Tombol Picu Upload */}
            <label className="flex flex-col items-center justify-center py-6 px-8 rounded-xl border-2 border-dashed border-[#E5BDB8] hover:bg-gray-50/50 cursor-pointer transition-colors">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/o59oibzl_expires_30_days.png"
                className="w-5 h-4 mb-2"
                alt="add-img"
              />
              <span className="text-[#5C403C] text-xs font-bold">Tambah Foto</span>
              <input type="file" multiple className="hidden" accept="image/*" />
            </label>

            {/* Thumbnail Pratinjau Foto Statis */}
            <div className="relative border border-gray-200 rounded-xl overflow-hidden p-1 bg-gray-50">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appsheet.com/v1/0HESghFleT/jszvp51t_expires_30_days.png"
                className="w-24 h-24 object-cover rounded-lg"
                alt="preview-1"
              />
            </div>
            <div className="relative border border-gray-200 rounded-xl overflow-hidden p-1 bg-gray-50">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/tr5ya7e0_expires_30_days.png"
                className="w-24 h-24 object-cover rounded-lg"
                alt="preview-2"
              />
            </div>
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
            className="bg-[#960006] text-white py-2.5 px-8 rounded-xl text-sm font-bold shadow-md hover:bg-[#7a0005] transition-colors"
          >
            Submit & Tugaskan
          </button>
        </div>

      </form>
    </Layout>
  );
}