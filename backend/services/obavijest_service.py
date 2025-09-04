from fastapi import HTTPException
from sqlmodel import Session
from typing import List
from models.obavijest_model import Obavijest
from schemas.obavijest_schema import ObavijestCreate, ObavijestUpdate
from repositories import obavijest_repository

def create_obavijest(db: Session, obavijest_data: ObavijestCreate) -> Obavijest:
    return obavijest_repository.create_obavijest(db, obavijest_data)

def get_obavijesti(db: Session, offset: int = 0, limit: int = 100) -> List[Obavijest]:
    return obavijest_repository.get_obavijesti(db, offset, limit)

def get_obavijest(db: Session, obavijest_id: int) -> Obavijest:
    obavijest = obavijest_repository.get_obavijest(db, obavijest_id)
    if not obavijest:
        raise HTTPException(status_code=404, detail="Obavijest nije pronađena")
    return obavijest

def update_obavijest(db: Session, obavijest_id: int, obavijest_data: ObavijestUpdate) -> Obavijest:
    db_obavijest = obavijest_repository.get_obavijest(db, obavijest_id)
    if not db_obavijest:
        raise HTTPException(status_code=404, detail="Obavijest nije pronađena")
    updates = obavijest_data.dict(exclude_unset=True)
    return obavijest_repository.update_obavijest(db, db_obavijest, updates)

def delete_obavijest(db: Session, obavijest_id: int) -> None:
    db_obavijest = obavijest_repository.get_obavijest(db, obavijest_id)
    if not db_obavijest:
        raise HTTPException(status_code=404, detail="Obavijest nije pronađena")
    obavijest_repository.delete_obavijest(db, db_obavijest)

