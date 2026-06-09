from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

# Skema dasar untuk data User
class UserBase(BaseModel):
    email: EmailStr
    nama_lengkap: str
    nomor_identitas: str # NIM atau NIP

# Skema saat user mendaftar (Request Body)
class UserCreate(UserBase):
    password: str

# Skema saat mengembalikan data user (Response Body)
class UserResponse(UserBase):
    id: int
    role: UserRole

    class Config:
        from_attributes = True  # Mengizinkan Pydantic membaca data dari objek ORM SQLAlchemy

# Skema untuk input Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Skema untuk respons Token setelah sukses login
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str