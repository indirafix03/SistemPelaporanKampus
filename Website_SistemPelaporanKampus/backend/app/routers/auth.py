from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils import verify_password, create_access_token, hash_password
# Pastikan skema user di-import untuk proses registrasi
from app.schemas.user import UserCreate, UserResponse, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ==========================================
# 1. ENDPOINT REGISTRASI (MAHASISWA & ADMIN)
# ==========================================
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Validasi apakah email sudah digunakan
    user_exists = db.query(User).filter(User.email == user_in.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar dalam sistem.")
        
    # Validasi apakah NIM/NIP sudah digunakan
    identity_exists = db.query(User).filter(User.nomor_identitas == user_in.nomor_identitas).first()
    if identity_exists:
        raise HTTPException(status_code=400, detail="NIM atau NIP sudah terdaftar.")

    # Logika penentuan role otomatis berbasis string email
    role_user = UserRole.mahasiswa
    if "admin" in user_in.email.lower():
        role_user = UserRole.admin

    # Membuat user baru ke database PostgreSQL
    new_user = User(
        email=user_in.email,
        nama_lengkap=user_in.nama_lengkap,
        nomor_identitas=user_in.nomor_identitas,
        password_hash=hash_password(user_in.password), # Sandi di-hash demi keamanan
        role=role_user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


# ==========================================
# 2. ENDPOINT LOGIN (MENDUKUNG SWAGGER AUTHORIZE)
# ==========================================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    # Cari user berdasarkan username (di OAuth2Form, input email masuk ke form_data.username)
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Validasi Akun
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Buat Access Token JWT
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    
    # Kembalikan data token dan role ke client/Swagger UI
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value
    }