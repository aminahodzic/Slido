from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from database import get_db
from schemas.pitanje_schema import PitanjeCreate, PitanjeRead
from services import pitanje_service
from services.pitanje_service import like_pitanje
from services.pitanje_service import get_skrivena_pitanja_by_predavanje
from services.pitanje_service import get_odgovori_predavaca
from services.pitanje_service import get_sva_pitanja_po_predavacu
from models.pitanje_model import Pitanje


router = APIRouter()

# --- Kreiranje pitanja ---
@router.post("/{predavanje_id}", response_model=PitanjeRead)
def kreiraj_pitanje(predavanje_id: int, data: PitanjeCreate, db: Session = Depends(get_db)):
    return pitanje_service.kreiraj_pitanje(db, data, predavanje_id)

# --- Odgovori na pitanje ---
@router.put("/odgovori/{pitanje_id}", response_model=PitanjeRead)
def odgovori_pitanje(pitanje_id: int, db: Session = Depends(get_db)):
    return pitanje_service.odgovori_na_pitanje(db, pitanje_id)

@router.get("/skrivena/{predavanje_id}", response_model=List[PitanjeRead])
def get_skrivena_pitanja(
    predavanje_id: int, 
    db: Session = Depends(get_db)
):
    return pitanje_service.get_skrivena_pitanja_by_predavanje(db, predavanje_id)

@router.get("/predavanje/{event_code}/pitanja", response_model=List[PitanjeRead])
def get_pitanja_for_predavanje(event_code: str, db: Session = Depends(get_db)):
    # Pozivamo servis koji koristi event_code za dohvatanje pitanja za predavanje
    pitanja = pitanje_service.get_pitanja_for_predavanje(db, event_code)
    
    if not pitanja:
        raise HTTPException(status_code=404, detail="Nema pitanja za ovo predavanje")
    
    return pitanja

@router.post("/pitanje/{pitanje_id}/lajk")
def like_pitanje_route(pitanje_id: int, db: Session = Depends(get_db)):
    try:
        pitanje = like_pitanje(db, pitanje_id)
        return {"id": pitanje.id, "odobravanja_count": pitanje.odobravanja_count}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/public/{predavanje_id}", response_model=List[PitanjeRead])
def get_pitanja_za_publicu(predavanje_id: int, db: Session = Depends(get_db)):
    """
    Dohvata pitanja koja publika smije vidjeti (ne uključuje skrivena pitanja).
    """
    return pitanje_service.get_vidljiva_pitanja_by_predavanje(db, predavanje_id)


# Dohvati skrivena pitanja za predavanje
@router.get("/skrivena/{predavanje_id}", response_model=List[PitanjeRead])
def skrivena_pitanja(predavanje_id: int, db: Session = Depends(get_db)):
    return pitanje_service.get_skrivena(db, predavanje_id)

# Otvori pitanje
@router.post("/otvori/{pitanje_id}", response_model=PitanjeRead)
def otvori_pitanje(pitanje_id: int, db: Session = Depends(get_db)):
    return pitanje_service.otvori(db, pitanje_id)

# Odgovori na pitanje
@router.post("/odgovori/{pitanje_id}/{odgovor}", response_model=PitanjeRead)
def odgovori_na_pitanje(pitanje_id: int, odgovor: str, db: Session = Depends(get_db)):
    return pitanje_service.odgovori(db, pitanje_id, odgovor)


@router.get("/odgovori/predavac/{predavac_id}", response_model=List[PitanjeRead])
def svi_odgovori_predavaca(predavac_id: int, db: Session = Depends(get_db)):
    """
    Vraća sva pitanja sa odgovorima koja pripadaju datom predavaču.
    """
    return get_odgovori_predavaca(db, predavac_id)


@router.get("/sva-pitanja/predavac/{predavac_id}", response_model=List[PitanjeRead])
def svi_pitanja_predavaca(predavac_id: int, db: Session = Depends(get_db)):
    """
    Vraća sva pitanja predavača. Frontend može vršiti sortiranje po vremenu ili broju odobravanja.
    """
    return get_sva_pitanja_po_predavacu(db, predavac_id)




@router.get("/{predavanje_id}/statistika")
def statistika_predavanja(predavanje_id: int, db: Session = Depends(get_db)):
    ukupno_postavljena = db.query(Pitanje).filter(
        Pitanje.predavanje_id == predavanje_id,
        Pitanje.status == "postavljeno"
    ).count()

    ukupno_odgovorena = db.query(Pitanje).filter(
        Pitanje.predavanje_id == predavanje_id,
        Pitanje.status == "odgovoreno"
    ).count()

    return {
        "postavljena": ukupno_postavljena,
        "odgovorena": ukupno_odgovorena
    }



@router.delete("/pitanja/{pitanje_id}")
def delete_pitanje(pitanje_id: int, db: Session = Depends(get_db)):
    pitanje = db.exec(select(Pitanje).where(Pitanje.id == pitanje_id)).first()
    if not pitanje:
        raise HTTPException(status_code=404, detail="Pitanje nije pronađeno")
    
    db.delete(pitanje)
    db.commit()
    return {"detail": "Pitanje obrisano"}


<<<<<<< HEAD
@router.put("/sakrij/{pitanje_id}")
=======
@router.patch("/sakrij/{pitanje_id}")
>>>>>>> 2a45368ea6046c4a66b77bcd2e8bd76ae5f45fb1
def sakrij_pitanje(pitanje_id: int, db: Session = Depends(get_db)):
    pitanje = db.get(Pitanje, pitanje_id)
    if not pitanje:
        raise HTTPException(status_code=404, detail="Pitanje nije pronađeno")
    
    # postavi status na 'skriveno'
    pitanje.status = "skriveno"
    db.add(pitanje)
    db.commit()
    db.refresh(pitanje)
    
    return {"message": "Pitanje sakriveno", "pitanje": pitanje}