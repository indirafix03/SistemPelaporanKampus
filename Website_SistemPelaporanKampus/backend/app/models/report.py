from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.database import Base

class ReportStatus(str, enum.Enum):
    PENDING = "PENDING"
    DIPROSES = "DIPROSES"
    SELESAI = "SELESAI"
    DIBATALKAN = "DIBATALKAN"

class ReportPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True) # Custom ID format: #REP-XXXXX atau #LP-2026-XXX
    pelapor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    kategori = Column(String, nullable=False)         # e.g., LISTRIK, SANITASI, PERABOT
    fasilitas = Column(String, nullable=False)        # e.g., AC Bocor, Lampu Padam
    lokasi_spesifik = Column(String, nullable=False)  # e.g., Ruang Kelas PBT 204
    deskripsi = Column(Text, nullable=False)
    foto_url = Column(String, nullable=True)          # Path/URL foto bukti kerusakan
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING, nullable=False)
    prioritas = Column(Enum(ReportPriority), nullable=True) # Diisi oleh admin nanti
    teknisi_nama = Column(String, nullable=True)      # Nama teknisi yang ditugaskan admin
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relasi balik ke pengguna
    pelapor = relationship("User", back_populates="reports")
    
    # Relasi ke tabel timeline log
    logs = relationship("ReportLog", back_populates="report", cascade="all, delete-orphan")


class ReportLog(Base):
    __tablename__ = "report_logs"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("reports.id"), nullable=False)
    status_log = Column(String, nullable=False)  # e.g., "Laporan Diajukan", "Status diubah ke 'Processing'"
    catatan = Column(Text, nullable=True)        # Tempat menyimpan pesan tanggapan admin jika ada
    oleh_user = Column(String, nullable=False)   # Nama orang/aktor yang merubah status (Sistem, Nama Mahasiswa, Nama Admin)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relasi balik ke tabel laporan utama
    report = relationship("Report", back_populates="logs")