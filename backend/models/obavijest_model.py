from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime


class Obavijest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    naslov: str
    opis: str
    datum: datetime
  
