from sqlmodel import Session
from fastapi import HTTPException
from repositories import pozivnica_gost_repository
from schemas.pozivnica_gost_schema import PozivnicaGostCreate
from email.mime.text import MIMEText
import smtplib


def posalji_pozivnicu(db: Session, data: PozivnicaGostCreate, predavanje_id: int):
    pozivnica = pozivnica_gost_repository.create_pozivnica(db, data, predavanje_id)
    # slanje email-a
    body = f"Pristupite predavanju putem linka: https://slido.com/join/{pozivnica.token}"
    msg = MIMEText(body)
    msg["Subject"] = "Pozivnica na predavanje"
    msg["From"] = "noreply@slido-projekat.com"
    msg["To"] = pozivnica.email

    with smtplib.SMTP("localhost") as server:
        server.sendmail(msg["From"], [pozivnica.email], msg.as_string())

    return pozivnica
