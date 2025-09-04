from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class PozivnicaGostBase(BaseModel):
    email: EmailStr


class PozivnicaGostCreate(PozivnicaGostBase):
    pass


class PozivnicaGostRead(PozivnicaGostBase):
    id: int
    predavanje_id: int
    token: str
    poslano_u: datetime
    prihvaceno: bool

    class Config:
        from_attributes = True
        
