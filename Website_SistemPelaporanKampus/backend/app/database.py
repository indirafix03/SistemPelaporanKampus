import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Mengambil URL database dari environment variable (.env)
# Jika belum diset, default menggunakan SQLite lokal untuk development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sistem_pelaporan.db")

# Jika menggunakan PostgreSQL/MySQL, kodenya tetap sama, tinggal ganti string URL di .env
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class ini akan di-inherit oleh semua model tabel kita
Base = declarative_base()

# Dependency untuk menyisipkan database session ke endpoint FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()