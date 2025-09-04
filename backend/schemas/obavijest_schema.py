from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class ObavijestCreate(BaseModel):
    naslov: str
    opis: str
    datum: datetime

class ObavijestRead(BaseModel):
    id: int
    naslov: str
    opis: str
    datum: datetime

    class Config:
        from_attributes = True

class ObavijestUpdate(BaseModel):
    naslov: Optional[str] = None
    opis: Optional[str] = None
    datum: Optional[datetime] = None
