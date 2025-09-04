from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
from enum import Enum

#from models.predavanje_model import Predavanje

class PitanjeStatus(str, Enum):
    postavljeno = "postavljeno"
    odgovoreno = "odgovoreno"
    skriveno = "skriveno"


class Pitanje(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    predavanje_id: int = Field(foreign_key="predavanje.id", index=True)
    sadrzaj: str = Field(min_length=1, max_length=2000)
    odobravanja_count: int = Field(default=0)
    status: PitanjeStatus = Field(default=PitanjeStatus.postavljeno)
    odgovor: Optional[str] = None 

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    predavanje: Optional["Predavanje"] = Relationship(back_populates="pitanja")
