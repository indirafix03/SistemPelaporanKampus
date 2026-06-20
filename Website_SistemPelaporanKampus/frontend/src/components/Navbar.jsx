import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import reportService from "../services/reportService";
import authService from "../services/authService";

export default function Navbar({ pageTitle, role }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State management
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Settings state (persisted in local storage)
  const [refreshRate, setRefreshRate] = useState(() => {
    return parseInt(localStorage.getItem("setting_refresh") || "15", 10);
  });

  // Change Password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Refs for closing dropdowns on outside click
  const notifRef = useRef(null);
  const settingsRef = useRef(null);
  const accountRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccount(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch reports to build notifications
  const fetchNotifications = async () => {
    try {
      const data = await reportService.getAllReports();
      const list = data?.daftar_laporan || [];

      let formattedNotifs = [];
      const seenIds = JSON.parse(localStorage.getItem(`seen_notifs_${user?.id || role}`) || "[]");

      if (role === "admin") {
        // Admin gets notified of new PENDING reports
        const pendingReports = list.filter((r) => r.status === "PENDING");
        formattedNotifs = pendingReports.map((r) => ({
          id: r.id,
          title: "Laporan Baru Masuk",
          message: `Laporan ${r.id} (${r.fasilitas}) telah diajukan di ${r.lokasi_spesifik}.`,
          time: new Date(r.created_at).toLocaleString("id-ID"),
          reportId: r.id,
          isRead: seenIds.includes(r.id),
        }));
      } else {
        // Mahasiswa gets notified if their report status is changed/updated (not PENDING)
        const updatedReports = list.filter((r) => r.status !== "PENDING");
        formattedNotifs = updatedReports.map((r) => {
          let statusText = "diperbarui";
          if (r.status === "DIPROSES") statusText = "mulai diproses";
          if (r.status === "SELESAI") statusText = "telah diselesaikan";
          if (r.status === "DIBATALKAN") statusText = "dibatalkan";

          return {
            id: `${r.id}_${r.status}`,
            title: `Laporan ${statusText.toUpperCase()}`,
            message: `Laporan Anda ${r.id} (${r.fasilitas}) statusnya kini: ${r.status}.`,
            time: new Date(r.updated_at).toLocaleString("id-ID"),
            reportId: r.id,
            isRead: seenIds.includes(`${r.id}_${r.status}`),
          };
        });
      }

      setNotifications(formattedNotifs);
      setUnreadCount(formattedNotifs.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Gagal mengambil data notifikasi:", error);
    }
  };

  // Setup periodic refresh
  useEffect(() => {
    fetchNotifications();

    if (refreshRate === 0) return;
    const interval = setInterval(fetchNotifications, refreshRate * 1000);
    return () => clearInterval(interval);
  }, [role, user, refreshRate]);

  // Ensure default light mode styles are active
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
  }, []);

  const markAllAsRead = () => {
    const seenIds = JSON.parse(localStorage.getItem(`seen_notifs_${user?.id || role}`) || "[]");
    notifications.forEach((n) => {
      if (!seenIds.includes(n.id)) {
        seenIds.push(n.id);
      }
    });
    localStorage.setItem(`seen_notifs_${user?.id || role}`, JSON.stringify(seenIds));
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (n) => {
    const seenIds = JSON.parse(localStorage.getItem(`seen_notifs_${user?.id || role}`) || "[]");
    if (!seenIds.includes(n.id)) {
      seenIds.push(n.id);
      localStorage.setItem(`seen_notifs_${user?.id || role}`, JSON.stringify(seenIds));
    }

    setShowNotifications(false);
    setNotifications(
      notifications.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (role === "admin") {
      navigate(`/admin/detail-laporan/${n.reportId}`);
    } else {
      navigate(`/mahasiswa/detail-laporan/${n.reportId}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError("Semua bidang harus diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      setPwError("Kata sandi baru minimal harus 6 karakter.");
      return;
    }

    setPwLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      setPwSuccess("Kata sandi berhasil diperbarui!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowChangePassword(false);
        setPwSuccess("");
      }, 1500);
    } catch (err) {
      setPwError(err.detail || "Gagal mengubah kata sandi.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <header className="bg-white h-16 border-b border-solid border-[#E5BDB8] px-6 flex justify-between items-center shadow-sm relative z-40 transition-colors duration-200">
      <h1 className="text-[#960006] text-xl font-bold tracking-tight">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        {/* Tombol Tentang Unhas */}
        <button
          onClick={() => setShowAbout(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#A53A2F] hover:bg-[#FE7C6C]/10 hover:text-[#960006] transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">Tentang Unhas</span>
        </button>

        {/* Notifikasi Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-[#A53A2F] hover:bg-[#FE7C6C]/10 hover:text-[#960006] transition-all relative cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#960006] text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-[#E5BDB8] shadow-xl overflow-hidden z-50">
              <div className="bg-gray-50 px-4 py-3 border-b border-[#E5BDB8] flex justify-between items-center">
                <span className="font-bold text-[#960006] text-sm">Notifikasi</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#A53A2F] hover:text-[#960006] font-semibold cursor-pointer"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    Tidak ada notifikasi terbaru
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`px-4 py-3 hover:bg-[#FE7C6C]/5 cursor-pointer transition-colors ${!n.isRead ? "bg-[#FE7C6C]/10 font-medium" : ""
                        }`}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <span className={`text-xs font-bold ${!n.isRead ? "text-[#960006]" : "text-gray-700"}`}>
                          {n.title}
                        </span>
                        <span className="text-[9px] text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pengaturan Dropdown */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg text-[#A53A2F] hover:bg-[#FE7C6C]/10 hover:text-[#960006] transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-[#E5BDB8] shadow-xl p-4 z-50">
              <h3 className="font-bold text-[#960006] text-sm mb-3 pb-1.5 border-b border-gray-100">Pengaturan Sistem</h3>

              {/* Refresh Rate Selector */}
              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-1.5">Interval Update Otomatis</span>
                <select
                  value={refreshRate}
                  onChange={(e) => {
                    const next = parseInt(e.target.value, 10);
                    setRefreshRate(next);
                    localStorage.setItem("setting_refresh", String(next));
                  }}
                  className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-700 focus:outline-none focus:border-[#960006] bg-gray-50"
                >
                  <option value={10}>Setiap 10 Detik</option>
                  <option value={15}>Setiap 15 Detik</option>
                  <option value={30}>Setiap 30 Detik</option>
                  <option value={60}>Setiap 1 Menit</option>
                  <option value={0}>Manual (Mati)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Akun Dropdown (Ikon + Teks) */}
        <div className="relative" ref={accountRef}>
          <button
            onClick={() => setShowAccount(!showAccount)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5BDB8] bg-white hover:bg-[#FE7C6C]/10 text-gray-700 transition-all cursor-pointer"
          >
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/vspi7pnr_expires_30_days.png"
              className="w-6 h-6 rounded-full border border-solid border-[#E5BDB8] object-cover"
              alt="Avatar"
            />
            <div className="hidden md:flex flex-col items-start leading-none text-left">
              <span className="text-xs font-bold text-[#960006]">
                {user?.nama_lengkap || "User Unhas"}
              </span>
              <span className="text-[10px] text-gray-500 capitalize font-medium mt-0.5">
                {role || "Mahasiswa"}
              </span>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAccount && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-[#E5BDB8] shadow-xl overflow-hidden z-50">
              <div className="px-4 py-4 border-b border-gray-100 flex flex-col items-center text-center">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/vspi7pnr_expires_30_days.png"
                  className="w-14 h-14 rounded-full border-2 border-solid border-[#E5BDB8] object-cover mb-2"
                  alt="Avatar Detail"
                />
                <h4 className="font-bold text-gray-800 text-sm leading-tight">{user?.nama_lengkap}</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{user?.email}</p>
                <span className="mt-2 px-2.5 py-0.5 bg-[#FE7C6C]/20 text-[#72140F] text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {role}
                </span>
              </div>
              <div className="px-4 py-3 bg-gray-50 flex flex-col gap-2.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Nama Lengkap:</span>
                  <span className="font-bold text-gray-800">{user?.nama_lengkap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Identitas / NIM:</span>
                  <span className="font-bold text-gray-800">{user?.nomor_identitas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Email Kampus:</span>
                  <span className="font-bold text-gray-800">{user?.email}</span>
                </div>
              </div>
              <div className="border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowAccount(false);
                    setShowChangePassword(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#A53A2F] hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Ganti Kata Sandi
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tentang Unhas */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200">
            {/* Tombol Close Silang di Kanan Atas */}
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Bagian Kiri: Gambar Rektorat */}
            <div className="relative w-full md:w-1/2 h-48 md:h-auto overflow-hidden flex items-stretch">
              <img
                src="/gedung_rektorat_UH.jpg"
                className="w-full h-full object-cover min-h-[250px] md:min-h-[450px]"
                alt="Gedung Rektorat Unhas"
              />
            </div>

            {/* Bagian Kanan: Konten Informasi */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mt-2">Universitas Hasanuddin</h2>
                <p className="text-[11px] text-gray-500 font-medium mb-3 mt-0.5">Makassar, Sulawesi Selatan</p>

                <p className="text-gray-600 text-[11px] leading-relaxed mb-4 text-justify">
                  Universitas Hasanuddin (Unhas), didirikan 1956 di Makassar, Sulawesi Selatan, merupakan institusi pendidikan tinggi terkemuka yang senantiasa berkomitmen untuk menghasilkan lulusan yang unggul, berintegritas, dan inovatif.
                </p>

                {/* Box Visi */}
                <div className="mb-4 p-3 bg-red-50/50 rounded-xl border border-red-100 relative pl-10">
                  <span className="absolute left-3.5 top-2.5 text-[#960006] text-2xl font-serif font-extrabold leading-none select-none">“</span>
                  <h3 className="font-bold text-gray-900 text-xs mb-0.5">Visi Universitas Hasanuddin</h3>
                  <p className="text-[10px] text-gray-600 leading-relaxed italic">
                    Visi Universitas Hasanuddin (Unhas) adalah menjadi pusat unggulan dalam pengembangan insani, ilmu pengetahuan, teknologi, seni, dan budaya yang berbasis Benua Maritim Indonesia
                  </p>
                </div>

                {/* Kontak */}
                <div>
                  <h3 className="font-bold text-gray-900 text-xs mb-2">Informasi Kontak</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full text-gray-500 shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="text-[10px] leading-snug">
                        <span className="block font-bold text-gray-700">Alamat</span>
                        <span className="text-gray-500">Jalan Perintis Kemerdekaan Km. 10, Tamalanrea, Makassar, Sulawesi Selatan</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full text-gray-500 shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div className="text-[10px] leading-snug">
                        <span className="block font-bold text-gray-700">Website</span>
                        <a href="https://unhas.ac.id" target="_blank" rel="noreferrer" className="text-red-600 font-semibold hover:underline inline-flex items-center gap-0.5">
                          unhas.ac.id
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol Tutup di Kanan Bawah */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowAbout(false)}
                  className="px-6 py-2 bg-[#960006] hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ganti Kata Sandi */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E5BDB8] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#960006] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">Ganti Kata Sandi</h3>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPwError("");
                  setPwSuccess("");
                }}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="p-6 space-y-4">
              {pwError && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-bold">
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-xs font-bold">
                  {pwSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Kata Sandi Lama</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#960006]"
                  placeholder="Masukkan kata sandi saat ini"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Kata Sandi Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#960006]"
                  placeholder="Masukkan kata sandi baru (min 6 karakter)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:border-[#960006]"
                  placeholder="Ulangi kata sandi baru"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPwError("");
                    setPwSuccess("");
                  }}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-4 py-2 bg-[#960006] hover:bg-[#A53A2F] disabled:bg-red-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {pwLoading ? "Memproses..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}