from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from database import get_db
from schemas.zabranjena_rijec_schema import ZabranjenaRijecCreate, ZabranjenaRijecRead
from services import zabranjena_rijec_service

router = APIRouter()

@router.post("/", response_model=ZabranjenaRijecRead, status_code=status.HTTP_201_CREATED)
def dodaj_rijec(data: ZabranjenaRijecCreate, db: Session = Depends(get_db)):
    try:
        return zabranjena_rijec_service.create_rijec(db, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/", response_model=list[ZabranjenaRijecRead])
def sve_zabranjene_rijeci(db: Session = Depends(get_db)):
    return zabranjena_rijec_service.get_all_rijeci(db)

@router.delete("/{rijec_id}", response_model=ZabranjenaRijecRead)
def obrisi_rijec(rijec_id: int, db: Session = Depends(get_db)):
    try:
        return zabranjena_rijec_service.delete_rijec(db, rijec_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from database import get_db
from schemas.zabranjena_rijec_schema import ZabranjenaRijecCreate, ZabranjenaRijecRead
from services import zabranjena_rijec_service

router = APIRouter()

@router.post("/", response_model=ZabranjenaRijecRead, status_code=status.HTTP_201_CREATED)
def dodaj_rijec(data: ZabranjenaRijecCreate, db: Session = Depends(get_db)):
    try:
        return zabranjena_rijec_service.create_rijec(db, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/", response_model=list[ZabranjenaRijecRead])
def sve_zabranjene_rijeci(db: Session = Depends(get_db)):
    return zabranjena_rijec_service.get_all_rijeci(db)

@router.delete("/{rijec_id}", response_model=ZabranjenaRijecRead)
def obrisi_rijec(rijec_id: int, db: Session = Depends(get_db)):
    try:
        return zabranjena_rijec_service.delete_rijec(db, rijec_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
