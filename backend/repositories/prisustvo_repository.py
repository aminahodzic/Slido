from sqlmodel import Session, select
from models.prisustvo_model import Prisustvo
from schemas.prisustvo_schema import PrisustvoCreate, PrisustvoUpdate
from typing import List, Optional

def create_prisustvo(db: Session, prisustvo: PrisustvoCreate) -> Prisustvo:
    db_prisustvo = Prisustvo(**prisustvo.dict())
    db.add(db_prisustvo)
    db.commit()
    db.refresh(db_prisustvo)
    return db_prisustvo

def get_prisustva(db: Session, offset: int = 0, limit: int = 100) -> List[Prisustvo]:
    statement = select(Prisustvo).offset(offset).limit(limit)
    return db.exec(statement).all()

def get_prisustvo(db: Session, prisustvo_id: int) -> Optional[Prisustvo]:
    return db.get(Prisustvo, prisustvo_id)

def update_prisustvo(db: Session, db_prisustvo: Prisustvo, updates: dict) -> Prisustvo:
    for key, value in updates.items():
        setattr(db_prisustvo, key, value)
    db.add(db_prisustvo)
    db.commit()
    db.refresh(db_prisustvo)
    return db_prisustvo

def delete_prisustvo(db: Session, db_prisustvo: Prisustvo) -> None:
    db.delete(db_prisustvo)
    db.commit()

