from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.utils import verify_password, create_access_token, hash_password
from app.deps import get_current_admin, get_current_user # Import dependencies
# Pastikan skema user di-import untuk proses registrasi
from app.schemas.user import UserCreate, UserResponse, UserRole, ChangePassword

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ==========================================
# 1. ENDPOINT REGISTRASI (MAHASISWA & ADMIN)
# ==========================================
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Validasi apakah email sudah digunakan
    user_exists = db.query(User).filter(User.email == user_in.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Gagal: Email ini sudah digunakan. Gunakan email lain.")
        
    # Validasi apakah NIM/NIP sudah digunakan
    identity_exists = db.query(User).filter(User.nomor_identitas == user_in.nomor_identitas).first()
    if identity_exists:
        raise HTTPException(status_code=400, detail="Gagal: NIM/NIP ini sudah terdaftar.")

    # Paksa role menjadi mahasiswa untuk registrasi publik
    role_user = UserRole.mahasiswa

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
        "role": user.role.value,
        "user": {
            "id": user.id,
            "email": user.email,
            "nama_lengkap": user.nama_lengkap,
            "nomor_identitas": user.nomor_identitas,
            "role": user.role.value
        }
    }


# ==========================================
# 3. ENDPOINT DEBUGGING: LIHAT SEMUA USER (ADMIN ONLY)
# ==========================================
@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_admin)):
    return db.query(User).all()

# ==========================================
# 4. ENDPOINT GANTI KATA SANDI
# ==========================================
@router.put("/change-password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi lama tidak sesuai."
        )
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"detail": "Kata sandi berhasil diperbarui."}

# ==========================================
# 5. ENDPOINT PROFIL USER SAAT INI (/me)
# ==========================================
@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user