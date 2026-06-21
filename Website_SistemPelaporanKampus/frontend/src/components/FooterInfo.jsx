import { useState } from "react";

function DocIcon() {
    return ( <
        svg className = "w-5 h-5"
        viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "2"
        strokeLinecap = "round"
        strokeLinejoin = "round" >
        <
        path d = "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" / >
        <
        polyline points = "14 2 14 8 20 8" / >
        <
        line x1 = "16"
        y1 = "13"
        x2 = "8"
        y2 = "13" / >
        <
        line x1 = "16"
        y1 = "17"
        x2 = "8"
        y2 = "17" / >
        <
        line x1 = "10"
        y1 = "9"
        x2 = "8"
        y2 = "9" / >
        <
        /svg>
    );
}

const CONTENT = {
        panduan: {
            title: "Panduan Pengguna",
            body: ( <
                div className = "space-y-5" >
                <
                p className = "text-sm text-gray-600" >
                Panduan resmi bagi pengguna dalam menggunakan Sistem Pelaporan Fasilitas Kampus:
                <
                /p>

                <
                div >
                <
                p className = "font-bold text-gray-900" >
                <
                span className = "text-[#960006]" > 1. < /span> Mendaftar Akun <
                /p> <
                p className = "text-sm text-gray-600 mt-1" >
                Daftar menggunakan email kampus(contoh: < span className = "font-semibold" > nama @student.unhas.ac.id < /span>) dan NIM/nomor
                    identitas Anda melalui halaman Daftar. <
                    /p> <
                    /div>

                    <
                    div >
                    <
                    p className = "font-bold text-gray-900" >
                    <
                    span className = "text-[#960006]" > 2. < /span> Memilih Peran saat Login <
                    /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Pilih tab < span className = "font-semibold" > Mahasiswa < /span> atau <span className="font-semibold">Admin</span > sesuai jenis akun Anda sebelum memasukkan email dan kata sandi. <
                    /p> <
                    /div>

                    <
                    div >
                    <
                    p className = "font-bold text-gray-900" >
                    <
                    span className = "text-[#960006]" > 3. < /span> Mengirim Laporan <
                    /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Mahasiswa dapat mengirim laporan kerusakan fasilitas lengkap dengan deskripsi, lokasi, dan foto pendukung. <
                    /p> <
                    /div>

                    <
                    div >
                    <
                    p className = "font-bold text-gray-900" >
                    <
                    span className = "text-[#960006]" > 4. < /span> Memantau Status Laporan <
                    /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Pantau perkembangan laporan Anda secara real - time melalui halaman Riwayat Laporan. <
                    /p> <
                    /div>

                    <
                    div >
                    <
                    p className = "font-bold text-gray-900" >
                    <
                    span className = "text-[#960006]" > 5. < /span> Proses Verifikasi oleh Admin <
                    /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Admin akan memverifikasi setiap laporan yang masuk dan meneruskannya ke bagian Sarana dan Prasarana terkait untuk ditindaklanjuti. <
                    /p> <
                    /div> <
                    /div>
                ),
            },

            bantuan: {
                title: "Pusat Bantuan",
                body: ( <
                    div className = "space-y-5" >
                    <
                    p className = "text-sm text-gray-600" >
                    Pertanyaan yang sering diajukan seputar penggunaan sistem:
                    <
                    /p>

                    <
                    div className = "border border-gray-200 rounded-lg p-4" >
                    <
                    p className = "font-bold text-gray-900" > Lupa kata sandi, bagaimana cara reset ? < /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Fitur reset kata sandi mandiri akan segera tersedia.Untuk saat ini, silakan hubungi admin sistem agar kata sandi Anda dapat direset secara manual. <
                    /p> <
                    /div>

                    <
                    div className = "border border-gray-200 rounded-lg p-4" >
                    <
                    p className = "font-bold text-gray-900" > Muncul pesan akun terdaftar sebagai peran lain saat login ? < /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Pastikan Anda memilih tab peran(Mahasiswa / Admin) yang sesuai dengan jenis akun Anda sebelum memasukkan email dan kata sandi. <
                    /p> <
                    /div>

                    <
                    div className = "border border-gray-200 rounded-lg p-4" >
                    <
                    p className = "font-bold text-gray-900" > Laporan saya belum diproses, harus bagaimana ? < /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Laporan biasanya diproses dalam 1– 3 hari kerja.Jika melewati waktu tersebut, silakan hubungi admin melalui kontak di bawah. <
                    /p> <
                    /div>

                    <
                    div className = "bg-[#FFF0EE] border border-[#E5BDB8] rounded-lg p-4" >
                    <
                    p className = "font-bold text-[#960006]" > Butuh bantuan lebih lanjut ? < /p> <
                    p className = "text-sm text-gray-700 mt-1" >
                    Hubungi tim admin di < span className = "font-semibold" > admin @sistempelaporankampus.unhas.ac.id < /span> <
                    /p> <
                    /div> <
                    /div>
                ),
            },

            privasi: {
                title: "Kebijakan Privasi",
                body: ( <
                    div className = "space-y-5" >
                    <
                    p className = "text-sm text-gray-600" >
                    Kebijakan privasi ini berlaku bagi seluruh pengguna Sistem Pelaporan Fasilitas Kampus:
                    <
                    /p>

                    <
                    div >
                    <
                    p className = "font-bold text-gray-900" >
                    <
                    span className = "text-[#960006]" > 1. < /span> Data yang Dikumpulkan <
                    /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Nama lengkap, NIM / nomor identitas, alamat email kampus, dan kata sandi(disimpan dalam bentuk terenkripsi) saat Anda mendaftar. <
                    /p> <
                    /div>

                    <
                    div >
                    <
                    p className = "font-bold text-gray-900" >
                    <
                    span className = "text-[#960006]" > 2. < /span> Penggunaan Data <
                    /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Data laporan yang Anda kirimkan(judul, deskripsi, lokasi, dan foto) digunakan semata - mata untuk keperluan verifikasi dan penindaklanjutan oleh admin serta bagian Sarana dan Prasarana. <
                    /p> <
                    /div>

                    <
                    div >
                    <
                    p className = "font-bold text-gray-900" >
                    <
                    span className = "text-[#960006]" > 3. < /span> Keamanan & Akses Data <
                    /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Hanya admin yang berwenang yang dapat mengakses data laporan dan identitas pengirim.Data tidak dibagikan ke pihak ketiga di luar lingkup pengelolaan sistem ini. <
                    /p> <
                    /div>

                    <
                    div >
                    <
                    p className = "font-bold text-gray-900" >
                    <
                    span className = "text-[#960006]" > 4. < /span> Persetujuan Pengguna <
                    /p> <
                    p className = "text-sm text-gray-600 mt-1" >
                    Dengan menggunakan sistem ini, Anda menyetujui pengumpulan dan penggunaan data sesuai kebijakan di atas. <
                    /p> <
                    /div> <
                    /div>
                ),
            },
        };

        export default function FooterInfo() {
            const [active, setActive] = useState(null);
            const data = active ? CONTENT[active] : null;

            return ( <
                >
                <
                footer className = "w-full bg-white p-8 border-t border-solid border-gray-100" >
                <
                div className = "max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left" >
                <
                span className = "text-[#916F6A] text-sm font-bold" > ©2026 Sistem Pelaporan Fasilitas Kampus.Hak Cipta Dilindungi. <
                /span> <
                div className = "flex flex-wrap justify-center gap-6 text-[#5C403C] font-bold text-sm" >
                <
                span onClick = {
                    () => setActive("panduan") }
                className = "cursor-pointer hover:text-[#960006] hover:underline transition-colors" > Panduan Pengguna < /span> <
                span onClick = {
                    () => setActive("bantuan") }
                className = "cursor-pointer hover:text-[#960006] hover:underline transition-colors" > Pusat Bantuan < /span> <
                span onClick = {
                    () => setActive("privasi") }
                className = "cursor-pointer hover:text-[#960006] hover:underline transition-colors" > Kebijakan Privasi < /span> <
                /div> <
                /div> <
                /footer>

                {
                    data && ( <
                        div className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                        onClick = {
                            () => setActive(null) } >
                        <
                        div className = "bg-white rounded-xl shadow-2xl w-full max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden"
                        onClick = {
                            (e) => e.stopPropagation() } >
                        { /* Header */ } <
                        div className = "flex items-center justify-between gap-4 px-6 py-5 border-b border-gray-100" >
                        <
                        div className = "flex items-center gap-3" >
                        <
                        span className = "text-[#960006]" >
                        <
                        DocIcon / >
                        <
                        /span> <
                        h3 className = "text-lg font-bold text-gray-900" > { data.title } < /h3> <
                        /div> <
                        button onClick = {
                            () => setActive(null) }
                        className = "text-gray-400 hover:text-[#960006] text-2xl leading-none" >
                        ×
                        <
                        /button> <
                        /div>

                        { /* Konten scrollable */ } <
                        div className = "px-6 py-5 overflow-y-auto flex-1" > { data.body } <
                        /div>

                        { /* Footer */ } <
                        div className = "px-6 py-4 border-t border-gray-100 flex justify-end" >
                        <
                        button onClick = {
                            () => setActive(null) }
                        className = "bg-[#960006] hover:bg-[#800005] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors" >
                        Mengerti <
                        /button> <
                        /div> <
                        /div> <
                        /div>
                    )
                } <
                />
            );
        }