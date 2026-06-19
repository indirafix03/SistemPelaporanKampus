from datetime import datetime, timedelta, timezone
from typing import List, Optional
import jwt
from passlib.context import CryptContext # <--- Pastikan library hashing terpakai

# Konfigurasi hashing password menggunakan bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "RAHASIA_SUPER_KAMPUS"
ALGORITHM = "HS256"


# ==========================================
# 1. FUNGSI ENKRIPSI & VERIFIKASI PASSWORD
# ==========================================
def hash_password(password: str) -> str:
    """Mengubah password teks biasa menjadi hash acak"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Mencocokkan password inputan dengan hash di database"""
    return pwd_context.verify(plain_password, hashed_password)

# ==========================================
# 2. FUNGSI PEMBUATAN TOKEN JWT (ZONA WAKTU UTC)
# ==========================================
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    
    # Menentukan waktu expired dengan timezone-aware UTC yang akurat
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60) 
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
