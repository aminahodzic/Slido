import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status, Request
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlmodel import Session

from database import get_db
from models.user_model import User

# --- Konfiguracija ---
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")  # U produkciji koristi pravi secret iz env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Pydantic modeli za tokene ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: str  # email ili korisnički ID iz tokena
    role: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
# --- Password hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    print("[DEBUG] Hashiram password")
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    result = pwd_context.verify(plain_password, hashed_password)
    print(f"[DEBUG] Provjera passworda: {result}")
    return result

# --- JWT token funkcije ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    print(f"[DEBUG] Pravi token sa payloadom: {to_encode}")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"[DEBUG] Kreirani token: {encoded_jwt}")
    return encoded_jwt

def decode_access_token(token: str) -> TokenData:
    try:
        print(f"[DEBUG] Dekodiram token: {token}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"[DEBUG] Payload tokena: {payload}")
        sub: str = payload.get("sub")
        role: str = payload.get("role")
        print(f"[DEBUG] Payload tokena: sub={sub}, role={role}")
        if sub is None or role is None:
            print("[ERROR] Nedostaju podaci u tokenu")
            raise JWTError("Missing claims in token")
        return TokenData(sub=sub, role=role)
    except JWTError as e:
        print(f"[ERROR] JWT error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- Helper za izvlačenje tokena iz Authorization headera ---
async def get_token_from_header(request: Request) -> str:
    auth: str = request.headers.get("Authorization")
    print(f"[DEBUG] Authorization header: {auth}")
    if not auth or not auth.startswith("Bearer "):
        print("[ERROR] Nema validnog Authorization header-a")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth.removeprefix("Bearer ").strip()
    print(f"[DEBUG] Izvučen token: {token}")
    return token

# --- Dohvatanje trenutnog korisnika iz tokena ---
async def get_current_user(
    token: str = Depends(get_token_from_header),
    db: Session = Depends(get_db),
) -> User:
    print("[DEBUG] Ulazim u get_current_user")
    token_data = decode_access_token(token)
    print(f"[DEBUG] Token data: sub={token_data.sub}, role={token_data.role}")
    user = db.query(User).filter(User.email == token_data.sub).first()
    if not user:
        print("[ERROR] Korisnik nije pronađen u bazi")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print(f"[DEBUG] Pronađen korisnik: {user.email}")
    return user
