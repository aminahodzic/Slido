from typing import List, Optional
from sqlmodel import Session, select
from models.pozivnica_gost_model import PozivnicaGost
from schemas.pozivnica_gost_schema import PozivnicaGostCreate
import uuid


def create_pozivnica(db: Session, pozivnica_data: PozivnicaGostCreate, predavanje_id: int) -> PozivnicaGost:
    token = uuid.uuid4().hex
    pozivnica = PozivnicaGost(
        **pozivnica_data.dict(),
        predavanje_id=predavanje_id,
        token=token
    )
    db.add(pozivnica)
    db.commit()
    db.refresh(pozivnica)
    return pozivnica


def get_pozivnica_by_id(db: Session, pozivnica_id: int) -> Optional[PozivnicaGost]:
    return db.get(PozivnicaGost, pozivnica_id)


def get_pozivnice_by_predavanje(db: Session, predavanje_id: int) -> List[PozivnicaGost]:
    statement = select(PozivnicaGost).where(PozivnicaGost.predavanje_id == predavanje_id)
    return db.exec(statement).all()


def delete_pozivnica(db: Session, pozivnica: PozivnicaGost) -> None:
    db.delete(pozivnica)
    db.commit()
