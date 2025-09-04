from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_db
from schemas.pozivnica_gost_schema import PozivnicaGostCreate
from services import pozivnica_gost_service

router = APIRouter(prefix="/pozivnice", tags=["Pozivnice"])

# --- Slanje pozivnice ---
@router.post("/{predavanje_id}")
def posalji_pozivnicu(predavanje_id: int, data: PozivnicaGostCreate, db: Session = Depends(get_db)):
    pozivnica = pozivnica_gost_service.posalji_pozivnicu(db, data, predavanje_id)
    return {"email": pozivnica.email, "token": pozivnica.token}
