from fastapi import HTTPException
from typing import List, Optional
from sqlmodel import Session, select
from models.pitanje_model import Pitanje
from schemas.pitanje_schema import PitanjeCreate, PitanjeUpdate
from models.pitanje_model import PitanjeStatus
from services.zabranjena_rijec_service import filtriraj_pitanje
from models.predavanje_model import Predavanje

def create_pitanje(db: Session, pitanje_data: PitanjeCreate, predavanje_id: int) -> Pitanje:
    """
    Kreira novo pitanje. Status se postavlja u service sloju:
    'skriveno' ako sadrži zabranjene riječi, inače 'postavljeno'.
    """
    # Kreiranje instance Pitanje s postojećim statusom
    pitanje = Pitanje(
        **pitanje_data.dict(),
        predavanje_id=predavanje_id
    )

    db.add(pitanje)
    db.commit()
    db.refresh(pitanje)
    return pitanje

def get_pitanje_by_id(db: Session, pitanje_id: int) -> Optional[Pitanje]:
    return db.get(Pitanje, pitanje_id)


def get_pitanja_by_predavanje(db: Session, predavanje_id: int) -> List[Pitanje]:
    statement = select(Pitanje).where(Pitanje.predavanje_id == predavanje_id)
    return db.exec(statement).all()


def update_pitanje(db: Session, pitanje: Pitanje, update_data: PitanjeUpdate) -> Pitanje:
    update_dict = update_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(pitanje, key, value)
    db.add(pitanje)
    db.commit()
    db.refresh(pitanje)
    return pitanje


def delete_pitanje(db: Session, pitanje: Pitanje) -> None:
    db.delete(pitanje)
    db.commit()


def get_pitanja_by_predavanje_id(db: Session, predavanje_id: int) -> List[Pitanje]:
    return db.query(Pitanje).filter(Pitanje.predavanje_id == predavanje_id).all()


def like_pitanje(db: Session, pitanje_id: int) -> Pitanje:
    pitanje = db.query(Pitanje).filter(Pitanje.id == pitanje_id).first()
    if pitanje:
        pitanje.odobravanja_count += 1  # Povećaj broj lajkova
        db.commit()
        db.refresh(pitanje)  # Ažuriraj instancu pitanja
    return pitanje



def get_skrivena_pitanja(db: Session, predavanje_id: int) -> list[Pitanje]:
    stmt = select(Pitanje).where(
        Pitanje.predavanje_id == predavanje_id,
        Pitanje.status == "skriveno"
    )
    return db.exec(stmt).all()

def otvori_pitanje(db: Session, pitanje_id: int) -> Pitanje:
    pitanje = db.get(Pitanje, pitanje_id)
    print("otvori_pitanje:", pitanje_id, "->", pitanje)
    if not pitanje:
        raise HTTPException(status_code=404, detail="Pitanje nije pronađeno")
    pitanje.status = "postavljeno"
    db.add(pitanje)
    db.commit()
    db.refresh(pitanje)
    return pitanje


def odgovori_na_pitanje(db: Session, pitanje_id: int, odgovor: str) -> Pitanje:
    pitanje = db.get(Pitanje, pitanje_id)
    if not pitanje:
        raise HTTPException(status_code=404, detail="Pitanje nije pronađeno")

    pitanje.odgovor = odgovor
    pitanje.status = "odgovoreno"
    db.add(pitanje)
    db.commit()
    db.refresh(pitanje)
    return pitanje


def get_sva_pitanja_po_predavacu(db: Session, predavac_id: int):
    """
    Vraća sva pitanja koja pripadaju svim predavanjima datog predavača.
    Sortiranje se radi na frontend-u.
    """
    return (
        db.query(Pitanje)
        .join(Predavanje)
        .filter(Predavanje.predavac_id == predavac_id)
        .all()
    )