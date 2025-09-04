from sqlmodel import Session
from fastapi import HTTPException
from models.pitanje_model import Pitanje, PitanjeStatus
from repositories import pitanje_repository
from schemas.pitanje_schema import PitanjeCreate, PitanjeUpdate
from services import predavanje_service
from models.predavanje_model import Predavanje
from typing import List
from services.zabranjena_rijec_service import filtriraj_pitanje
from repositories import pitanje_repository
from repositories.pitanje_repository import get_sva_pitanja_po_predavacu

def kreiraj_pitanje(db: Session, data: PitanjeCreate, predavanje_id: int) -> Pitanje:
    """
    Kreira novo pitanje i automatski postavlja status:
    - 'skriveno' ako sadrži zabranjene riječi
    - 'postavljeno' inače
    Također ažurira broj postavljenih pitanja u predavanju.
    """

    # 1. Provjera zabranjenih riječi
    if not filtriraj_pitanje(db, data.sadrzaj):
        status = PitanjeStatus.skriveno
    else:
        status = PitanjeStatus.postavljeno

    # 2. DEBUG: ispis prije kreiranja pitanja
    print("=== DEBUG: Prije create_pitanje ===")
    print("Sadržaj pitanja:", data.sadrzaj)
    print("Status pitanja:", status)

    # 3. Kreiranje pitanja koristeći repository
    data_dict = data.dict()
    data_dict["status"] = status  # zamjena postojećeg statusa
    pitanje = pitanje_repository.create_pitanje(
        db,
        PitanjeCreate(**data_dict),
        predavanje_id
    )

    # 4. DEBUG: status nakon kreiranja instance
    print("Status pitanja nakon create_pitanje:", pitanje.status)

    # 5. Ažuriranje predavanja
    predavanje = predavanje_service.preuzmi_predavanje(db, predavanje_id)
    predavanje.broj_pitanja_postavljenih += 1

    # DEBUG: broj postavljenih pitanja nakon ažuriranja
    print("Broj postavljenih pitanja u predavanju:", predavanje.broj_pitanja_postavljenih)

    db.add(predavanje)
    db.commit()
    db.refresh(predavanje)

    print("=== Kraj DEBUG ===\n")
    return pitanje





def odgovori_na_pitanje(db: Session, pitanje_id: int) -> Pitanje:
    pitanje = pitanje_repository.get_pitanje_by_id(db, pitanje_id)
    if not pitanje:
        raise HTTPException(status_code=404, detail="Pitanje nije pronađeno")
    pitanje.status = PitanjeStatus.odgovoreno
    predavanje = pitanje.predavanje
    predavanje.broj_pitanja_odgovorenih += 1
    db.add_all([pitanje, predavanje])
    db.commit()
    db.refresh(pitanje)
    return pitanje


def sakrij_pitanje(db: Session, pitanje_id: int) -> Pitanje:
    pitanje = pitanje_repository.get_pitanje_by_id(db, pitanje_id)
    if not pitanje:
        raise HTTPException(status_code=404, detail="Pitanje nije pronađeno")
    pitanje.status = PitanjeStatus.skriveno
    db.add(pitanje)
    db.commit()
    db.refresh(pitanje)
    return pitanje


# Funkcija koja koristi repository za dohvat pitanja vezanih za predavanje prema kodu
def get_pitanja_for_predavanje(db: Session, event_code: str) -> List[Pitanje]:
    # Dohvati predavanje prema kodu
    predavanje = db.query(Predavanje).filter(Predavanje.kod == event_code).first()
    if not predavanje:
        return []  # Ako predavanje nije pronađeno, vraćamo praznu listu
    # Dohvati pitanja vezana za to predavanje
    return pitanje_repository.get_pitanja_by_predavanje_id(db, predavanje.id)

def get_skrivena_pitanja_by_predavanje(db: Session, predavanje_id: int):
    """
    Dohvata samo skrivena pitanja za predavanje.
    """
    return db.query(Pitanje).filter(Pitanje.predavanje_id == predavanje_id, Pitanje.status == PitanjeStatus.skriveno).all()


def like_pitanje(db: Session, pitanje_id: int):
    # Pozivamo repository funkciju koja ažurira broj lajkova
    pitanje = pitanje_repository.like_pitanje(db, pitanje_id)
    if pitanje:
        return pitanje
    else:
        raise Exception("Pitanje nije pronađeno ili nije moguće lajkovati.")
    

def get_vidljiva_pitanja_by_predavanje(db: Session, predavanje_id: int):
    """
    Dohvata pitanja koja publika smije vidjeti (nisu skrivena) 
    i uključuje eventualne odgovore predavača.
    """
    pitanja = db.query(Pitanje).filter(
        Pitanje.predavanje_id == predavanje_id,
        Pitanje.status != PitanjeStatus.skriveno
    ).all()
    return pitanja  # svi objekti već imaju polje 'odgovor'

def get_skrivena(db: Session, predavanje_id: int):
    return pitanje_repository.get_skrivena_pitanja(db, predavanje_id)

def otvori(db: Session, pitanje_id: int):
    return pitanje_repository.otvori_pitanje(db, pitanje_id)

def odgovori(db: Session, pitanje_id: int, odgovor: str):
    return pitanje_repository.odgovori_na_pitanje(db, pitanje_id, odgovor)


def get_odgovori_predavaca(db: Session, predavac_id: int):
    """
    Dohvata sva pitanja koja imaju odgovor i pripadaju predavaču preko predavanja.
    """
    return (
        db.query(Pitanje)
        .join(Predavanje, Pitanje.predavanje_id == Predavanje.id)
        .filter(Predavanje.predavac_id == predavac_id)
        .filter(Pitanje.odgovor.isnot(None))
        .all()
    )


def svi_pitanja_predavaca_service(db: Session, predavac_id: int) -> List[Pitanje]:
    """
    Vraća sva pitanja za datog predavača.
    Sortiranje i filtriranje će frontend raditi po potrebi.
    """
    return get_sva_pitanja_po_predavacu(db, predavac_id)