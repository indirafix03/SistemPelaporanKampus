import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nomor_identitas: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Konfirmasi kata sandi tidak cocok!");
    }

    setLoading(true);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nama_lengkap: formData.nama_lengkap,
          nomor_identitas: formData.nomor_identitas,
          role: "mahasiswa", // Menjamin role terkirim sebagai mahasiswa
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // FastAPI 422 error detail biasanya berupa list of objects
        let errorMessage = "Gagal melakukan registrasi";
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => `${err.loc[1]}: ${err.msg}`).join(", ");
        } else {
          errorMessage = data.detail || errorMessage;
        }
        throw new Error(errorMessage);
      }

      alert(`Registrasi Berhasil sebagai ${data.role}! Silakan masuk.`);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white min-h-screen font-sans antialiased">
      
      {/* AREA UTAMA */}
      <main className="flex-1 flex items-center justify-center w-full max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between w-full gap-10">

          {/* SISI KIRI: BANNER INFORMASI (Tetap dipertahankan agar konsisten dengan Login) */}
          <div className="flex-1 w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h1 className="text-[#960006] text-3xl md:text-[36px] font-bold tracking-tight leading-tight">
                Sistem Pelaporan Fasilitas Kampus
              </h1>
              <p className="text-[#5C403C] text-sm md:text-base leading-relaxed max-w-[506px]">
                Menjaga kenyamanan belajar dengan layanan pelaporan kerusakan dan pemeliharaan infrastruktur kampus yang cepat dan transparan.
              </p>
            </div>
            
            {/* Box Gambar */}
            <div className="w-full bg-[#FFF0EE] p-0.5 rounded-lg border border-solid border-[#E5BDB8] shadow-sm overflow-hidden">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/2h75xi3o_expires_30_days.png"
                className="w-full h-auto max-h-[380px] rounded-md object-cover"
                alt="Banner Kampus"
              />
            </div>
            
            {/* Badge Terintegrasi */}
            <div className="flex flex-col bg-[#FFFFFFE3] p-4 gap-1.5 rounded-lg border border-solid border-[#E5BDB8] max-w-[360px] shadow-sm">
              <div className="flex items-center gap-2">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/96lc2ge5_expires_30_days.png"
                  className="w-5 h-5 object-contain"
                  alt="Icon Terintegrasi"
                />
                <span className="text-[#960006] text-xs font-bold tracking-wider">
                  TERINTEGRASI
                </span>
              </div>
              <p className="text-[#281715] text-xs leading-relaxed">
                Seluruh laporan diproses secara otomatis dan diteruskan ke bagian sarana prasarana terkait.
              </p>
            </div>
          </div>

          {/* SISI KANAN: FORM BOX REGISTRASI */}
          <div className="w-full lg:w-[460px] bg-white p-8 rounded-xl border border-solid border-[#E5BDB8] shadow-sm flex flex-col">
            
            <div className="flex flex-col gap-1 mb-6 text-left">
              <h2 className="text-[#960006] text-2xl font-bold tracking-tight">
                Daftar Akun Baru
              </h2>
              <p className="text-[#5C403C] text-xs md:text-sm">
                Lengkapi data di bawah ini untuk membuat akun mahasiswa.
              </p>
            </div>

            {/* Form Input Fields */}
            <form onSubmit={handleRegister} className="flex flex-col gap-4 mb-6 text-left">
              
              {/* Alert Pesan Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-xs font-medium">
                  {error}
                </div>
              )}
              
              {/* Input Nama Lengkap */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[#5C403C] text-xs font-bold">Nama Lengkap</label>
                <div className="flex items-center bg-[#FFF8F7] px-3 py-2.5 gap-3 rounded border border-solid border-[#E5BDB8] w-full focus-within:border-[#960006] transition-all">
                  <input 
                    type="text" 
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap Anda" 
                    className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400" 
                    required
                  />
                </div>
              </div>

              {/* Input NIM */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[#5C403C] text-xs font-bold">NIM / Nomor Identitas</label>
                <div className="flex items-center bg-[#FFF8F7] px-3 py-2.5 gap-3 rounded border border-solid border-[#E5BDB8] w-full focus-within:border-[#960006] transition-all">
                  <input 
                    type="text" 
                    name="nomor_identitas"
                    value={formData.nomor_identitas}
                    onChange={handleChange}
                    placeholder="Contoh: H071231XXX" 
                    className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400" 
                    required
                  />
                </div>
              </div>

              {/* Input Email */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[#5C403C] text-xs font-bold">Email Kampus</label>
                <div className="flex items-center bg-[#FFF8F7] px-3 py-2.5 gap-3 rounded border border-solid border-[#E5BDB8] w-full focus-within:border-[#960006] transition-all">
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/o8nazz4l_expires_30_days.png" className="w-5 h-5 object-contain opacity-80" alt="Mail" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@student.unhas.ac.id" 
                    className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400" 
                    required
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[#5C403C] text-xs font-bold">Buat Kata Sandi</label>
                <div className="flex items-center bg-[#FFF8F7] px-3 py-2.5 rounded border border-solid border-[#E5BDB8] w-full focus-within:border-[#960006] transition-all">
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/n5hwcfn7_expires_30_days.png" className="w-4 h-5 mr-1 object-contain opacity-80" alt="Lock" />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter" 
                    className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400" 
                    required
                  />
                </div>
              </div>

              {/* Input Konfirmasi Password */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[#5C403C] text-xs font-bold">Konfirmasi Kata Sandi</label>
                <div className="flex items-center bg-[#FFF8F7] px-3 py-2.5 rounded border border-solid border-[#E5BDB8] w-full focus-within:border-[#960006] transition-all">
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/n5hwcfn7_expires_30_days.png" className="w-4 h-5 mr-1 object-contain opacity-80" alt="Lock" />
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi kata sandi Anda" 
                    className="bg-transparent text-sm text-gray-800 outline-none w-full placeholder-gray-400" 
                    required
                  />
                </div>
              </div>

              {/* Syarat & Ketentuan Checkbox */}
              <div className="flex items-start my-2 text-left">
                <input type="checkbox" id="terms" className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#960006] accent-[#960006] cursor-pointer" required />
                <label htmlFor="terms" className="ml-2 text-[#5C403C] text-xs leading-normal cursor-pointer select-none">
                  Saya menyetujui <span className="text-[#960006] font-bold hover:underline">Syarat & Ketentuan</span> serta <span className="text-[#960006] font-bold hover:underline">Kebijakan Privasi</span> yang berlaku.
                </label>
              </div>

              {/* Button Daftar */}
              <button 
                type="submit"
                disabled={loading} 
                className={`w-full bg-[#960006] hover:bg-[#800005] text-white text-center py-2.5 rounded font-bold text-sm transition-colors shadow-md ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </form>

            {/* Link Kembali Ke Login */}
            <div className="mt-6 text-center w-full">
            <span className="text-[#5C403C] text-xs font-medium">
                Sudah memiliki akun?{" "}
                <Link to="/login" className="text-[#960006] font-bold cursor-pointer hover:underline transition-colors">
                Masuk di sini
                </Link>
            </span>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white p-6 border-t border-solid border-gray-100">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <span className="text-[#916F6A] text-xs font-bold">
            © 2026 Sistem Pelaporan Fasilitas Kampus. Hak Cipta Dilindungi.
          </span>
          <div className="flex flex-wrap justify-center gap-6 text-[#5C403C] font-bold text-xs">
            <span className="cursor-pointer hover:text-[#960006] hover:underline transition-colors">Panduan Pengguna</span>
            <span className="cursor-pointer hover:text-[#960006] hover:underline transition-colors">Pusat Bantuan</span>
            <span className="cursor-pointer hover:text-[#960006] hover:underline transition-colors">Kebijakan Privasi</span>
          </div>
        </div>
      </footer>

    </div>
  );
};