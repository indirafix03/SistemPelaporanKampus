import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import unhasImage from "../../assets/unhas.jpg";
import FooterInfo from "../../components/FooterInfo";

export default function Login() {
    // 1. State untuk form input, error, dan loading
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("mahasiswa");
    const { login } = useAuth();
    const navigate = useNavigate();

    // 2. Fungsi Handler saat form dikirim
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            return setError("Email dan kata sandi wajib diisi!");
        }

        setLoading(true);

        try {
            // OAuth2 di FastAPI mengharapkan body x-www-form-urlencoded
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Login gagal");
            }

            // Validasi: role yang dipilih di tab harus sama dengan role asli akun
            if (data.role !== role) {
                throw new Error(
                    role === "mahasiswa"
                        ? "Akun ini terdaftar sebagai Admin. Silakan pilih tab Admin untuk masuk."
                        : "Akun ini terdaftar sebagai Mahasiswa. Silakan pilih tab Mahasiswa untuk masuk."
                );
            }

            login(data.user, data.role, data.access_token);
            navigate(data.role === "admin" ? "/admin/dashboard" : "/mahasiswa/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-white min-h-screen font-sans antialiased">
            {/* AREA UTAMA */}
            <main className="flex-1 flex items-center justify-center w-full max-w-[1200px] mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between w-full gap-10">
                    {/* SISI KIRI: BANNER INFORMASI */}
                    <div className="flex-1 w-full flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-[#960006] text-3xl md:text-[36px] font-bold tracking-tight leading-tight">
                                Sistem Pelaporan Fasilitas Kampus
                            </h1>
                            <p className="text-[#5C403C] text-sm md:text-base leading-relaxed max-w-[506px]">
                                Menjaga kenyamanan belajar dengan layanan pelaporan kerusakan dan pemeliharaan infrastruktur kampus yang cepat dan transparan.
                            </p>
                        </div>

                        <div className="w-full bg-[#FFF0EE] p-0.5 rounded-lg border border-solid border-[#E5BDB8] shadow-sm overflow-hidden">
                            <img
                                src={unhasImage}
                                className="w-full h-auto max-h-[380px] rounded-md object-cover"
                                alt="Banner Kampus"
                            />
                        </div>

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

                    {/* SISI KANAN: FORM BOX LOGIN */}
                    <div className="w-full lg:w-[460px] bg-white p-10 rounded-xl border border-solid border-[#E5BDB8] shadow-sm flex flex-col">
                        <div className="flex flex-col gap-1.5 mb-8 text-left">
                            <h2 className="text-[#960006] text-3xl font-bold tracking-tight">
                                Selamat Datang
                            </h2>
                            <p className="text-[#5C403C] text-sm md:text-base">
                                Masuk untuk mulai mengelola dan melaporkan fasilitas.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 w-full mb-6 text-left">
                            <label className="text-[#5C403C] text-sm font-bold">Masuk Sebagai</label>
                            <div className="flex gap-2 w-full">
                                <button
                                    type="button"
                                    onClick={() => setRole("mahasiswa")}
                                    className={`flex-1 py-3 text-sm rounded border transition-all ${role === "mahasiswa"
                                        ? "bg-[#960006] text-white border-[#960006]"
                                        : "bg-[#FFF8F7] text-[#5C403C] border-[#E5BDB8]"
                                        }`}
                                >
                                    Mahasiswa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("admin")}
                                    className={`flex-1 py-3 text-sm rounded border transition-all ${role === "admin"
                                        ? "bg-[#960006] text-white border-[#960006]"
                                        : "bg-[#FFF8F7] text-[#5C403C] border-[#E5BDB8]"
                                        }`}
                                >
                                    Admin
                                </button>
                            </div>
                        </div>

                        {/* Form Elemen */}
                        <form onSubmit={handleLogin} className="flex flex-col text-left">
                            {/* Alert Pesan Error */}
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-5 mb-8">
                                {/* Input Email */}
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label className="text-[#5C403C] text-sm font-bold">Alamat Email</label>
                                    <div className="flex items-center bg-[#FFF8F7] px-4 py-3 gap-3 rounded border border-solid border-[#E5BDB8] focus-within:border-[#960006] transition-all">
                                        <img
                                            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/o8nazz4l_expires_30_days.png"
                                            className="w-5 h-5 object-contain opacity-80"
                                            alt="Mail"
                                        />
                                        <input
                                            type="email"
                                            placeholder="nama@student.unhas.ac.id"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="bg-transparent text-base text-gray-800 outline-none w-full placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Input Password */}
                                <div className="flex flex-col gap-1.5 w-full">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[#5C403C] text-sm font-bold">Kata Sandi</label>
                                        <span className="text-[#960006] text-sm hover:underline cursor-pointer">
                                            Lupa Kata Sandi?
                                        </span>
                                    </div>
                                    <div className="flex items-center bg-[#FFF8F7] px-4 py-3 rounded border border-solid border-[#E5BDB8] focus-within:border-[#960006] transition-all">
                                        <img
                                            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/0HESghFleT/n5hwcfn7_expires_30_days.png"
                                            className="w-4 h-5 mr-1 object-contain opacity-80"
                                            alt="Lock"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Masukkan kata sandi"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-transparent text-base text-gray-800 outline-none w-full placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Button Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-[#960006] hover:bg-[#800005] text-white text-center py-3.5 rounded text-base transition-colors shadow-md ${loading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                {loading ? "Memproses..." : "Masuk Sekarang"}
                            </button>
                        </form>

                        {/* Link ke Register */}
                        <div className="mt-8 text-center w-full">
                            <Link
                                to="/register"
                                className="text-[#5C403C] text-sm font-medium cursor-pointer hover:text-[#960006] hover:underline transition-colors"
                            >
                                Belum memiliki akun? Daftar sekarang
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <FooterInfo />
        </div>
    );
}