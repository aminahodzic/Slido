from pydantic import BaseModel

class ZabranjenaRijecCreate(BaseModel):
    rijec: str

class ZabranjenaRijecRead(BaseModel):
    id: int
    rijec: str

    class Config:
        from_attributes = True
