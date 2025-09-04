from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import Session, SQLModel, select
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
<<<<<<< HEAD
import smtplib
=======

>>>>>>> 2a45368ea6046c4a66b77bcd2e8bd76ae5f45fb1
from database import engine
from security import get_password_hash
from models.enum_model import Spol
from models.user_model import User, RoleEnum
from models.predavanje_model import Predavanje
from models.pitanje_model import Pitanje
from models.prisustvo_model import Prisustvo
from models.pozivnica_gost_model import PozivnicaGost
from models.obavijest_model import Obavijest
from models.zabranjena_rijec_model import ZabranjenaRijec
from fastapi.security import OAuth2PasswordBearer

<<<<<<< HEAD
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


=======
>>>>>>> 2a45368ea6046c4a66b77bcd2e8bd76ae5f45fb1

# Controllers
from controllers import (
    user_controller,
    auth_controller,
    prisustvo_controller,
    zabranjena_rijec_controller,
    predavanje_controller,
    pitanje_controller,
    pozivnica_gost_controller,
<<<<<<< HEAD
    submit_controller,
=======
>>>>>>> 2a45368ea6046c4a66b77bcd2e8bd76ae5f45fb1
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        admin_email = "admin@slido.com"
        existing_admin = session.exec(select(User).where(User.email == admin_email)).first()
        if not existing_admin:
            admin = User(
                username="admin",
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                role=RoleEnum.admin,
                spol=Spol.ZENSKO,
                odobren=True,
            )
            session.add(admin)
            session.commit()
            print("✅ Admin korisnik kreiran.")


<<<<<<< HEAD


=======
>>>>>>> 2a45368ea6046c4a66b77bcd2e8bd76ae5f45fb1
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield
    print("Gašenje aplikacije")


def start_application():
    app = FastAPI(lifespan=lifespan)
    app.mount("/static", StaticFiles(directory="static"), name="static"),
    

    #origins = ["*"]  # ovdje možeš staviti dozvoljene domene ili IP-ove

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["Authorization", "Content-Type", "Accept"]
      
       
    )

<<<<<<< HEAD
#    port=2525
 #   smtp_server="smtp.mailmug.net"
  #  login="wrmgwulpzclc8xpz"

   # sender_email="publika@slido.com"
   # to_email="publika2@slido.com"
   # message=MIMEMultipart('alternative')
   # message['from']=sender_email
   # message['to']=to_email
   # message['Subject']='Subject here'

    #@app.get("/send-email") 
    #def send_email():
     #   html= """\
      #      <html>
       #     <body>
        #        <p>Hi, <br>
         #       This is the test email </p>
          #  </body>
           # </html>
            #"""
        #part=MIMEText(html, "html")
        #message.attach(part)
        #server=smtplib.SMTP(smtp_server, port)
        #server.set_debuglevel(1)
        #server.esmtp_features['auth']='LOGIN PLAIN'
        #server.login(login, password)
        #server.sendmail(sender_email, to_email, message.as_string())

        #return {"poruka":"Email poslan"}


=======
>>>>>>> 2a45368ea6046c4a66b77bcd2e8bd76ae5f45fb1
    # Include routers
    app.include_router(user_controller.router, prefix="/users", tags=["Users"])
    app.include_router(auth_controller.router, prefix="/auth", tags=["Auth"])
    app.include_router(prisustvo_controller.router, prefix="/prisustvo", tags=["Prisustvo"])
    app.include_router(zabranjena_rijec_controller.router, prefix="/zabranjena-rijec", tags=["Zabranjena-rijec"])
<<<<<<< HEAD
    app.include_router(submit_controller.router, prefix="/submit", tags=["Submit"])
=======
>>>>>>> 2a45368ea6046c4a66b77bcd2e8bd76ae5f45fb1
    
    # Predavač controllers
    app.include_router(predavanje_controller.router, prefix="/predavanja", tags=["Predavanja"])
    app.include_router(pitanje_controller.router, prefix="/pitanja", tags=["Pitanja"])
    app.include_router(pozivnica_gost_controller.router, prefix="/pozivnice", tags=["Pozivnice"])

    return app


app = start_application()
