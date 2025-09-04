from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Annotated

from database import engine
from schemas.prisustvo_schema import PrisustvoCreate, PrisustvoRead, PrisustvoUpdate
from services import prisustvo_service
def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]


router = APIRouter()

@router.post("/", response_model=PrisustvoRead, status_code=status.HTTP_201_CREATED)
def create_prisustvo(prisustvo: PrisustvoCreate, db: Session = Depends(get_session)):
    return prisustvo_service.create_prisustvo(db, prisustvo)

@router.get("/", response_model=List[PrisustvoRead])
def read_prisustva(offset: int = 0, limit: int = 100, db: Session = Depends(get_session)):
    return prisustvo_service.get_prisustva(db, offset, limit)

@router.get("/{prisustvo_id}", response_model=PrisustvoRead)
def read_prisustvo(prisustvo_id: int, db: Session = Depends(get_session)):
    return prisustvo_service.get_prisustvo(db, prisustvo_id)

@router.put("/{prisustvo_id}", response_model=PrisustvoRead)
def update_prisustvo(prisustvo_id: int, prisustvo: PrisustvoUpdate, db: Session = Depends(get_session)):
    return prisustvo_service.update_prisustvo(db, prisustvo_id, prisustvo)

@router.delete("/{prisustvo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prisustvo(prisustvo_id: int, db: Session = Depends(get_session)):
    prisustvo_service.delete_prisustvo(db, prisustvo_id)
