from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random
import uuid
import os
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.report import Report, ReportStatus, ReportPriority, ReportLog
from app.deps import get_current_admin
from app.schemas.report import (
    AdminStatsResponse, AdminTechnicianActivity, 
    AdminActionRequest, AdminAnalyticsResponse, MahasiswaRecentReport,
    ReportResponse
)

router = APIRouter(prefix="/admin", tags=["Dashboard Admin"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/dashboard/stats", response_model=AdminStatsResponse)
def get_admin_stats(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    pending = db.query(Report).filter(Report.status == ReportStatus.PENDING).count()
    diproses = db.query(Report).filter(Report.status == ReportStatus.DIPROSES).count()
    total_laporan = db.query(Report).count()
    
    now = datetime.now()
    
    # Awal bulan berjalan (1 Juni 2026)
    start_of_this_month = datetime(now.year, now.month, 1)
    laporan_bulan_ini = db.query(Report).filter(Report.created_at >= start_of_this_month).count()
    
    # Menghitung rentang tanggal untuk bulan lalu (Mei 2026)
    first_day_of_this_month = now.replace(day=1)
    last_day_of_last_month = first_day_of_this_month - timedelta(days=1)
    start_of_last_month = last_day_of_last_month.replace(day=1)
    
    laporan_bulan_lalu = db.query(Report).filter(
        Report.created_at >= start_of_last_month,
        Report.created_at <= last_day_of_last_month
    ).count()
    
    if laporan_bulan_lalu == 0:
        persentase_tren = 0.0
    else:
        persentase_tren = round(((laporan_bulan_ini - laporan_bulan_lalu) / laporan_bulan_lalu) * 100, 1)

    return {
        "laporan_pending": pending,
        "laporan_diproses": diproses,
        "persentase_peningkatan_dari_rata_rata": persentase_tren,
        "total_laporan": total_laporan
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

@router.put("/reports/{report_id}/action", response_model=ReportResponse)
def update_report_action(
    report_id: str, 
    action_in: AdminActionRequest, 
    current_admin: User = Depends(get_current_admin), 
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    status_lama = report.status

    # Update data manajerial admin
    report.status = action_in.status
    report.prioritas = action_in.prioritas
    if action_in.teknisi_nama:
        report.teknisi_nama = action_in.teknisi_nama
    
    # Jika ada perubahan status, tambahkan log riwayat ke timeline
    if status_lama != action_in.status:
        log_status_title = f"Status diubah ke {action_in.status.value}"
        new_log = ReportLog(
            report_id=report_id,
            status_log=log_status_title,
            catatan=action_in.deskripsi_tanggapan_admin or f"Laporan sedang diproses dengan prioritas {action_in.prioritas.value}.",
            oleh_user=current_admin.nama_lengkap
        )
        db.add(new_log)
        
    db.commit()
    db.refresh(report)
    
    return report

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

    # Hitung rata-rata respon perbaikan (dalam jam) secara dinamis
    total_jam = 0.0
    count_selesai = len(reports_selesai)
    for r in reports_selesai:
        durasi = r.updated_at - r.created_at
        total_jam += max(0.0, durasi.total_seconds() / 3600.0)
    
    rerata_respon_jam = round(total_jam / count_selesai, 1) if count_selesai > 0 else 0.0

    # Tentukan status efisiensi pemeliharaan secara dinamis
    if count_selesai == 0:
        status_efisiensi = "Belum ada laporan selesai untuk dianalisis."
    elif rerata_respon_jam <= 24:
        status_efisiensi = "Sistem pemeliharaan sangat efisien. Rata-rata penyelesaian di bawah 24 jam."
    elif rerata_respon_jam <= 72:
        status_efisiensi = "Sistem pemeliharaan cukup efisien. Waktu respon rata-rata berkisar 1-3 hari."
    else:
        status_efisiensi = "Sistem pemeliharaan perlu ditingkatkan. Rata-rata penyelesaian di atas 3 hari."

    # Formatisasi daftar output
    daftar_selesai = [{
        "id_laporan": r.id, 
        "fasilitas": r.fasilitas, 
        "kategori": r.kategori,
        "lokasi_spesifik": r.lokasi_spesifik,
        "foto_url": r.foto_url,
        "status": r.status, 
        "created_at": r.created_at
    } for r in reports_selesai]

    return {
        "total_selesai": count_selesai,
        "rerata_respon_jam": rerata_respon_jam,
        "status_efisiensi_pemeliharaan": status_efisiensi,
        "daftar_detail_selesai": daftar_selesai
    }

@router.post("/reports/create", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_report(
    kategori: str = Form(...),
    fasilitas: str = Form(...),
    lokasi_spesifik: str = Form(...),
    deskripsi: str = Form(...),
    prioritas: ReportPriority = Form(...),
    teknisi_nama: Optional[str] = Form(None),
    files: List[UploadFile] = File(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    foto_url = None
    if files:
        valid_files = [f for f in files if f.filename]
        if valid_files:
            uploaded_urls = []
            for file in valid_files:
                file_extension = file.filename.split(".")[-1]
                unique_filename = f"{uuid.uuid4()}.{file_extension}"
                file_path = os.path.join(UPLOAD_DIR, unique_filename)
                with open(file_path, "wb") as buffer:
                    buffer.write(await file.read())
                uploaded_urls.append(f"/{file_path}")
            foto_url = ",".join(uploaded_urls)

    rand_id = f"ADM-2026-{random.randint(10000, 99999)}"

    new_report = Report(
        id=rand_id,
        pelapor_id=current_admin.id, # Terdaftar atas nama akun admin penginput
        kategori=kategori.upper(),
        fasilitas=fasilitas,
        lokasi_spesifik=lokasi_spesifik,
        deskripsi=deskripsi,
        prioritas=prioritas,
        teknisi_nama=teknisi_nama,
        status=ReportStatus.DIPROSES, # Temuan internal admin langsung berstatus diproses
        foto_url=foto_url
    )
    db.add(new_report)

    log_admin = ReportLog(
        report_id=rand_id,
        status_log="Temuan Langsung Admin",
        catatan=f"Kerusakan ditemukan langsung oleh admin. Ditugaskan segera ke {teknisi_nama if teknisi_nama else 'Teknisi'} dengan prioritas {prioritas.value}.",
        oleh_user=current_admin.nama_lengkap
    )
    db.add(log_admin)
    db.commit()
    db.refresh(new_report)

    return new_report