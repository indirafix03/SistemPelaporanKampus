from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.report import Report, ReportStatus, ReportPriority, ReportLog
from app.deps import get_current_admin
from app.schemas.report import (
    AdminStatsResponse, AdminTechnicianActivity, 
    AdminActionRequest, AdminAnalyticsResponse, MahasiswaRecentReport
)

router = APIRouter(prefix="/admin", tags=["Dashboard Admin"])

@router.get("/dashboard/stats", response_model=AdminStatsResponse)
def get_admin_stats(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    pending = db.query(Report).filter(Report.status == ReportStatus.PENDING).count()
    diproses = db.query(Report).filter(Report.status == ReportStatus.DIPROSES).count()
    
    # Dummy hitungan persentase peningkatan tugas kuliah
    return {
        "laporan_pending": pending,
        "laporan_diproses": diproses,
        "persentase_peningkatan_dari_rata_rata": 4.5
    }

@router.get("/technicians/activities", response_model=List[AdminTechnicianActivity])
def get_tech_activities(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Mengambil log perbaikan teranyar yang ditugaskan kepada teknisi
    active_reports = db.query(Report).filter(Report.teknisi_nama.isnot(None))\
        .order_by(Report.updated_at.desc()).limit(5).all()

    return [
        {
            "id_laporan": r.id,
            "teknisi_nama": r.teknisi_nama,
            "status_perbaikan": f"Penanganan kerusakan fasilitas {r.fasilitas}",
            "waktu_update": r.updated_at
        } for r in active_reports
    ]

@router.put("/reports/{report_id}/action")
def update_report_action(
    report_id: str, 
    action_in: AdminActionRequest, 
    current_admin: User = Depends(get_current_admin), 
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    # Update data manajerial admin
    report.status = action_in.status
    report.prioritas = action_in.prioritas
    
    # Tambahkan log riwayat ke timeline
    new_log = ReportLog(
        report_id=report_id,
        status_log=f"Status diubah ke {action_in.status.value}",
        catatan=action_in.deskripsi_tanggapan_admin,
        oleh_user=current_admin.nama_lengkap
    )
    db.add(new_log)
    db.commit()
    
    return {"message": "Status laporan berhasil dikelola oleh admin."}

@router.get("/reports/analytics", response_model=AdminAnalyticsResponse)
def get_admin_analytics(
    rentang_waktu: Optional[str] = "bulan_ini",
    kategori_fasilitas: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Report).filter(Report.status == ReportStatus.SELESAI)
    
    if kategori_fasilitas:
        query = query.filter(Report.kategori == kategori_fasilitas.upper())

    reports_selesai = query.all()

    # Formatisasi daftar output
    daftar_selesai = [{"id_laporan": r.id, "fasilitas": r.fasilitas, "status": r.status, "created_at": r.created_at} for r in reports_selesai]

    return {
        "total_selesai": len(reports_selesai),
        "rerata_respon_jam": 2.5,
        "status_efisiensi_pemeliharaan": "Semua sistem berjalan dengan baik di Gedung A dan Gedung B",
        "daftar_detail_selesai": daftar_selesai
    }

@router.post("/reports/create", status_code=status.HTTP_201_CREATED)
def admin_create_report(
    kategori_fasilitas: str = Form(...),
    lokasi_spesifik: str = Form(...),
    deskripsi_kerusakan: str = Form(...),
    prioritas: ReportPriority = Form(...),
    teknisi_nama: str = Form(...),
    foto_bukti: UploadFile = File(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    rand_id = f"ADM-2026-{random.randint(10000, 99999)}"
    filename = foto_bukti.filename if foto_bukti else None

    new_report = Report(
        id=rand_id,
        pelapor_id=current_admin.id, # Terdaftar atas nama akun admin penginput
        kategori=kategori_fasilitas.upper(),
        fasilitas=kategori_fasilitas,
        lokasi_spesifik=lokasi_spesifik,
        deskripsi=deskripsi_kerusakan,
        prioritas=prioritas,
        teknisi_nama=teknisi_nama,
        status=ReportStatus.DIPROSES, # Temuan internal admin langsung berstatus diproses
        foto_url=filename
    )
    db.add(new_report)

    log_admin = ReportLog(
        report_id=rand_id,
        status_log="Temuan Langsung Admin",
        catatan=f"Kerusakan ditemukan langsung oleh admin. Ditugaskan segera ke {teknisi_nama}.",
        oleh_user=current_admin.nama_lengkap
    )
    db.add(log_admin)
    db.commit()

    return {"message": "Laporan internal admin berhasil diterbitkan", "id_laporan": rand_id}