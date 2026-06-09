from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.laporan import LaporanModel
from ..schemas.laporan import LaporanResponse

router = APIRouter(prefix="/api/laporan", tags=["Laporan"])

@router.get("/", response_model=List[LaporanResponse])
def get_all_laporan(db: Session = Depends(get_db)):
    # Mengambil semua data dari tabel laporan di PostgreSQL
    laporan = db.query(LaporanModel).all()
    return laporan