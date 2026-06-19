# 🏫 Sistem Pelaporan Fasilitas Kampus

Sistem Pelaporan Fasilitas Kampus adalah aplikasi fullstack berbasis web yang dirancang untuk memudahkan mahasiswa dan staf kampus melaporkan serta melacak perbaikan kerusakan fasilitas fisik di lingkungan universitas.

Proyek ini dibangun menggunakan **FastAPI (Python)** untuk backend, **React (Vite) & Tailwind CSS** untuk frontend, serta **PostgreSQL** sebagai sistem manajemen database.

---

## 🚀 Fitur Utama

### 👤 Mahasiswa (Portal Pelapor)
* **Dashboard Mahasiswa:** Ringkasan jumlah laporan aktif, diproses, dan selesai.
* **Kirim Laporan:** Formulir interaktif untuk mengirim aduan kerusakan dengan mengunggah bukti foto fisik (AC bocor, lampu padam, proyektor mati, dll).
* **Riwayat Laporan:** Arsip lengkap seluruh laporan yang pernah diajukan beserta status pengerjaannya.
* **Detail & Timeline Riwayat:** Menampilkan data detail dan *timeline log* perjalanan laporan (misal: kapan laporan diajukan, kapan status berubah, dan detail tanggapan admin).

### 👮 Admin (Portal Pengelola)
* **Dashboard Utama:** Ringkasan total laporan, pending, diproses, serta tren kenaikan/penurunan laporan bulanan secara dinamis.
* **Kelola Laporan:** Memproses laporan masuk, mengatur skala prioritas (`RENDAH`, `SEDANG`, `TINGGI`), menugaskan teknisi terkait, dan mengirim catatan perkembangan.
* **Direktori & Penugasan Teknisi:** Pop-up direktori kontak teknisi lapangan terintegrasi berdasarkan keahlian (AC, Listrik, Plumbing, Mebel, IT) untuk kemudahan penugasan satu-kali klik.
* **Standard Operating Procedure (SOP):** Panduan verifikasi dan penentuan prioritas laporan terintegrasi langsung di dashboard.
* **Riwayat & Arsip Laporan:** Akses cepat ke seluruh arsip laporan final yang berstatus `SELESAI` atau `DIBATALKAN`.

---

## 🛠️ Stack Teknologi

* **Backend:** Python 3.10+, FastAPI, SQLAlchemy, Uvicorn, Pydantic, PyJWT, Passlib (Bcrypt).
* **Frontend:** React (Vite), React Router DOM (v7), Tailwind CSS (v4), Axios/Fetch API, AuthContext (JWT).
* **Database:** PostgreSQL 14+.

---

## 📦 Panduan Instalasi & Pengoperasian

Pastikan komputer Anda sudah terinstal **Node.js (LTS)**, **Python 3.10+**, dan **PostgreSQL**.

### 1. Kloning Repositori
```bash
git clone https://github.com/username/SistemPelaporanKampus.git
cd SistemPelaporanKampus
```

### 2. Konfigurasi Database (PostgreSQL)
1. Buat database baru bernama `sistem_pelaporan_kampus` di PostgreSQL Anda.
2. Jalankan script inisialisasi tabel [init_db.sql](file:///c:/Users/Lenovo/OneDrive/Desktop/SistemPelaporanKampus/Website_SistemPelaporanKampus/backend/init_db.sql) pada server PostgreSQL Anda (misalnya melalui pgAdmin atau DBeaver) untuk membuat tabel, relasi, indeks, dan tipe data enum prioritas/status.
3. Sesuaikan URL koneksi database di file [backend/app/database.py](file:///c:/Users/Lenovo/OneDrive/Desktop/SistemPelaporanKampus/Website_SistemPelaporanKampus/backend/app/database.py#L6):
   ```python
   SQLALCHEMY_DATABASE_URL = "postgresql://username:password@localhost:5432/sistem_pelaporan_kampus"
   ```

---

### 3. Setup & Menjalankan Backend (FastAPI)

1. Masuk ke folder backend:
   ```bash
   cd Website_SistemPelaporanKampus/backend
   ```
2. Buat Virtual Environment (Opsional, tapi disarankan):
   ```bash
   python -m venv venv
   # Aktifkan venv di Windows:
   .\venv\Scripts\activate
   ```
3. Instal seluruh dependencies backend:
   ```bash
   pip install -r requirements.txt
   ```
4. Buat akun Admin default untuk login pertama kali (Default username: `admin1@gmail.com` | password: `admin123`):
   ```bash
   python create_admin.py
   ```
5. Jalankan server backend (Uvicorn):
   ```bash
   uvicorn app.main:app --reload
   ```
   *Backend Anda kini berjalan di: **`http://127.0.0.1:8000`***

---

### 4. Setup & Menjalankan Frontend (React)

1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd Website_SistemPelaporanKampus/frontend
   ```
2. Instal dependencies frontend:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
   *Frontend Anda kini berjalan di: **`http://localhost:5173`***

---

## 👥 Akun Akses Default untuk Pengujian

Gunakan akun berikut setelah Anda menjalankan script `create_admin.py` dan mendaftarkan mahasiswa melalui form register:

* **Akun Admin:**
  * **Email:** `admin1@gmail.com`
  * **Password:** `admin123`
* **Akun Mahasiswa:**
  * Lakukan registrasi langsung melalui halaman Daftar di **`http://localhost:5173/register`** untuk membuat akun mahasiswa baru secara gratis.
