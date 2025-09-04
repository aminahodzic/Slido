from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

#from models.predavanje_model import Predavanje
#from models.user_model import User

class Prisustvo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: str  # npr. "prisutan", "odsutan", itd.

    predavanje_id: int = Field(foreign_key="predavanje.id")
    user_id: int = Field(foreign_key="user.id")

    predavanje: Optional["Predavanje"] = Relationship(back_populates="prisustva")
    user: Optional["User"] = Relationship(back_populates="prisustva")
