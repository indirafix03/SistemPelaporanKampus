from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.report import ReportStatus, ReportPriority

# ==========================================
# 1. SKEMA UNTUK LOG / TIMELINE RIWAYAT
# ==========================================
class ReportLogResponse(BaseModel):
    id: int
    report_id: str
    status_log: str
    catatan: Optional[str] = None
    oleh_user: str
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# 2. SKEMA UNTUK LAPORAN (REPORT)
# ==========================================

# Skema dasar laporan (Data yang umum)
class ReportBase(BaseModel):
    kategori: str
    fasilitas: str
    lokasi_spesifik: str
    deskripsi: str

# Skema saat Mahasiswa membuat laporan baru (Request)
class ReportCreate(ReportBase):
    pass  # Foto bukti akan ditangani terpisah menggunakan Form/UploadFile di FastAPI

# Skema saat Admin membuat laporan khusus (Request)
class AdminReportCreate(ReportBase):
    prioritas: ReportPriority
    teknisi_nama: Optional[str] = None

# Skema saat Admin mengubah status & memberikan tindakan (Request)
class ReportUpdateStatus(BaseModel):
    status: ReportStatus
    prioritas: ReportPriority
    catatan_admin: Optional[str] = None
    teknisi_nama: Optional[str] = None

# Skema lengkap saat mengirim data laporan ke Frontend (Response)
class ReportResponse(ReportBase):
    id: str
    pelapor_id: int
    status: ReportStatus
    prioritas: Optional[ReportPriority] = None
    teknisi_nama: Optional[str] = None
    foto_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    logs: List[ReportLogResponse] = [] # Memastikan kelas ReportLogResponse sudah ada di atas

    class Config:
        from_attributes = True

# Skema ringkas untuk keperluan statistik di Dashboard
class DashboardStats(BaseModel):
    pending_count: int
    diproses_count: int
    selesai_count: int
    total_count: int