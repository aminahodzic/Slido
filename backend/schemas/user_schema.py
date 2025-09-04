from pydantic import BaseModel, EmailStr
from enum import Enum
from typing import Optional
from models.enum_model import Spol

class RoleEnum(str, Enum):
    predavac = "predavac"
    admin ="admin"


class UserCreate(BaseModel):
  username: str
  password: str
  email: EmailStr
  naziv_ime: str
  adresa: str
  broj: str
  role: RoleEnum
  spol:Spol
  avatar_url: Optional[str] = None 
  
   

class UserRead(BaseModel):
  id: int
  username: str
  email: EmailStr
  naziv_ime: Optional[str] = None
  adresa: Optional[str] = None
  broj: Optional[str] = None
  role: RoleEnum
  spol: Optional[Spol] = None  # Takođe dodaj Optional ako i ovo zna biti None
  avatar_url: Optional[str] = None 

  class Config:
    from_attributes = True
    use_enum_values = True

    
class UserUpdate(BaseModel):
  username: Optional[str] = None
  password: Optional[str] = None
  email: Optional[EmailStr] = None
  naziv_ime: Optional[str] = None
  adresa: Optional[str] = None
  broj: Optional[str] = None
  role: Optional[RoleEnum] = None
  spol: Optional[Spol] = None
  avatar_url: Optional[str] = None 



class UserLogin(BaseModel):
    email: EmailStr
    password: str