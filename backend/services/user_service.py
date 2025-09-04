import os
import shutil
from datetime import datetime, timedelta
from fastapi import UploadFile, HTTPException, status
from sqlmodel import Session, select
from schemas.user_schema import UserCreate, UserUpdate
from schemas.predavanje_schema import PredavanjeRead
from models.user_model import User
from models.predavanje_model import Predavanje
from repositories import user_repository
from repositories.predavanje_repository import get_predavanje_by_id,delete_predavanje

from repositories.user_repository import get_user_by_email
from security import verify_password, create_access_token, get_password_hash


UPLOAD_DIR = "static/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --------------------
# REGISTRACIJA I LOGIN
# --------------------

def register_user(db: Session, user: UserCreate):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["odobren"] = user.role == "user"
    
    new_user = User(**user_dict)
    return user_repository.create_user(db, new_user)


def login_user(db: Session, email: str, password: str):
    db_user = get_user_by_email(db, email=email)
    if not db_user or not verify_password(password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Provjera suspenzije
    if db_user.suspendovan_do and db_user.suspendovan_do > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Vaš nalog je suspendovan do {db_user.suspendovan_do.strftime('%Y-%m-%d %H:%M:%S')}."
        )

    # Provjera odobrenja
    if not db_user.odobren:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vaš nalog još nije odobren od strane administratora."
        )

    return create_access_token(data={"sub": db_user.email, "role": db_user.role})


# --------------------
# CRUD ZA KORISNIKE
# --------------------

def create_user(session: Session, user_data: UserCreate) -> User:
    user_dict = user_data.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user = User(**user_dict)
    return user_repository.create_user(session, user)


def get_users(session: Session, offset: int, limit: int) -> list[User]:
    return user_repository.get_users(session, offset, limit)


def get_user(session: Session, user_id: int) -> User:
    user = user_repository.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def update_user(session: Session, user_id: int, user_data: UserUpdate) -> User:
    db_user = user_repository.get_user(session, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = user_data.dict(exclude_unset=True)
    if "password" in updates:
        updates["hashed_password"] = get_password_hash(updates.pop("password"))
    return user_repository.update_user(session, db_user, updates)


def delete_user(session: Session, user_id: int) -> None:
    db_user = user_repository.get_user(session, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    user_repository.delete_user(session, db_user)


# --------------------
# ADMIN FUNKCIJE
# --------------------

def get_users_na_odobrenje(session: Session) -> list[User]:
    statement = select(User).where(User.odobren == False, User.role != "user")
    return session.exec(statement).all()


def odobri_user(session: Session, user_id: int) -> User:
    user = user_repository.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "user":
        raise HTTPException(status_code=400, detail="Obični korisnik ne zahtijeva odobrenje")
    return user_repository.update_user(session, user, {"odobren": True})


def suspend_user(session: Session, user_id: int, dana: int) -> User:
    if dana not in [15, 30]:
        raise HTTPException(status_code=400, detail="Dozvoljena suspenzija je samo na 15 ili 30 dana.")

    user = user_repository.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    if user.role != "predavac":
        raise HTTPException(status_code=400, detail="Samo predavači mogu biti suspendovani")

    suspend_until = datetime.utcnow() + timedelta(days=dana)
    return user_repository.update_user(session, user, {"suspendovan_do": suspend_until})


def create_predavac_by_admin(session: Session, user_data: UserCreate) -> User:
    if user_data.role != "predavac":
        raise HTTPException(status_code=400, detail="Role mora biti 'predavac'")

    user_dict = user_data.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["odobren"] = True  # admin kreira → odmah odobren
    user = User(**user_dict)
    return user_repository.create_user(session, user)


def get_all_predavaci(session: Session) -> list[User]:
    statement = select(User).where(User.role == "predavac")
    return session.exec(statement).all()


def get_suspendovani_predavaci(session: Session) -> list[User]:
    """Vraća sve predavače koji su trenutno suspendovani."""
    statement = select(User).where(
        User.role == "predavac",
        User.suspendovan_do != None,
        User.suspendovan_do > datetime.utcnow()
    )
    return session.exec(statement).all()


# --------------------
# PROVJERE
# --------------------

def provjeri_suspenziju_predavaca(user: User):
    """Baca grešku ako je predavač trenutno suspendovan."""
    if user.role == "predavac" and user.suspendovan_do and user.suspendovan_do > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Ne možete postaviti predavanje jer ste suspendovani do {user.suspendovan_do.strftime('%Y-%m-%d %H:%M:%S')}."
        )


# --------------------
# UPLOAD AVATAR
# --------------------

def upload_avatar(session: Session, user_id: int, file: UploadFile) -> User:
    user = user_repository.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Podržani formati su JPEG i PNG")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    filename = f"user_{user_id}{os.path.splitext(file.filename)[1]}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    avatar_url = f"/static/avatars/{filename}"
    updated_user = user_repository.update_user(session, user, {"avatar_url": avatar_url})

    return updated_user

# --------------------
# PROVJERE
# --------------------

def provjeri_suspenziju_predavaca(user: User):
    """Baca grešku ako je predavač trenutno suspendovan."""
    if user.role == "predavac" and user.suspendovan_do and user.suspendovan_do > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Ne možete postaviti predavanje jer ste suspendovani do {user.suspendovan_do.strftime('%Y-%m-%d %H:%M:%S')}."
        )

def update_user_avatar(db: Session, user_id: int, avatar_url: str):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.avatar_url = avatar_url
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_stats(session: Session) -> dict:
    total_users = session.query(User).count()
    total_admins = session.query(User).filter(User.role == "admin").count()
    total_predavaci = session.query(User).filter(User.role == "predavac").count()
    return {
        "total_users": total_users,
        "total_admins": total_admins,
        "total_predavaci": total_predavaci,
    }



# Funkcija za dohvatanje jednog predavanja po ID-u (samo admin)
def get_predavanje_by_id_admin(session: Session, predavanje_id: int, user: User) -> Predavanje:
    """Admin vidi jedno predavanje po ID-u."""
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nemate ovlasti za pristup predavanju.")
    
    predavanje = get_predavanje_by_id(session, predavanje_id)
    if not predavanje:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Predavanje nije pronađeno.")
    
    return predavanje

# Funkcija za brisanje predavanja (samo admin)
def delete_predavanje_by_admin(session: Session, predavanje_id: int, user: User) -> None:
    """Admin briše predavanje po ID-u."""
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nemate ovlasti za brisanje predavanja.")
    
    predavanje = get_predavanje_by_id(session, predavanje_id)
    if not predavanje:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Predavanje nije pronađeno.")
    
    delete_predavanje(session, predavanje)
