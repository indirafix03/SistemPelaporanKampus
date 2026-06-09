from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, report

# 1. Otomatis membuat file database dan tabel-tabelnya (SQLite / Postgres) jika belum ada
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistem Pelaporan Fasilitas Mahasiswa API",
    description="Backend RESTful API menggunakan FastAPI untuk mengelola pelaporan kerusakan kampus.",
    version="1.0.0"
)

# 2. Setup CORS agar Frontend (React/Vue/Flutter) bisa mengakses API tanpa terblokir browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Kamu bisa mengganti "*" dengan URL frontend spesifik saat production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Mount folder static untuk akses foto bukti yang diunggah oleh user
app.mount("/static", StaticFiles(directory="static"), name="static")

# 4. Daftarkan router-router yang telah kita buat sebelumnya
app.include_router(auth.router)
app.include_router(report.router)

@app.get("/")
def root():
    return {
        "message": "Selamat datang di API Sistem Pelaporan Mahasiswa",
        "docs": "/docs"  # Link otomatis ke dokumentasi Swagger UI
    }