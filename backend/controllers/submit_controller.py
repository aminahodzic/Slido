from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models.ocjena_model import Ocjena  # Model za bazu podataka
from schemas.ocjena_schema import OcjenaCreate  # Schema za kreiranje ocjene
from models.predavanje_model import Predavanje  # Ispravljen import modela za predavanje
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from database import get_db  # Funkcija za pristup bazi
from typing import List
import smtplib
from models.pitanje_model import Pitanje
router = APIRouter()

# Funkcija za generisanje izvještaja
def generate_report(predavanje_id: int, db: Session):
    # Dobavljanje svih pitanja za predavanje
    pitanja = db.query(Pitanje).filter(Pitanje.predavanje_id == predavanje_id).all()

    if not pitanja:
        raise HTTPException(status_code=404, detail="Nema pitanja za ovo predavanje")

    # Brojanje postavljenih i odgovornih pitanja
    postavljena_pitanja = len(pitanja)
    odgovorena_pitanja = sum(1 for p in pitanja if p.status == "odgovoreno")

    # Generisanje HTML izvještaja
    html = f"""
    <html>
    <body>
        <h3>Izvještaj za predavanje ID: {predavanje_id}</h3>
        <p>Ukupno postavljenih pitanja: {postavljena_pitanja}</p>
        <p>Ukupno odgovornih pitanja: {odgovorena_pitanja}</p>
        <table border="1">
            <tr>
                <th>Pitanje</th>
                <th>Status</th>
                <th>Broj odobravanja</th>
            </tr>
    """

    for pitanje in pitanja:
        html += f"""
        <tr>
            <td>{pitanje.sadrzaj}</td>
            <td>{pitanje.status}</td>
            <td>{pitanje.odobravanja_count}</td>
        </tr>
        """

    html += """
        </table>
    </body>
    </html>
    """
    
    return html

# Funkcija za slanje izvještaja predavaču
def send_report_email(to_email: str, predavanje_id: int, db: Session):
    html_report = generate_report(predavanje_id, db)
    
    # Slanje e-maila
    message = MIMEMultipart("alternative")
    message["From"] = "admin@yourapp.com"
    message["To"] = to_email
    message["Subject"] = f"Izvještaj za predavanje ID: {predavanje_id}"

    part = MIMEText(html_report, "html")
    message.attach(part)

    # Postavke za SMTP server
    smtp_server = "smtp.mailmug.net"
    port = 2525
    login = "wrmgwulpzclc8xpz"
   
    
    try:
        server = SMTP(smtp_server, port)
        server.set_debuglevel(1)
        server.esmtp_features['auth'] = 'LOGIN PLAIN'
        server.login(login, password)
        server.sendmail("admin@yourapp.com", to_email, message.as_string())
        server.quit()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška prilikom slanja e-maila")

@router.post("/submit-rating/{predavanje_id}")
async def submit_rating(predavanje_id: int, ocjena: OcjenaCreate, db: Session = Depends(get_db)):
    # Spremanje ocjene u bazu podataka
    new_rating = Ocjena(predavanje_id=predavanje_id, ocjena=ocjena.ocjena)
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)

    # Slanje e-maila predavaču sa ocjenom
    smtp_server = "smtp.mailmug.net"
    port = 2525
    login = "wrmgwulpzclc8xpz"
    password = "asw954cajasb9jis"
    sender_email = "publika@slido.com"
    to_email = "predavac@slido.com"  # Ovdje trebaš uzeti email predavača iz baze podataka
    message = MIMEMultipart('alternative')
    message['from'] = sender_email
    message['to'] = to_email
    message['Subject'] = f"Ocjena za predavanje ID: {predavanje_id}"

    html = f"""\
    <html>
    <body>
        <p>Poštovani, <br>
        Publika je ocijenila vaše predavanje sa {ocjena.ocjena} <br>
        Hvala na vašem trudu!</p>
    </body>
    </html>
    """
    part = MIMEText(html, "html")
    message.attach(part)

    try:
        # Postavljanje SMTP servera
        server = smtplib.SMTP(smtp_server, port)
        server.set_debuglevel(1)
        server.esmtp_features['auth'] = 'LOGIN PLAIN'
        server.login(login, password)
        server.sendmail(sender_email, to_email, message.as_string())
        server.quit()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Greška prilikom slanja e-maila")

    # Slanje izvještaja o pitanjima predavaču
    predavanje = db.query(Predavanje).filter(Predavanje.id == predavanje_id).first()
    if not predavanje:
        raise HTTPException(status_code=404, detail="Predavanje nije pronađeno")

    predavac_email = predavanje.predavac.email  # Pretpostavljamo da predavač ima e-mail
    send_report_email(predavac_email, predavanje_id, db)

    return {"poruka": "Ocjena i izvještaj su uspješno poslati predavaču putem e-maila"}
