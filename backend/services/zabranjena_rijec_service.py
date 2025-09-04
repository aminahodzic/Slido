from sqlmodel import Session
from repositories import zabranjena_rijec_repository
from schemas.zabranjena_rijec_schema import ZabranjenaRijecCreate
from models.zabranjena_rijec_model import ZabranjenaRijec

def create_rijec(db: Session, data: ZabranjenaRijecCreate):
    existing = zabranjena_rijec_repository.get_by_rijec(db, data.rijec.lower())
    if existing:
        raise ValueError("Riječ je već zabranjena.")
    return zabranjena_rijec_repository.create_rijec(db, data.rijec.lower())

def get_all_rijeci(db: Session):
    return zabranjena_rijec_repository.get_all_rijeci(db)

def delete_rijec(db: Session, rijec_id: int):
    rijec = zabranjena_rijec_repository.delete_rijec(db, rijec_id)
    if not rijec:
        raise ValueError("Riječ nije pronađena.")
    return rijec

def filtriraj_pitanje(db: Session, sadrzaj: str) -> bool:
    """
    Provjerava da li pitanje sadrži zabranjene riječi.
    Vraća False ako je pronađena zabranjena riječ.
    """
    zabranjene_rijeci = db.query(ZabranjenaRijec).all()
    for rijec in zabranjene_rijeci:
        if rijec.rijec.lower() in sadrzaj.lower():  # Provjera neovisno o velikim/malim slovima
            return False
    return True