from app.database import SessionLocal
from app.models.user import User, UserRole
from app.utils import hash_password
from app.schemas import report 

def create_admin_user(email: str, nama: str, nomor_id: str, password: str):
    db = SessionLocal()
    try:
        # Cek apakah user sudah ada
        user_exists = db.query(User).filter(User.email == email).first()
        if user_exists:
            print(f"Gagal: User dengan email {email} sudah ada.")
            return

        # Buat objek user baru dengan role admin
        new_admin = User(
            email=email,
            nama_lengkap=nama,
            nomor_identitas=nomor_id,
            password_hash=hash_password(password),
            role=UserRole.admin
        )

        db.add(new_admin)
        db.commit()
        print(f"Sukses: Admin {nama} berhasil dibuat!")
    except Exception as e:
        db.rollback()
        print(f"Terjadi kesalahan: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Ganti data di bawah sesuai kebutuhan Anda
    create_admin_user("admin1@gmail.com", "Admin1", "12345678", "admin123")