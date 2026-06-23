from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy.orm import joinedload
 
from app.database import get_db
from app.models.user import User, UserRole
from app.models.report import Report, ReportLog, ReportStatus, ReportPriority
from app.schemas.report import (
    ReportResponse, ReportListWithPagination
)
from app.deps import get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# =====================================================================
# FUNCTION HELPER: MENGENAL GENERASI ID CUSTOM (Contoh: #REP-00124)
# =====================================================================
def generate_report_id(db: Session) -> str:
    # Menghitung total laporan untuk membuat penomoran urut otomatis
    count = db.query(Report).count() + 1
    return f"#REP-{count:05d}"



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
@router.get("/", response_model=ReportListWithPagination)
def get_reports(
    q_search: Optional[str] = Query(None),
    status_filter: Optional[ReportStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"DEBUG: Admin accessing /reports. Current user role: {current_user.role}")
    print(f"DEBUG: Initial query count for all reports: {db.query(Report).count()}")

    query = db.query(Report)
    query = query.options(joinedload(Report.pelapor)) # Eager load pelapor
    # Jika yang mengakses adalah mahasiswa, batasi hanya melihat laporan miliknya saja
    if current_user.role == UserRole.mahasiswa:
        query = query.filter(Report.pelapor_id == current_user.id)
    
    # Apply search filter
    if q_search:
        query = query.filter(
            (Report.id.ilike(f"%{q_search}%")) |
            (Report.fasilitas.ilike(f"%{q_search}%")) |
            (Report.lokasi_spesifik.ilike(f"%{q_search}%")) |
            (Report.deskripsi.ilike(f"%{q_search}%"))
        )
        
    # Terapkan filter status jika dikirim oleh frontend (misal filter 'SELESAI' untuk menu riwayat)
    if status_filter:
        query = query.filter(Report.status == status_filter)
        
    # Urutkan dari yang paling baru dimasukkan
    total_data = query.count()
    print(f"DEBUG: Total data after filters (get_reports): {total_data}")

    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "total_data": total_data,
        "daftar_laporan": reports
    }


