# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# 1. Tambahkan import laporan
from app.routers import auth, mahasiswa_report, admin_report, laporan 

app = FastAPI(title="Sistem Pelaporan Fasilitas Kampus")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(mahasiswa_report.router)
app.include_router(admin_report.router)
# 2. Daftarkan router laporan di sini
app.include_router(laporan.router) 

@app.get("/")
def root():
    return {"message": "Backend Sistem Pelaporan Kampus Aktif"}