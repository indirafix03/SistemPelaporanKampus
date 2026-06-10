from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Import router baru kita
from app.routers import auth, mahasiswa_report, admin_report 

app = FastAPI(title="Sistem Pelaporan Fasilitas Kampus")

# Konfigurasi CORS jika dihubungkan ke Frontend (React/Vue/Android)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hubungkan router ke aplikasi utama
app.include_router(auth.router)
app.include_router(mahasiswa_report.router)
app.include_router(admin_report.router)

@app.get("/")
def root():
    return {"message": "Backend Sistem Pelaporan Kampus Aktif"}