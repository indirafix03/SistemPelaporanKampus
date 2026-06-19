-- Skema Database Sistem Pelaporan Fasilitas Kampus
-- Database: PostgreSQL

-- 1. Definisi Tipe ENUM (Gunakan IF NOT EXISTS via DO block untuk keamanan)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('mahasiswa', 'admin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE report_status AS ENUM ('PENDING', 'DIPROSES', 'SELESAI', 'DIBATALKAN');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_priority') THEN
        CREATE TYPE report_priority AS ENUM ('RENDAH', 'SEDANG', 'TINGGI');
    END IF;
END $$;

-- 2. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    nomor_identitas VARCHAR(50) UNIQUE NOT NULL, -- NIM atau NIP
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'mahasiswa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Reports
-- Catatan: ID menggunakan VARCHAR karena backend men-generate ID custom (ex: #REP-00001 atau ADM-2026-XXXXX)
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,
    pelapor_id INTEGER NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    fasilitas VARCHAR(255) NOT NULL,
    lokasi_spesifik TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    foto_url TEXT, -- Menyimpan path foto atau daftar nama file (CSV)
    status report_status DEFAULT 'PENDING',
    prioritas report_priority DEFAULT 'SEDANG',
    teknisi_nama VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pelapor FOREIGN KEY (pelapor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabel Report Logs (Timeline)
CREATE TABLE IF NOT EXISTS report_logs (
    id SERIAL PRIMARY KEY,
    report_id VARCHAR(50) NOT NULL,
    status_log VARCHAR(255) NOT NULL,
    catatan TEXT,
    oleh_user VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_report_log FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Tambahkan index untuk pencarian ID laporan yang sering dilakukan di log
CREATE INDEX IF NOT EXISTS idx_report_logs_report_id ON report_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_reports_pelapor_id ON reports(pelapor_id);