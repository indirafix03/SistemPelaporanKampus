import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Button from "../../components/Button"; 
import { useAuth } from "../../context/AuthContext";

export default function MahasiswaDashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // State untuk menyimpan data API
  const [stats, setStats] = useState({
    total_laporan_bulan_ini: 0,
    status_counts: { PENDING: 0, DIPROSES: 0, SELESAI: 0, DIBATALKAN: 0 },
    persentase_selesai_bulan_ini: 0
  });
  const [recentReport, setRecentReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        // Fetch Statistik
        const statsRes = await fetch("http://127.0.0.1:8000/api/mahasiswa/dashboard/stats", { headers });
        const statsData = await statsRes.json();

        // Fetch Laporan Terbaru (ambil 1 saja untuk preview utama)
        const reportsRes = await fetch("http://127.0.0.1:8000/api/mahasiswa/dashboard/recent-reports?limit=1", { headers });
        const reportsData = await reportsRes.json();

        if (statsRes.ok) setStats(statsData);
        if (reportsRes.ok && reportsData.length > 0) setRecentReport(reportsData[0]);

      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Helper untuk memformat tanggal
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Nama depan untuk greeting
  const firstName = user?.name?.split(" ")[0] || "Mahasiswa";

  return (
    <Layout role="mahasiswa" pageTitle="Beranda">
      
      {/* BANNER SELAMAT DATANG */}
      <section className="bg-gradient-to-r from-[#C01212] to-[#960006] p-6 rounded-xl shadow-md text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#FFD1CA] text-2xl sm:text-3xl font-bold tracking-tight">Halo, {firstName}!</h2>
          <p className="text-[#FFD1CA]/90 text-sm max-w-[500px] leading-relaxed">
            Bantu kami menjaga kenyamanan kampus. Laporkan kerusakan fasilitas yang Anda temukan dengan cepat dan mudah.
          </p>
        </div>
        
        {/* Menggunakan Button.jsx milikmu jika mendukung onClick & children */}
        <Button 
          onClick={() => navigate("/mahasiswa/kirim-laporan")}
          className="bg-white hover:bg-[#FFF0EE] text-[#C01212] flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-base transition-colors shadow-sm self-start sm:self-center shrink-0 border-none"
        >
          <img 
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/4syf7s0k_expires_30_days.png" 
            className="w-5 h-5 object-contain" 
            alt="Icon Plus" 
          />
          <span>Buat Laporan Baru</span>
        </Button>
      </section>

      {/* GRID LAYOUT: KIRI (Statistik & Laporan) | KANAN (Hotline) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* KOLOM KIRI (Lebar 2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* STATISTIK LAPORAN SAYA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Menunggu */}
            <div className="bg-white p-5 rounded-xl border border-solid border-[#E5BDB8] shadow-sm flex flex-col gap-2">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/ccx14h2j_expires_30_days.png" className="w-8 h-8 object-contain" alt="Clock" />
              <div>
                <div className="text-[#960006] text-2xl font-bold">{stats.status_counts.PENDING.toString().padStart(2, '0')}</div>
                <div className="text-[#A53A2F] text-xs font-bold">Menunggu</div>
              </div>
            </div>

            {/* Diproses */}
            <div className="bg-white p-5 rounded-xl border border-solid border-[#E5BDB8] shadow-sm flex flex-col gap-2">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/94u8b941_expires_30_days.png" className="w-8 h-8 object-contain" alt="Process" />
              <div>
                <div className="text-[#960006] text-2xl font-bold">{stats.status_counts.DIPROSES.toString().padStart(2, '0')}</div>
                <div className="text-[#A53A2F] text-xs font-bold">Diproses</div>
              </div>
            </div>

            {/* Selesai */}
            <div className="bg-white p-5 rounded-xl border border-solid border-[#E5BDB8] shadow-sm flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/hhfhqbx2_expires_30_days.png" className="w-8 h-8 object-contain" alt="Done" />
                <div>
                  <div className="text-[#960006] text-2xl font-bold">{stats.status_counts.SELESAI.toString().padStart(2, '0')}</div>
                  <div className="text-[#A53A2F] text-xs font-bold">Selesai (Bulan ini)</div>
                </div>
              </div>
              <div className="bg-[#FFF0EE] text-[#960006] w-14 h-14 rounded-full border-2 border-solid border-[#E5BDB8] flex items-center justify-center font-bold text-sm">
                {Math.round(stats.persentase_selesai_bulan_ini)}%
              </div>
            </div>
          </div>

          {/* PREVIEW LAPORAN SAYA TERBARU */}
          <div className="bg-white rounded-xl border border-solid border-[#E5BDB8] shadow-sm overflow-hidden">
            <div className="bg-[#FFF0EE] p-4 border-b border-solid border-[#E5BDB8]">
              <h3 className="text-[#960006] text-lg font-bold">Laporan Terbaru Saya</h3>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              {recentReport ? (() => {
                const fotoUrls = recentReport.foto_url ? recentReport.foto_url.split(",") : [];
                const firstFoto = fotoUrls.length > 0 ? fotoUrls[0] : "";
                const imageUrl = firstFoto
                  ? (firstFoto.startsWith("http") ? firstFoto : `http://127.0.0.1:8000${firstFoto.startsWith("/") ? "" : "/"}${firstFoto}`)
                  : "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/ax6ohu4z_expires_30_days.png";
                return (
                  <>
                    <div className="w-full h-48 md:h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={imageUrl}
                        className="w-full h-full object-cover"
                        alt="Foto Kerusakan"
                        onError={(e) => {
                          e.target.src = "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/ax6ohu4z_expires_30_days.png";
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-[#281715] text-base font-bold">{recentReport.fasilitas}</h4>
                          <p className="text-[#5C403C] text-sm mt-1 line-clamp-2">
                            ID Laporan: {recentReport.id_laporan}
                          </p>
                        </div>
                        <span className="bg-[#FFDAD6] text-[#93000A] text-[11px] font-bold py-1 px-3 rounded-full shrink-0 uppercase">
                          {recentReport.status}
                        </span>
                      </div>
                      <div className="text-[#916F6A] text-xs font-medium mt-1">
                        Dilaporkan pada {formatDate(recentReport.created_at)}
                      </div>
                    </div>
                  </>
                );
              })() : (
                <div className="py-10 text-center text-[#5C403C] font-medium italic">
                  {loading ? "Memuat data..." : "Belum ada laporan yang dikirim."}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* KOLOM KANAN (Lebar 1/3) */}
        <div className="w-full">
          <div className="bg-[#004694] p-6 flex flex-col gap-4 rounded-xl shadow-md text-white">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-bold tracking-tight">Perlu Bantuan Darurat?</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Hubungi hotline fasilitas kampus untuk kejadian mendesak seperti kebocoran gas atau korsleting listrik.
              </p>
            </div>
            
            <div className="flex items-center bg-white/10 px-4 py-3 rounded-lg border border-solid border-white/20">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/ml1s4dnp_expires_30_days.png"
                className="w-5 h-5 mr-3 object-contain invert"
                alt="Phone Icon"
              />
              <span className="text-white font-bold text-base tracking-wide">(021) 555-0123</span>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}