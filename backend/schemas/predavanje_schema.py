from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, Field
from models.predavanje_model import PredavanjeStatus, PonavljanjeFrekvencija
from schemas.user_schema import UserRead 


# ----- BASE -----
class PredavanjeBase(BaseModel):
    kod: str = Field(index=True, unique=True, min_length=4, max_length=16, description="Jedinstveni kod pristupa")
    naziv: str = Field(min_length=1, max_length=200)
    vrijeme_start: datetime
    ponavljanje: PonavljanjeFrekvencija = PonavljanjeFrekvencija.nista
    ponavlja_do: Optional[date] = None
    cover_url: Optional[str] = None
    status: PredavanjeStatus = PredavanjeStatus.aktivno


# ----- CREATE -----
class PredavanjeCreate(PredavanjeBase):
    pass  # sve polja iz Base-a


# ----- UPDATE -----
class PredavanjeUpdate(BaseModel):
    naziv: Optional[str] = None
    vrijeme_start: Optional[datetime] = None
    ponavljanje: Optional[PonavljanjeFrekvencija] = None
    ponavlja_do: Optional[date] = None
    cover_url: Optional[str] = None
    status: Optional[PredavanjeStatus] = None


# ----- READ -----
class PredavanjeRead(PredavanjeBase):
    id: int
    predavac_id: int
    broj_pitanja_postavljenih: int
    broj_pitanja_odgovorenih: int
    created_at: datetime
    updated_at: datetime
    predavac: Optional[UserRead] = None

    class Config:
        from_attributes = True


# ----- STATISTIKA -----
class PredavanjeStatistika(BaseModel):
    predavanje_id: int
    broj_pitanja_postavljenih: int
    broj_pitanja_odgovorenih: int
    broj_pitanja_skrivenih: int
    top_pitanja: Optional[List[dict]] = None  # npr. [{"pitanje": "...", "odobravanja": 5}]

    class Config:
         from_attributes = True
