from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.report import ReportStatus, ReportPriority
from app.schemas.user import UserResponse

# ==========================================
# SKEMA PENDUKUNG TIMELINE & LOG
# ==========================================
class ReportLogResponse(BaseModel):
    id: int
    status_log: str
    catatan: Optional[str] = None
    oleh_user: str
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# SKEMA UNTUK MAHASISWA
# ==========================================
class MahasiswaStatsResponse(BaseModel):
    total_laporan_bulan_ini: int
    status_counts: dict
    persentase_selesai_bulan_ini: float

class MahasiswaRecentReport(BaseModel):
    id_laporan: str
    fasilitas: str
    kategori: str
    lokasi_spesifik: str
    foto_url: Optional[str] = None # Tambahkan ini
    status: ReportStatus
    created_at: datetime

class MahasiswaReportDetail(BaseModel):
    id_laporan: str
    kategori: str
    fasilitas: str
    lokasi_spesifik: str
    deskripsi: str
    foto_urls: List[str]
    tanggapan_admin: Optional[str] = None
    status: ReportStatus
    timeline_riwayat: List[ReportLogResponse]

    class Config:
        from_attributes = True

class MahasiswaHistoryResponse(BaseModel):
    total_laporan_diselesaikan_all_time: int
    total_data: int
    daftar_laporan: List[MahasiswaRecentReport]

# ==========================================
# SKEMA UNTUK ADMIN
# ==========================================
class AdminStatsResponse(BaseModel):
    laporan_pending: int
    laporan_diproses: int
    persentase_peningkatan_dari_rata_rata: float

class AdminTechnicianActivity(BaseModel):
    id_laporan: str
    teknisi_nama: str
    status_perbaikan: str
    waktu_update: datetime

class AdminActionRequest(BaseModel):
    status: ReportStatus
    prioritas: ReportPriority
    deskripsi_tanggapan_admin: str

class AdminAnalyticsResponse(BaseModel):
    total_selesai: int
    rerata_respon_jam: float
    status_efisiensi_pemeliharaan: str
    daftar_detail_selesai: List[MahasiswaRecentReport]

class ReportResponse(BaseModel):
    id: str
    pelapor_id: int
    pelapor: Optional[UserResponse] = None
    kategori: str
    fasilitas: str
    lokasi_spesifik: str
    deskripsi: str
    foto_url: Optional[str] = None
    status: ReportStatus
    prioritas: Optional[ReportPriority] = None
    teknisi_nama: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReportUpdateStatus(BaseModel):
    status: ReportStatus
    prioritas: ReportPriority
    teknisi_nama: Optional[str] = None
    catatan_admin: Optional[str] = None

class ReportListWithPagination(BaseModel):
    total_data: int
    daftar_laporan: List[ReportResponse]

class DashboardStats(BaseModel):
    pending_count: int
    diproses_count: int
    selesai_count: int
    total_count: int