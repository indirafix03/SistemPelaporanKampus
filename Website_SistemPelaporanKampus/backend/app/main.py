from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, mahasiswa_report, admin_report, report
from fastapi.staticfiles import StaticFiles

# Inisialisasi aplikasi FastAPI
app = FastAPI(title="Sistem Pelaporan Fasilitas Kampus")

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Konfigurasi CORS jika dihubungkan ke Frontend (React/Vue/Android)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hubungkan router ke aplikasi utama
app.include_router(auth.router, prefix="/api")
app.include_router(mahasiswa_report.router, prefix="/api")
app.include_router(admin_report.router, prefix="/api")
app.include_router(report.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Backend Sistem Pelaporan Kampus Aktif"}