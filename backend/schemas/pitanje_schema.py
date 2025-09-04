from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from models.pitanje_model import PitanjeStatus


# ----- BASE -----
class PitanjeBase(BaseModel):   
    sadrzaj: str = Field(min_length=1, max_length=2000)
    status: PitanjeStatus = PitanjeStatus.postavljeno


# ----- CREATE -----
class PitanjeCreate(PitanjeBase):
    pass


# ----- UPDATE -----
class PitanjeUpdate(BaseModel):
    sadrzaj: Optional[str] = None
    status: Optional[PitanjeStatus] = None
    odobravanja_count: Optional[int] = None


# ----- READ -----
class PitanjeRead(PitanjeBase):
    id: int
    predavanje_id: int
    odobravanja_count: int
    created_at: datetime
    updated_at: datetime
    odgovor: Optional[str] = None

    class Config:
        from_attributes = True
