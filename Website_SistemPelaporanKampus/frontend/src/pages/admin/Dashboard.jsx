import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [stats, setStats] = useState({
    laporan_pending: 0,
    laporan_diproses: 0,
    total_laporan: 0,
    persentase_peningkatan_dari_rata_rata: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReportsData, setTotalReportsData] = useState(0);
  const limit = 3; // Limit for the main reports table

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      // Fetch Stats
      const statsRes = await fetch("http://127.0.0.1:8000/api/admin/dashboard/stats", { headers });
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData);
      else throw new Error(statsData.detail || "Gagal mengambil statistik admin.");

      // Fetch Recent Activities
      const activitiesRes = await fetch("http://127.0.0.1:8000/api/admin/technicians/activities", { headers });
      const activitiesData = await activitiesRes.json();
      if (activitiesRes.ok) setRecentActivities(activitiesData);
      else throw new Error(activitiesData.detail || "Gagal mengambil aktivitas teknisi.");

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setTableLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q_search", searchQuery);
      if (statusFilter) params.append("status_filter", statusFilter);
      params.append("skip", (currentPage - 1) * limit);
      params.append("limit", limit);

      const reportsRes = await fetch(`http://127.0.0.1:8000/api/reports?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const reportsData = await reportsRes.json();
      if (reportsRes.ok) {
        setAllReports(reportsData.daftar_laporan);
        setTotalReportsData(reportsData.total_data);
      } else {
        throw new Error(reportsData.detail || "Gagal mengambil daftar laporan.");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token, currentPage, statusFilter, searchQuery]); // Re-fetch reports when page, filter, or search changes

  const handleFilterAndSearch = () => {
    setCurrentPage(1); // Reset to first page on new search/filter
    fetchReports();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getInitial = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

  const getStatusStyles = (status) => {
    switch (status) {
      case "PENDING":
        return { 
          bgStatus: "bg-[#FFDAD6] text-[#93000A]", 
          aksiText: "Verifikasi", 
          bgAksi: "bg-[#960006] text-white hover:bg-[#7a0005]" 
        };
      case "DIPROSES":
        return { 
          bgStatus: "bg-[#D7E2FF] text-[#004491]", 
          aksiText: "Update", 
          bgAksi: "bg-[#FFE2DE] text-[#5C403C] border border-[#E5BDB8] hover:bg-[#ffd1ca]" 
        };
      case "SELESAI":
        return { bgStatus: "bg-emerald-100 text-emerald-800", aksiText: "Detail", bgAksi: "bg-gray-100 text-gray-700 hover:bg-gray-200" };
      default:
        return { bgStatus: "bg-gray-100 text-gray-800", aksiText: "Detail", bgAksi: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <Layout role="admin" pageTitle="Dashboard Admin">
      <div className="flex flex-col w-full gap-8">
        
        {/* HEADER DASHBOARD */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full bg-[#FFF0EE] py-4 px-6 rounded-xl border border-[#E5BDB8] shadow-sm">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#960006] text-2xl font-bold">Dashboard Utama Admin</h1>
            <p className="text-[#5C403C] text-sm">Selamat datang kembali! Kelola dan verifikasi laporan fasilitas kampus di sini.</p>
          </div>
          
          {/* SEARCH BAR */}
          <div className="flex items-center bg-[#FFE2DE] py-2 px-4 gap-2 rounded-xl border border-solid border-[#E5BDB8] w-full sm:w-72">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/rc4td0mw_expires_30_days.png"
              className="w-[18px] h-[18px]"
              alt="Search"
            />
            <input 
              type="text" 
              placeholder="Cari laporan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full outline-none text-gray-700 placeholder-gray-500 font-medium"
            />
          </div>
        </div>

        {/* STATS CARDS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Card 1 */}
          <div className="flex flex-col bg-white p-5 gap-3 rounded-xl border border-solid border-[#E5BDB8] shadow-sm">
            <div>
              <span className="text-[#5C403C] text-xs font-bold block mb-1">Total Laporan</span>
              <span className="text-[#960006] text-[32px] font-bold leading-none">{loading ? "..." : stats.total_laporan}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/mr1gbtqk_expires_30_days.png" className="w-[11px] h-[7px]" alt="Up" />
              <span className="text-emerald-600 text-xs font-bold">+12% bln ini</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col bg-white p-5 gap-3 rounded-xl border border-solid border-[#E5BDB8] shadow-sm">
            <div>
              <span className="text-[#5C403C] text-xs font-bold block mb-1">Laporan Pending</span>
              <span className="text-[#BA1A1A] text-[32px] font-bold leading-none">{loading ? "..." : stats.laporan_pending}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-[#BA1A1A] rounded-full animate-pulse"></span>
              <span className="text-[#BA1A1A] text-xs font-bold">Butuh Verifikasi</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col bg-white p-5 gap-3 rounded-xl border border-solid border-[#E5BDB8] shadow-sm">
            <div>
              <span className="text-[#5C403C] text-xs font-bold block mb-1">Sedang Diproses</span>
              <span className="text-[#A53A2F] text-[32px] font-bold leading-none">{loading ? "..." : stats.laporan_diproses}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-[#A53A2F] rounded-full"></span>
              <span className="text-[#A53A2F] text-xs font-bold">Update berkala</span>
            </div>
          </div>
        </div>

        {/* CONTAINER DATA TABEL UTAMA */}
        <div className="bg-white rounded-xl border border-solid border-[#E5BDB8] shadow-sm overflow-hidden w-full">
          {/* Top Kontrol Tabel */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-6 gap-4 border-b border-gray-100">
            <span className="text-[#281715] text-xl font-bold">Daftar Laporan Fasilitas</span>
            <div className="flex items-center gap-3 w-full sm:w-auto"> 
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FFE9E6] text-[#281715] text-xs py-2 px-4 rounded border border-[#E5BDB8] outline-none cursor-pointer font-medium">
                <option value="">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="DIPROSES">Diproses</option>
                <option value="SELESAI">Selesai</option>
              </select>
              <button onClick={handleFilterAndSearch}
                className="flex items-center bg-[#FFE2DE] py-2 px-4 gap-2 rounded border border-[#E5BDB8] text-[#281715] text-xs font-bold hover:bg-[#ffd1ca] transition-colors"
              >
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/6o8wdp1f_expires_30_days.png" className="w-3.5 h-2.5" alt="icon" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Render Tabel Responsif */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF0EE] border-b border-[#E5BDB8]">
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">ID LAPORAN</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">MAHASISWA / PELAPOR</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">FASILITAS / LOKASI</th>
                  <th className="py-4 px-6 text-[#5C403C] text-xs font-bold tracking-wider">STATUS</th>
                  <th className="py-4 px-6 text-center text-[#5C403C] text-xs font-bold tracking-wider">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-[#281715]">
                {tableLoading ? (
                  <tr><td colSpan="5" className="py-10 text-center italic font-medium">Memuat laporan...</td></tr>
                ) : allReports.length === 0 ? (
                  <tr><td colSpan="5" className="py-10 text-center italic font-medium">Tidak ada laporan ditemukan.</td></tr>
                ) : (
                  allReports.map((report) => {
                    const styles = getStatusStyles(report.status);
                    return (
                      <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* ID Laporan */}
                        <td className="py-4 px-6">
                          <span className="font-bold text-[#960006] block">{report.id}</span>
                          <span className="text-[#916F6A] text-[11px] block mt-0.5">{formatDate(report.created_at)}</span>
                        </td>
                        
                        {/* Pelapor */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FBDBD8] text-[#960006] flex items-center justify-center font-bold text-xs shrink-0">
                              {getInitial(report.pelapor?.nama_lengkap)}
                            </div>
                            <span className="font-medium">{report.pelapor?.nama_lengkap || "Anonim"}</span>
                          </div>
                        </td>

                        {/* Fasilitas & Lokasi */}
                        <td className="py-4 px-6">
                          <span className="font-medium block">{report.fasilitas}</span>
                          <span className="text-[#916F6A] text-xs block mt-0.5">{report.lokasi_spesifik}</span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span className={`inline-block py-1 px-3 rounded-xl text-[11px] font-bold ${styles.bgStatus}`}>
                            {report.status}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={() => navigate(`/admin/detail-laporan/${report.id}`)}
                            className={`py-1.5 px-4 rounded text-xs font-bold transition-all ${styles.bgAksi}`}
                          >
                            {styles.aksiText}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION BAWAH */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-[#FFF0EE] py-4 px-6 gap-4 border-t border-[#E5BDB8]">
            <span className="text-[#5C403C] text-xs font-medium">
              Menampilkan {allReports.length > 0 ? (currentPage - 1) * limit + 1 : 0}-
              {Math.min(currentPage * limit, totalReportsData)} dari {totalReportsData} laporan
            </span>
            <div className="flex items-center gap-1">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/h1uwo2s5_expires_30_days.png" 
                className={`w-[23px] h-7 cursor-pointer ${currentPage === 1 ? "opacity-30 cursor-not-allowed" : ""}`} alt="Prev"
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} />
              {[...Array(Math.ceil(totalReportsData / limit))].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)}
                  className={`py-1 px-3 rounded font-bold text-xs ${currentPage === i + 1 ? "bg-[#960006] text-white" : "text-[#281715] hover:bg-white/50 transition-colors"}`}>
                  {i + 1}
                </button>
              ))}
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/ugwzdc0q_expires_30_days.png" 
                className={`w-[23px] h-7 cursor-pointer ${currentPage >= Math.ceil(totalReportsData / limit) ? "opacity-30 cursor-not-allowed" : ""}`} alt="Next"
                onClick={() => currentPage < Math.ceil(totalReportsData / limit) && setCurrentPage(currentPage + 1)} />
            </div>
          </div>
        </div>

        {/* INFO EXTRA & TIMELINE TEKNISI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Card SOP Panduan */}
          <div className="lg:col-span-2 flex justify-between items-center bg-gradient-to-r from-[#960006] to-[#ba1a1a] p-6 rounded-xl shadow-md text-white">
            <div className="flex flex-col gap-2 max-w-[70%]">
              <h3 className="text-white text-xl font-bold">Panduan Verifikasi</h3>
              <p className="text-red-100 text-sm leading-relaxed">
                Pastikan setiap laporan memiliki bukti foto yang valid sebelum diproses oleh teknisi lapangan.
              </p>
              <button 
                onClick={() => alert("Membuka SOP...")}
                className="bg-white text-[#960006] font-bold text-xs py-2 px-5 rounded mt-2 self-start hover:bg-red-50 transition-colors"
              >
                Lihat SOP
              </button>
            </div>
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/parjdafk_expires_30_days.png"
              className="w-20 h-[72px] object-contain shrink-0 opacity-90"
              alt="SOP Illustration"
            />
          </div>

          {/* Aktivitas Terbaru */}
          <div className="bg-[#FFE2DE] p-5 rounded-xl border border-solid border-[#E5BDB8] flex flex-col gap-4">
            <h3 className="text-[#281715] text-lg font-bold">Aktivitas Terbaru Teknisi</h3>
            {loading ? (
              <div className="text-center italic text-sm text-[#5C403C]">Memuat aktivitas...</div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center italic text-sm text-[#5C403C]">Tidak ada aktivitas teknisi terbaru.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="bg-emerald-500 w-1 h-10 rounded-xl shrink-0"></div> {/* Color can be dynamic based on status */}
                    <div>
                      <span className="text-[#281715] text-sm font-bold block">Laporan {activity.id_laporan}</span>
                      <span className="text-[#5C403C] text-xs block">Oleh Teknisi {activity.teknisi_nama} - {formatDate(activity.waktu_update)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}