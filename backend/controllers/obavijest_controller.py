from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Annotated

from database import engine
from schemas.obavijest_schema import ObavijestCreate, ObavijestRead, ObavijestUpdate
from services import obavijest_service
def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]



router = APIRouter()

@router.post("/", response_model=ObavijestRead, status_code=status.HTTP_201_CREATED)
def create_obavijest(obavijest: ObavijestCreate, db: Session = Depends(get_session)):
    return obavijest_service.create_obavijest(db, obavijest)

@router.get("/", response_model=List[ObavijestRead])
def read_obavijesti(offset: int = 0, limit: int = 100, db: Session = Depends(get_session)):
    return obavijest_service.get_obavijesti(db, offset, limit)

@router.get("/{obavijest_id}", response_model=ObavijestRead)
def read_obavijest(obavijest_id: str, db: Session = Depends(get_session)):
    return obavijest_service.get_obavijest(db, obavijest_id)

@router.put("/{obavijest_id}", response_model=ObavijestRead)
def update_obavijest(obavijest_id: str, obavijest: ObavijestUpdate, db: Session = Depends(get_session)):
    return obavijest_service.update_obavijest(db, obavijest_id, obavijest)

@router.delete("/{obavijest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_obavijest(obavijest_id: str, db: Session = Depends(get_session)):
    obavijest_service.delete_obavijest(db, obavijest_id)
