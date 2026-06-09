import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User, UserRole
from app.models.report import Report, ReportLog, ReportStatus, ReportPriority
from app.schemas.report import ReportResponse, ReportUpdateStatus, DashboardStats
from app.deps import get_current_user, get_current_admin

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

# Folder tempat menyimpan foto bukti laporan yang diunggah
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# =====================================================================
# FUNCTION HELPER: MENGENAL GENERASI ID CUSTOM (Contoh: #REP-00124)
# =====================================================================
def generate_report_id(db: Session) -> str:
    # Menghitung total laporan untuk membuat penomoran urut otomatis
    count = db.query(Report).count() + 1
    return f"#REP-{count:05d}"


# =====================================================================
# 1. ENDPOINT MAHASISWA: KIRIM LAPORAN KERUSAKAN
# =====================================================================
@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    kategori: str = Form(...),
    fasilitas: str = Form(...),
    lokasi_spesifik: str = Form(...),
    deskripsi: str = Form(...),
    foto: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Menyimpan file foto jika diunggah oleh mahasiswa
    foto_url = None
    if foto:
        file_extension = foto.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(await foto.read())
        foto_url = f"/{file_path}"

    # Generate ID unik untuk laporan
    report_id = generate_report_id(db)

    # Buat data laporan baru
    new_report = Report(
        id=report_id,
        pelapor_id=current_user.id,
        kategori=kategori.upper(),
        fasilitas=fasilitas,
        lokasi_spesifik=lokasi_spesifik,
        deskripsi=deskripsi,
        foto_url=foto_url,
        status=ReportStatus.PENDING
    )
    db.add(new_report)
    
    # Otomatis membuat log riwayat pertama (Timeline)
    initial_log = ReportLog(
        report_id=report_id,
        status_log="Laporan Diajukan",
        catatan="Laporan berhasil dibuat oleh mahasiswa dan menunggu verifikasi admin.",
        oleh_user=current_user.nama_lengkap
    )
    db.add(initial_log)
    
    db.commit()
    db.refresh(new_report)
    return new_report


# =====================================================================
# 2. ENDPOINT ADMIN: BUAT LAPORAN KHUSUS (TEMUAN DOSEN / STAF)
# =====================================================================
@router.post("/admin-create", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_report(
    kategori: str = Form(...),
    fasilitas: str = Form(...),
    lokasi_spesifik: str = Form(...),
    deskripsi: str = Form(...),
    prioritas: ReportPriority = Form(...),
    teknisi_nama: Optional[str] = Form(None),
    foto: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    foto_url = None
    if foto:
        file_extension = foto.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            buffer.write(await foto.read())
        foto_url = f"/{file_path}"

    report_id = generate_report_id(db)

    new_report = Report(
        id=report_id,
        pelapor_id=current_admin.id,
        kategori=kategori.upper(),
        fasilitas=fasilitas,
        lokasi_spesifik=lokasi_spesifik,
        deskripsi=deskripsi,
        foto_url=foto_url,
        status=ReportStatus.DIPROSES,  # Laporan dari staf/admin bisa langsung set ke DIPROSES
        prioritas=prioritas,
        teknisi_nama=teknisi_nama
    )
    db.add(new_report)

    # Catat ke log timeline
    log_text = f"Laporan internal dibuat dengan tingkat prioritas {prioritas.value}."
    if teknisi_nama:
        log_text += f" Ditugaskan kepada teknisi: {teknisi_nama}."

    initial_log = ReportLog(
        report_id=report_id,
        status_log="Laporan Internal Dibuat",
        catatan=log_text,
        oleh_user=current_admin.nama_lengkap
    )
    db.add(initial_log)

    db.commit()
    db.refresh(new_report)
    return new_report


# =====================================================================
# 3. ENDPOINT UMUM: LIHAT DETAIL LAPORAN & LOG TIMELINE
# =====================================================================
@router.get("/{report_id}", response_model=ReportResponse)
def get_report_detail(
    report_id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan.")
    
    # Keamanan: Mahasiswa tidak boleh melihat detail laporan milik mahasiswa lain
    if current_user.role == UserRole.mahasiswa and report.pelapor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Akses ditolak ke laporan ini.")
        
    return report


# =====================================================================
# 4. ENDPOINT UMUM: DAFTAR LAPORAN (DENGAN FILTER UNTUK RIWAYAT & ARSIP)
# =====================================================================
@router.get("/", response_model=List[ReportResponse])
def get_reports(
    status_filter: Optional[ReportStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Report)
    
    # Jika yang mengakses adalah mahasiswa, batasi hanya melihat laporan miliknya saja
    if current_user.role == UserRole.mahasiswa:
        query = query.filter(Report.pelapor_id == current_user.id)
        
    # Terapkan filter status jika dikirim oleh frontend (misal filter 'SELESAI' untuk menu riwayat)
    if status_filter:
        query = query.filter(Report.status == status_filter)
        
    # Urutkan dari yang paling baru dimasukkan
    return query.order_by(Report.created_at.desc()).all()


# =====================================================================
# 5. ENDPOINT ADMIN: TINDAKAN KELOLA LAPORAN (UPDATE STATUS & TIMELINE)
# =====================================================================
@router.put("/{report_id}/kelola", response_model=ReportResponse)
def kelola_laporan(
    report_id: str,
    update_data: ReportUpdateStatus,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan.")

    # Deteksi perubahan untuk dicatatkan ke log riwayat
    status_lama = report.status
    
    # Update data utama laporan
    report.status = update_data.status
    report.prioritas = update_data.prioritas
    if update_data.teknisi_nama:
        report.teknisi_nama = update_data.teknisi_nama

    # Jika ada perubahan status, buat log baru di timeline
    if status_lama != update_data.status:
        log_status_title = f"Status Diubah ke {update_data.status.value}"
        
        new_log = ReportLog(
            report_id=report.id,
            status_log=log_status_title,
            catatan=update_data.catatan_admin or f"Laporan sedang diproses dengan prioritas {update_data.prioritas.value}.",
            oleh_user=current_admin.nama_lengkap
        )
        db.add(new_log)

    db.commit()
    db.refresh(report)
    return report


# =====================================================================
# 6. ENDPOINT DASHBOARD: STATISTIK RINGKAS UNTUK KEDUA ROLE
# =====================================================================
@router.get("/analytics/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Report)
    
    # Jika mahasiswa, statistik hanya menghitung data miliknya
    if current_user.role == UserRole.mahasiswa:
        query = query.filter(Report.pelapor_id == current_user.id)
        
    pending_count = query.filter(Report.status == ReportStatus.PENDING).count()
    diproses_count = query.filter(Report.status == ReportStatus.DIPROSES).count()
    selesai_count = query.filter(Report.status == ReportStatus.SELESAI).count()
    total_count = query.count()

    return {
        "pending_count": pending_count,
        "diproses_count": diproses_count,
        "selesai_count": selesai_count,
        "total_count": total_count
    }