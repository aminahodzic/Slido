from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.prisustvo_model import Prisustvo
from schemas.prisustvo_schema import PrisustvoCreate, PrisustvoUpdate
from repositories import prisustvo_repository

def create_prisustvo(db: Session, prisustvo_data: PrisustvoCreate) -> Prisustvo:
    return prisustvo_repository.create_prisustvo(db, prisustvo_data)

def get_prisustva(db: Session, offset: int = 0, limit: int = 100) -> List[Prisustvo]:
    return prisustvo_repository.get_prisustva(db, offset, limit)

def get_prisustvo(db: Session, prisustvo_id: int) -> Prisustvo:
    prisustvo = prisustvo_repository.get_prisustvo(db, prisustvo_id)
    if not prisustvo:
        raise HTTPException(status_code=404, detail="Prisustvo nije pronađeno")
    return prisustvo

def update_prisustvo(db: Session, prisustvo_id: int, prisustvo_data: PrisustvoUpdate) -> Prisustvo:
    db_prisustvo = prisustvo_repository.get_prisustvo(db, prisustvo_id)
    if not db_prisustvo:
        raise HTTPException(status_code=404, detail="Prisustvo nije pronađeno")
    updates = prisustvo_data.dict(exclude_unset=True)
    return prisustvo_repository.update_prisustvo(db, db_prisustvo, updates)

def delete_prisustvo(db: Session, prisustvo_id: int) -> None:
    db_prisustvo = prisustvo_repository.get_prisustvo(db, prisustvo_id)
    if not db_prisustvo:
        raise HTTPException(status_code=404, detail="Prisustvo nije pronađeno")
    prisustvo_repository.delete_prisustvo(db, db_prisustvo)
