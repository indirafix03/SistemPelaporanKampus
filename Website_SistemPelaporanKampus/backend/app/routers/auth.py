from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.utils import hash_password, verify_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# 1. Endpoint Registrasi Akun Baru
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Periksa apakah email sudah terdaftar
    user_exists = db.query(User).filter(User.email == user_in.email).first()
    if user_exists:
        raise HTTPException(
            status_code=400,
            detail="Email sudah terdaftar dalam sistem."
        )
        
    # Periksa apakah NIM/NIP sudah terdaftar
    identity_exists = db.query(User).filter(User.nomor_identitas == user_in.nomor_identitas).first()
    if identity_exists:
        raise HTTPException(
            status_code=400,
            detail="NIM atau NIP sudah terdaftar."
        )

    # Tentukan Role Otomatis (opsional: jika email mengandung 'admin' diberi role admin)
    role_user = UserRole.mahasiswa
    if "admin" in user_in.email.lower():
        role_user = UserRole.admin

    # Simpan ke database
    new_user = User(
        email=user_in.email,
        nama_lengkap=user_in.nama_lengkap,
        nomor_identitas=user_in.nomor_identitas,
        password_hash=hash_password(user_in.password),
        role=role_user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 2. Endpoint Login (Menghasilkan Token JWT)
@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Cari user berdasarkan email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email atau password salah."
        )

    # Verifikasi password
    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email atau password salah."
        )

    # Buat token akses dengan membawa data ID dan Role
    access_token = create_access_token(
        data={"user_id": user.id, "role": user.role.value}
    )

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role.value
    }