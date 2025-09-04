from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
#from models.predavanje_model import Predavanje

class PozivnicaGost(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    token: str

    predavanje_id: int = Field(foreign_key="predavanje.id")
    predavanje: Optional["Predavanje"] = Relationship(back_populates="pozivnice")
