from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Body, File, UploadFile
from sqlmodel import Session, select
from database import get_db
from schemas.user_schema import UserCreate, UserRead, UserUpdate
from schemas.predavanje_schema import PredavanjeCreate
from services import user_service
from services.user_service import get_predavanje_by_id_admin, delete_predavanje_by_admin
import os
import shutil
import uuid
from datetime import date
from security import get_current_user
from models.user_model import User
from models.user_model import RoleEnum
from models.enum_model import Spol



router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

# Statistika za dashboard - mora biti PRIJE dinamičkih ruta
# ---------------------------
@router.get("/stats")
def get_user_stats(session: SessionDep):
    """Vraća broj korisnika, admina i predavača."""
    total_users = session.query(User).count()
    total_admins = session.query(User).filter(User.role == "admin").count()
    total_predavaci = session.query(User).filter(User.role == "predavac").count()
    return {
        "total_users": total_users,
        "total_admins": total_admins,
        "total_predavaci": total_predavaci
    }



@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(session: SessionDep, user_data: UserCreate):
    """Kreira novog korisnika."""
    return UserRead.from_orm(user_service.create_user(session, user_data))


@router.get("/", response_model=list[UserRead])
def list_users(session: SessionDep, offset: int = 0, limit: int = 100):
    """Dohvata listu korisnika sa paginacijom."""
    users = user_service.get_users(session, offset, limit)
    return [UserRead.from_orm(u) for u in users]


@router.get("/na-odobrenju", response_model=list[UserRead])
def get_users_na_odobrenje(session: SessionDep):
    """Dohvata korisnike koji čekaju odobrenje."""
    users = user_service.get_users_na_odobrenje(session)
    return [UserRead.from_orm(u) for u in users]


@router.get("/suspendovani", response_model=list[UserRead])
def get_suspendovani_predavaci(session: SessionDep):
    """Dohvata sve trenutno suspendovane predavače."""
    users = user_service.get_suspendovani_predavaci(session)
    return [UserRead.from_orm(u) for u in users]


@router.post("/dodaj-predavaca", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def dodaj_predavaca(session: SessionDep, user_data: UserCreate = Body(...)):
    """Admin kreira predavača koji je odmah odobren."""
    if user_data.role != "predavac":
        raise HTTPException(status_code=400, detail="Ova ruta služi isključivo za dodavanje predavača.")
    return UserRead.from_orm(user_service.create_predavac_by_admin(session, user_data))


@router.get("/predavaci", response_model=list[UserRead])
def list_predavaci(session: SessionDep):
    """Dohvata sve predavače iz sistema."""
    users = user_service.get_all_predavaci(session)
    return [UserRead.from_orm(u) for u in users]


@router.put("/odobri/{user_id}", response_model=UserRead)
def odobri_korisnika(user_id: int, session: SessionDep):
    """Odobrava korisnika."""
    return UserRead.from_orm(user_service.odobri_user(session, user_id))


@router.put("/suspenduj/{user_id}", response_model=UserRead)
def suspend_user(user_id: int, session: SessionDep, dana: int):
    """Suspenduje predavača na 15 ili 30 dana."""
    if dana not in [15, 30]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dozvoljena suspenzija je samo na 15 ili 30 dana."
        )
    return UserRead.from_orm(user_service.suspend_user(session, user_id, dana))


@router.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Dohvata trenutno prijavljenog korisnika."""
    return UserRead.from_orm(current_user)


@router.get("/{user_id}", response_model=UserRead)
def get_user(session: SessionDep, user_id: int):
    """Dohvata jednog korisnika po ID."""
    user = user_service.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserRead.from_orm(user)


@router.put("/{user_id}", response_model=UserRead)
def update_user(session: SessionDep, user_id: int, user_data: UserUpdate):
    """Ažurira podatke korisnika."""
    return UserRead.from_orm(user_service.update_user(session, user_id, user_data))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, session: SessionDep):
    """Briše korisnika."""
    user_service.delete_user(session, user_id)
    return None

@router.post("/{user_id}/upload-avatar", response_model=UserRead)
def upload_avatar(
    user_id: int,
    session: SessionDep,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Uploaduje avatar — samo prijavljeni korisnik ili admin."""

    # Provera autorizacije
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Nemate ovlasti za promjenu ovog avatara.")

    user = user_service.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Podržani formati su JPEG i PNG")

    upload_dir = "static/avatars"
    os.makedirs(upload_dir, exist_ok=True)

    # Generiraj jedinstveno ime fajla da svaki put bude novo (radi osvježavanja slike u frontend-u)
    ext = os.path.splitext(file.filename)[1]
    filename = f"user_{user_id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Dodaj timestamp u URL da bi frontend mogao da ignorira cache
    avatar_url = f"/static/avatars/{filename}?t={uuid.uuid4().hex}"

    updated_user = user_service.update_user(session, user_id, user_data=UserUpdate(avatar_url=avatar_url))

    return UserRead.from_orm(updated_user)


@router.get("/provjeri-suspendovan/{user_id}")
def provjeri_suspendovan(user_id: int, session: SessionDep):
    """Provjerava da li je korisnik suspendovan."""
    user = user_service.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if user.suspendovan_do and user.suspendovan_do >= date.today():
        raise HTTPException(status_code=403, detail=f"Korisnik je suspendovan do {user.suspendovan_do}")

    return {"status": "OK"}





# Dohvatanje jednog predavanja po ID-u (Admin)
@router.get("/predavanje/{predavanje_id}", response_model=PredavanjeCreate)
def get_predavanje(
    predavanje_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin pregleda jedno predavanje po ID-u."""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nemate ovlasti za pristup predavanju.")
    return get_predavanje_by_id_admin(db, predavanje_id, current_user)

# Brisanje predavanja (Admin)
@router.delete("/predavanje/{predavanje_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_predavanje(
    predavanje_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin briše predavanje po ID-u."""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nemate ovlasti za brisanje predavanja.")
    delete_predavanje_by_admin(db, predavanje_id, current_user)
    return {"detail": "Predavanje je obrisano."}



@router.post("/registracija_publike")
def registracija_publike(email: str, db: Session = Depends(get_db)):
    # Provjera da li publika već postoji
    user = db.exec(select(User).where(User.email == email)).first()
    if not user:
        user = User(
            email=email,
            username=email.split("@")[0],
            role=RoleEnum.user,
            spol=Spol.ZENSKO,      
            hashed_password="",     
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"message": "Publika registrovana", "email": user.email}