from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid # Import uuid
import os   # Import os
import random
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.report import Report, ReportStatus, ReportLog
from app.deps import get_current_user
from app.schemas.report import (
    MahasiswaStatsResponse, MahasiswaRecentReport, 
    MahasiswaReportDetail, MahasiswaHistoryResponse
)

router = APIRouter(prefix="/mahasiswa", tags=["Dashboard Mahasiswa"])

# Folder tempat menyimpan foto bukti laporan yang diunggah
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True) # Pastikan direktori ada

@router.get("/dashboard/stats", response_model=MahasiswaStatsResponse)
def get_mahasiswa_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    
    # Ambil semua laporan milik user bersangkutan di bulan ini
    user_reports = db.query(Report).filter(
        Report.pelapor_id == current_user.id,
        Report.created_at >= datetime(now.year, now.month, 1)
    ).all()

    total = len(user_reports)
    counts = {"PENDING": 0, "DIPROSES": 0, "SELESAI": 0, "DIBATALKAN": 0}
    
    for r in user_reports:
        counts[r.status.value] += 1

    persentase = (counts["SELESAI"] / total * 100) if total > 0 else 0.0

    return {
        "total_laporan_bulan_ini": total,
        "status_counts": counts,
        "persentase_selesai_bulan_ini": round(persentase, 2)
    }

@router.get("/dashboard/recent-reports", response_model=List[MahasiswaRecentReport])
def get_recent_reports(limit: int = 5, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = db.query(Report).filter(Report.pelapor_id == current_user.id)\
        .order_by(Report.created_at.desc()).limit(limit).all()
    
    return [{
        "id_laporan": r.id, 
        "fasilitas": r.fasilitas, 
        "kategori": r.kategori,
        "lokasi_spesifik": r.lokasi_spesifik,
        "foto_url": r.foto_url, # Tambahkan ini
        "status": r.status, 
        "created_at": r.created_at
    } for r in reports]

@router.post("/reports", status_code=status.HTTP_201_CREATED)
async def create_report(
    kategori: str = Form(...),
    fasilitas: str = Form(...),
    lokasi_spesifik: str = Form(...),
    deskripsi: str = Form(...),
    files: List[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Logika Generate Custom ID Format: REP-2026-XXXXX
    rand_id = f"REP-2026-{random.randint(10000, 99999)}"
    
    # Proses simpan file foto
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

    new_report = Report(
        id=rand_id,
        pelapor_id=current_user.id,
        kategori=kategori.upper(),
        fasilitas=fasilitas,
        lokasi_spesifik=lokasi_spesifik,
        deskripsi=deskripsi,
        foto_url=foto_url, # Gunakan foto_url yang sudah disimpan
        status=ReportStatus.PENDING
    )
    db.add(new_report)
    
    # Otomatis catat log pertama ke timeline
    log_awal = ReportLog(
        report_id=rand_id,
        status_log="Laporan Terkirim",
        catatan="Laporan berhasil dibuat oleh mahasiswa dan menunggu verifikasi admin.",
        oleh_user=current_user.nama_lengkap
    )
    db.add(log_awal)
    db.commit()
    
    return {"message": "Laporan berhasil dikirim", "id_laporan": rand_id}

@router.get("/reports/history", response_model=MahasiswaHistoryResponse)
def get_mahasiswa_history(
    q_search: Optional[str] = Query(None),
    nama_gedung: Optional[str] = Query(None),
    kategori: Optional[str] = Query(None),
    status_filter: Optional[str] = Query("SEMUA"),
    skip: int = Query(0, ge=0),
    limit: int = Query(4, ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Report).filter(Report.pelapor_id == current_user.id)

    if q_search:
        query = query.filter((Report.id.ilike(f"%{q_search}%")) | (Report.fasilitas.ilike(f"%{q_search}%")))
    if nama_gedung:
        query = query.filter(Report.lokasi_spesifik.ilike(f"%{nama_gedung}%"))
    if kategori:
        query = query.filter(Report.kategori == kategori.upper())
    if status_filter and status_filter != "SEMUA":
        query = query.filter(Report.status == status_filter)

    total_data = query.count()
    all_reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    
    total_selesai = db.query(Report).filter(
        Report.pelapor_id == current_user.id, 
        Report.status == ReportStatus.SELESAI
    ).count()

    formatted_list = [{
        "id_laporan": r.id, 
        "fasilitas": r.fasilitas, 
        "kategori": r.kategori,
        "lokasi_spesifik": r.lokasi_spesifik,
        "foto_url": r.foto_url, # Tambahkan ini
        "status": r.status, 
        "created_at": r.created_at
    } for r in all_reports]

    return {
        "total_laporan_diselesaikan_all_time": total_selesai,
        "total_data": total_data,
        "daftar_laporan": formatted_list
    }

@router.get("/reports/{report_id}", response_model=MahasiswaReportDetail)
def get_report_detail(report_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id, Report.pelapor_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    # Ambil tanggapan admin paling terbaru dari log catatan
    tanggapan = db.query(ReportLog.catatan).filter(
        ReportLog.report_id == report_id, 
        ReportLog.oleh_user != current_user.nama_lengkap
    ).order_by(ReportLog.created_at.desc()).first()

    foto_list = report.foto_url.split(",") if report.foto_url else []

    return {
        "id_laporan": report.id,
        "kategori": report.kategori,
        "fasilitas": report.fasilitas,
        "lokasi_spesifik": report.lokasi_spesifik,
        "deskripsi": report.deskripsi,
        "foto_urls": foto_list,
        "tanggapan_admin": tanggapan[0] if tanggapan else "Belum ada tanggapan resmi dari admin.",
        "status": report.status,
        "timeline_riwayat": report.logs
    }