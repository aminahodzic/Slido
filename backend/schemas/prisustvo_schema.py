from typing import Optional
from pydantic import BaseModel

class PrisustvoCreate(BaseModel):
    status: str
    lekcija_id: int
    publika_id: str

class PrisustvoRead(BaseModel):
    id: int
    status: str
    lekcija_id: int
    publika_id: str

    class Config:
        from_attributes = True

class PrisustvoUpdate(BaseModel):
    status: Optional[str] = None
    lekcija_id: Optional[int] = None
    publika_id: Optional[str] = None

