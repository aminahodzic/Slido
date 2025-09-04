from typing import Optional
from sqlmodel import Session, select
from models.user_model import User

def create_user(db: Session, user: User) -> User:
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception:
        db.rollback()
        raise

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.get(User, user_id)

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    result = db.exec(statement).first()
    return result

def get_users(db: Session, offset: int = 0, limit: int = 100) -> list[User]:
    statement = select(User).offset(offset).limit(limit)
    results = db.exec(statement).all()
    return results

def update_user(db: Session, db_user: User, updates: dict) -> User:
    for key, value in updates.items():
        setattr(db_user, key, value)
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception:
        db.rollback()
        raise

def delete_user(db: Session, db_user: User) -> None:
    try:
        db.delete(db_user)
        db.commit()
    except Exception:
        db.rollback()
        raise

def count_users(session: Session) -> int:
    return session.query(User).count()

def count_users_by_role(session: Session, role: str) -> int:
    return session.query(User).filter(User.role == role).count()