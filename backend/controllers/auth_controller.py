from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from database import get_db
from schemas.user_schema import UserCreate, UserRead, UserLogin
from security import Token
from services import user_service

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Registracija korisnika (admin ili predavač).
    """
    return user_service.register_user(db=db, user=user)


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """
    Login korisnika (admin ili predavač). Vraća JWT token.
    """
    db_user = user_service.get_user_by_email(db=db, email=user.email)
    
    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Provjera da li je suspendovan
    if db_user.suspendovan_do:
        from datetime import date
        if db_user.suspendovan_do >= date.today():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account suspended until {db_user.suspendovan_do}"
            )

    token = user_service.login_user(db=db, email=user.email, password=user.password)
    
    return {"access_token": token, "token_type": "bearer"}
