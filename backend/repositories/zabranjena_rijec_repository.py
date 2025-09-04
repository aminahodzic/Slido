from sqlmodel import Session, select
from models.zabranjena_rijec_model import ZabranjenaRijec


def create_rijec(db: Session, rijec: str) -> ZabranjenaRijec:
    nova = ZabranjenaRijec(rijec=rijec)
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

def get_all_rijeci(db: Session):
    return db.exec(select(ZabranjenaRijec)).all()

def get_by_rijec(db: Session, rijec: str):
    return db.exec(select(ZabranjenaRijec).where(ZabranjenaRijec.rijec == rijec)).first()

def delete_rijec(db: Session, rijec_id: int):
    rijec = db.get(ZabranjenaRijec, rijec_id)
    if rijec:
        db.delete(rijec)
        db.commit()
    return rijec
