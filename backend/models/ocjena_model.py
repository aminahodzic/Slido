from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Ocjena(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    predavanje_id: int = Field(foreign_key="predavanje.id", index=True)  # Strani ključ za predavanje
    ocjena: float = Field(ge=1, le=5)  # Ocjena mora biti između 1 i 5
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)  # Datum kada je ocjena postavljena
