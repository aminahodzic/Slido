from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime, date
from enum import Enum

#from models.user_model import User
#from models.pitanje_model import Pitanje
#from models.pozivnica_gost_model import PozivnicaGost
#from models.prisustvo_model import Prisustvo

class PredavanjeStatus(str, Enum):
    aktivno = "aktivno"
    zavrseno = "zavrseno"


class PonavljanjeFrekvencija(str, Enum):
    nista = "nista"
    sedmicno = "sedmicno"


class Predavanje(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    kod: str = Field(index=True, unique=True, min_length=4, max_length=16, description="Jedinstveni kod pristupa")
    naziv: str = Field(min_length=1, max_length=200)
    vrijeme_start: datetime
    ponavljanje: PonavljanjeFrekvencija = Field(default=PonavljanjeFrekvencija.nista)
    ponavlja_do: Optional[date] = None
    cover_url: Optional[str] = None
    status: PredavanjeStatus = Field(default=PredavanjeStatus.aktivno)
    


    # FK na predavača
    predavac_id: int = Field(foreign_key="user.id", index=True)

    # Agregacije
    broj_pitanja_postavljenih: int = Field(default=0)
    broj_pitanja_odgovorenih: int = Field(default=0)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relations
    predavac: Optional["User"] = Relationship(back_populates="predavanja")
    pitanja: List["Pitanje"] = Relationship(back_populates="predavanje")
    pozivnice: List["PozivnicaGost"] = Relationship(back_populates="predavanje")
    prisustva: List["Prisustvo"] = Relationship(back_populates="predavanje")

