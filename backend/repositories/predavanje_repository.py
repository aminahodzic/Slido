from typing import List, Optional
from sqlmodel import Session, select
from models.predavanje_model import Predavanje
from schemas.predavanje_schema import PredavanjeCreate, PredavanjeUpdate


def create_predavanje(db: Session, predavanje_data: PredavanjeCreate, predavac_id: int) -> Predavanje:
    predavanje = Predavanje(**predavanje_data.dict(), predavac_id=predavac_id)
    db.add(predavanje)
    db.commit()
    db.refresh(predavanje)
    return predavanje


def get_predavanje_by_id(db: Session, predavanje_id: int) -> Optional[Predavanje]:
    return db.get(Predavanje, predavanje_id)


def get_predavanje_by_kod(db: Session, kod: str) -> Optional[Predavanje]:
    statement = select(Predavanje).where(Predavanje.kod == kod)
    return db.exec(statement).first()

def get_predavanja_by_user_id(db: Session, user_id: int) -> List[Predavanje]:
    # Dohvat svih predavanja za određenog predavača
    return db.query(Predavanje).filter(Predavanje.predavac_id == user_id).all()

def update_predavanje(db: Session, predavanje: Predavanje, update_data: PredavanjeUpdate) -> Predavanje:
    update_dict = update_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(predavanje, key, value)
    db.add(predavanje)
    db.commit()
    db.refresh(predavanje)
    return predavanje


def delete_predavanje(db: Session, predavanje: Predavanje) -> None:
    db.delete(predavanje)
    db.commit()


def sort_predavanja(db: Session, predavac_id: int, sort_by: str) -> List[Predavanje]:
    if sort_by == "datum":
        statement = select(Predavanje).where(Predavanje.predavac_id == predavac_id).order_by(Predavanje.vrijeme_start)
    elif sort_by == "odobravanja":
        statement = select(Predavanje).where(Predavanje.predavac_id == predavac_id).order_by(Predavanje.broj_pitanja_postavljenih.desc())
    else:
        statement = select(Predavanje).where(Predavanje.predavac_id == predavac_id)
    return db.exec(statement).all()


