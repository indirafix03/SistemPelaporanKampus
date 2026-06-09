from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    mahasiswa = "mahasiswa"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.mahasiswa, nullable=False)
    nama_lengkap = Column(String, nullable=False)
    nomor_identitas = Column(String, unique=True, index=True, nullable=False) # NIM atau NIP

    # Relasi: Satu user bisa memiliki banyak laporan yang dia buat
    reports = relationship("Report", back_populates="pelapor")