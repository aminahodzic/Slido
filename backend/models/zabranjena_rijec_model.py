from sqlmodel import SQLModel, Field
from typing import Optional

class ZabranjenaRijec(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rijec: str = Field(index=True, unique=True)
    
