from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from enum import Enum

class Spol(str, Enum):
    MUSKO = "MUSKO"
    ZENSKO = "ZENSKO"

class Dan(str, Enum):
    PONEDJELJAK = "PONEDJELJAK"
    UTORAK = "UTORAK"
    SRIJEDA = "SRIJEDA"
    CETVRTAK = "ČETVRTAK"
    PETAK = "PETAK"