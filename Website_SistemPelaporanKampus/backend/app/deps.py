from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = "RAHASIA_SUPER_KAMPUS"
ALGORITHM = "HS256"

# ==========================================
# 1. AMBIL USER YANG SEDANG LOGIN (MAHASISWA/ADMIN)
# ==========================================
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesi login tidak valid atau telah berakhir.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Dekode token dengan menambahkan leeway (toleransi selisih waktu) sebesar 10 detik
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], leeway=10)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi login Anda telah kedaluwarsa. Silakan login ulang.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidTokenError:
        raise credentials_exception

    # Cari user di database PostgreSQL
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user

# ==========================================
# 2. VALIDASI KHUSUS JIKA HARUS ADMIN (YANG HILANG)
# ==========================================
def get_current_admin(current_user: User = Depends(get_current_user)):
    # Memeriksa apakah value dari enum role milik user adalah 'admin'
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Endpoint ini hanya untuk Admin."
        )
    return current_user