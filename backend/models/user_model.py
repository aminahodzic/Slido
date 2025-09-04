from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import date
from enum import Enum
from models.enum_model import Spol  # tvoj enum Spol
#from models.predavanje_model import Predavanje
#from models.prisustvo_model import Prisustvo

class RoleEnum(str, Enum):
    predavac = "predavac"
    admin = "admin"
    user = "user"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    naziv_ime: Optional[str] = None
    adresa: Optional[str] = None
    broj: Optional[str] = None
    spol: Spol
    role: RoleEnum = Field(default=RoleEnum.user, sa_column_kwargs={"nullable": False})
    odobren: bool = Field(default=True)
    suspendovan_do: Optional[date] = None
    avatar_url: Optional[str] = Field(default=None, nullable=True)

    # Relations
    predavanja: List["Predavanje"] = Relationship(back_populates="predavac")
    prisustva: List["Prisustvo"] = Relationship(back_populates="user")
