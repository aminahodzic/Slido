from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlmodel import Session, select
from typing import List
from database import get_db
from security import get_current_user
from schemas.predavanje_schema import PredavanjeCreate, PredavanjeRead, PredavanjeUpdate
from services import predavanje_service
from models.predavanje_model import Predavanje
from models.predavanje_model import PredavanjeStatus
from models.user_model import User
from models.user_model import RoleEnum
from email.mime.text import MIMEText


router = APIRouter()

# --- Kreiranje predavanja ---
@router.post("/", response_model=PredavanjeRead)
def kreiraj_predavanje(
    data: PredavanjeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
 try:
    return predavanje_service.kreiraj_predavanje(db, data, current_user.id)
 except Exception as e:
    print(f"Error creating lecture: {e}")
    raise HTTPException(status_code=500, detail="Internal Server Error")


# --- Dohvat jednog predavanja po ID ---
@router.get("/{predavanje_id}", response_model=PredavanjeRead)
def dohvati_predavanje(predavanje_id: int, db: Session = Depends(get_db)):
    return predavanje_service.preuzmi_predavanje(db, predavanje_id)


# --- Update predavanja ---
@router.put("/{predavanje_id}", response_model=PredavanjeRead)
def azuriraj_predavanje(predavanje_id: int, data: PredavanjeUpdate, db: Session = Depends(get_db)):
    return predavanje_service.azuriraj_predavanje(db, predavanje_id, data)

# --- Brisanje predavanja ---
@router.delete("/{predavanje_id}")
def obrisi_predavanje(predavanje_id: int, db: Session = Depends(get_db)):
    predavanje_service.obrisi_predavanje(db, predavanje_id)
    return {"detail": "Predavanje obrisano"}

# --- Upload cover slike ---
@router.post("/{predavanje_id}/cover")
def upload_cover(predavanje_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    filepath = predavanje_service.upload_cover(db, predavanje_id, file)
    return {"cover_url": filepath}


@router.get("/public", response_model=List[PredavanjeRead])
def lista_predavanja_public(db: Session = Depends(get_db)):
    # Dohvati sve predavanja koja su aktivna i dostupna za javnost
    return db.query(Predavanje).filter(Predavanje.status == PredavanjeStatus.aktivno).all()

@router.get("/", response_model=list[PredavanjeRead])
def list_predavanja(
    db: Session = Depends(get_db),
    offset: int = 0,  # Parametar za offset
    limit: int = 100,  # Parametar za limit
    current_user = Depends(get_current_user)  # Ovdje uzimamo trenutnog korisnika kao predavača
):
    """Dohvata listu predavanja predavača sa paginacijom."""
    # Dohvati predavanja za trenutnog predavača
    predavanja = predavanje_service.get_predavanja_by_predavac(
        db, current_user.id, offset, limit
    )
    
    # Vraća listu predavanja koristeći ORM model (koristi PredavanjeRead schema)
    return [PredavanjeRead.from_orm(p) for p in predavanja]


@router.get("/by-code/{event_code}", response_model=Predavanje)
def dohvati_predavanje_po_kodu(event_code: str, db: Session = Depends(get_db)):
    # Pozivamo servis koji traži predavanje po kodu
    predavanje = predavanje_service.get_predavanje_by_kod(db, event_code)
    
    if not predavanje:
        raise HTTPException(status_code=404, detail="Predavanje s ovim kodom nije pronađeno")
    
    return predavanje




@router.post("/{predavanje_id}/posalji_svima")
def posalji_svima(predavanje_id: int, db: Session = Depends(get_db)):
    # Učitaj predavanje
    predavanje = db.exec(select(Predavanje).where(Predavanje.id == predavanje_id)).first()
    if not predavanje:
        raise HTTPException(status_code=404, detail="Predavanje nije pronađeno")

    kod = predavanje.kod

    # Dohvati sve publike (role=user)
    publika = db.exec(select(User).where(User.role == RoleEnum.user)).all()
    if not publika:
        return {"message": "Nema registrovane publike."}

    # Slanje mejlova
    neuspesni = []
    for user in publika:
        try:
            poruka = MIMEText(f"Pozvani ste na predavanje!\nKod za pristup: {kod}")
            poruka["Subject"] = f"Pozivnica za predavanje {predavanje.naziv}"
            poruka["From"] = "tvojtestemail@gmail.com"  # testni Gmail
            poruka["To"] = user.email

            # PRAVI SMTP server
            # Ako samo testiraš, možeš koristiti localhost ili print
            # Za stvarno slanje, koristi Gmail app password
            # with smtplib.SMTP("smtp.gmail.com", 587) as server:
            #     server.starttls()
            #     server.login("tvojtestemail@gmail.com", "app_password")
            #     server.sendmail(poruka["From"], [poruka["To"]], poruka.as_string())

            # Za test samo ispiši:
            print(f"Mejl poslan: {user.email} -> Kod: {kod}")

        except Exception:
            neuspesni.append(user.email)

    return {
        "message": f"Pozivnice poslane svima. Neuspešni: {neuspesni}" if neuspesni else "Pozivnice poslane svima."
    }

