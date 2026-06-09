from datetime import datetime, timedelta
from typing import Optional
import jwt
from app.models.user import UserRole

# KUNCI RAHASIA UTAMA (Ganti dengan string random yang aman di file .env nanti)
SECRET_KEY = "SUPER_SECRET_KEY_SISTEM_PELAPORAN_MAHASISWA_UNHAS_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # Token aktif selama 1 hari (24 jam)

# Simulasi hashing sederhana jika belum menginstall passlib/bcrypt.
# SANGAT DISARANKAN nanti menjalankan: pip install "passlib[bcrypt]"
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
except ImportError:
    # Fallback jika library belum siap (hanya untuk development awal)
    def hash_password(password: str) -> str:
        return password + "mockhash"
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return (plain_password + "mockhash") == hashed_password

# Fungsi untuk membuat JWT Token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt