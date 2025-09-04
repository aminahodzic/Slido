from sqlmodel import Session, select
from models.obavijest_model import Obavijest
from schemas.obavijest_schema import ObavijestCreate, ObavijestUpdate
from typing import List, Optional

def create_obavijest(db: Session, obavijest: ObavijestCreate) -> Obavijest:
    db_obavijest = Obavijest(**obavijest.dict())
    db.add(db_obavijest)
    db.commit()
    db.refresh(db_obavijest)
    return db_obavijest

def get_obavijesti(db: Session, offset: int = 0, limit: int = 100) -> List[Obavijest]:
    statement = select(Obavijest).offset(offset).limit(limit)
    return db.exec(statement).all()

def get_obavijest(db: Session, obavijest_id: int) -> Optional[Obavijest]:
    return db.get(Obavijest, obavijest_id)

def update_obavijest(db: Session, db_obavijest: Obavijest, updates: dict) -> Obavijest:
    for key, value in updates.items():
        setattr(db_obavijest, key, value)
    db.add(db_obavijest)
    db.commit()
    db.refresh(db_obavijest)
    return db_obavijest

def delete_obavijest(db: Session, db_obavijest: Obavijest) -> None:
    db.delete(db_obavijest)
    db.commit()
