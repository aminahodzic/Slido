from sqlmodel import Session, select
from typing import List, Optional
from fastapi import HTTPException, UploadFile
import shutil, os, uuid
from models.predavanje_model import Predavanje
from repositories import predavanje_repository
from schemas.predavanje_schema import PredavanjeCreate, PredavanjeUpdate
from models.zabranjena_rijec_model import ZabranjenaRijec
from email.mime.text import MIMEText
import smtplib


UPLOAD_DIR = "static/covers"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- CRUD wrappers ---
def kreiraj_predavanje(db: Session, data: PredavanjeCreate, predavac_id: int) -> Predavanje:
    # provjera da li kod već postoji
    if predavanje_repository.get_predavanje_by_kod(db, data.kod):
        raise HTTPException(status_code=400, detail="Kod predavanja već postoji")
    return predavanje_repository.create_predavanje(db, data, predavac_id)


def preuzmi_predavanje(db: Session, predavanje_id: int) -> Predavanje:
    predavanje = predavanje_repository.get_predavanje_by_id(db, predavanje_id)
    if not predavanje:
        raise HTTPException(status_code=404, detail="Predavanje nije pronađeno")
    return predavanje


def azuriraj_predavanje(db: Session, predavanje_id: int, data: PredavanjeUpdate) -> Predavanje:
    predavanje = preuzmi_predavanje(db, predavanje_id)
    return predavanje_repository.update_predavanje(db, predavanje, data)


def obrisi_predavanje(db: Session, predavanje_id: int):
    predavanje = preuzmi_predavanje(db, predavanje_id)
    predavanje_repository.delete_predavanje(db, predavanje)


def get_predavanja_by_predavac(
    db: Session, predavac_id: int, offset: int = 0, limit: int = 100
) -> List[Predavanje]:
    """Dohvata predavanja predavača sa paginacijom."""
    # Korištenje offseta i limita, te filtriranje po predavaču
    return db.query(Predavanje).filter(Predavanje.predavac_id == predavac_id).offset(offset).limit(limit).all()


# --- Upload cover slike ---
def upload_cover(db: Session, predavanje_id: int, file: UploadFile) -> str:
    predavanje = preuzmi_predavanje(db, predavanje_id)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generiranje jedinstvenog imena fajla
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Spremanje fajla
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Generisanje URL-a slike
    cover_url = f"/static/covers/{filename}"

    # Pohranjivanje URL-a u bazi podataka
    predavanje.cover_url = cover_url
    db.add(predavanje)
    db.commit()
    db.refresh(predavanje)

    return cover_url  # Vraćanje URL-a umjesto lokalne putanje



# --- Zabranjene riječi ---
def filtriraj_pitanje(db: Session, tekst: str) -> bool:
    zabranjene = db.query(ZabranjenaRijec).filter(ZabranjenaRijec.aktivna == True).all()
    for z in zabranjene:
        if z.rijec.lower() in tekst.lower():
            return False
    return True


# --- Statistika ---
def statistika_predavanja(db: Session, predavanje_id: int) -> dict:
    predavanje = preuzmi_predavanje(db, predavanje_id)
    broj_skrivenih = sum(1 for p in predavanje.pitanja if p.status.value == "skriveno")
    return {
        "predavanje_id": predavanje.id,
        "broj_pitanja_postavljenih": predavanje.broj_pitanja_postavljenih,
        "broj_pitanja_odgovorenih": predavanje.broj_pitanja_odgovorenih,
        "broj_pitanja_skrivenih": broj_skrivenih,
        "top_pitanja": sorted(
            [{"pitanje": p.sadrzaj, "odobravanja": p.odobravanja_count} for p in predavanje.pitanja],
            key=lambda x: x["odobravanja"],
            reverse=True
        )[:5]
    }


# --- Slanje email izvještaja ---
def posalji_email_izvjestaj(predavac_email: str, statistika: dict):
    body = f"Izvještaj predavanja ID {statistika['predavanje_id']}\n"
    body += f"Postavljenih: {statistika['broj_pitanja_postavljenih']}\n"
    body += f"Odgovorenih: {statistika['broj_pitanja_odgovorenih']}\n"
    body += f"Skrivenih: {statistika['broj_pitanja_skrivenih']}\n"
    body += "Top pitanja:\n"
    for t in statistika['top_pitanja']:
        body += f"- {t['pitanje']} ({t['odobravanja']} odobravanja)\n"

    msg = MIMEText(body)
    msg["Subject"] = "Izvještaj predavanja"
    msg["From"] = "noreply@slido-projekat.com"
    msg["To"] = predavac_email

    # SMTP konfiguracija (dummy - treba podesiti)
    with smtplib.SMTP("localhost") as server:
        server.sendmail(msg["From"], [predavac_email], msg.as_string())

    
def get_predavanje_by_kod(db: Session, kod: str) -> Optional[Predavanje]:
    # Koristi SQLAlchemy za dohvat predavanja sa određenim kodom
    statement = select(Predavanje).where(Predavanje.kod == kod)
    return db.exec(statement).first()  # Vraća prvo predavanje koje odgovara kodu
