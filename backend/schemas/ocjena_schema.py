from pydantic import BaseModel

class OcjenaBase(BaseModel):
    ocjena: float
    predavanje_id: int

class OcjenaCreate(OcjenaBase):
    pass  # Za kreiranje ocjene, koristi osnovnu schema

class OcjenaRead(OcjenaBase):
    id: int
    created_at: str  # Datum kada je ocjena postavljena

    class Config:
        from_attributes = True
