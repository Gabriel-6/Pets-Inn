class Config:
    SECRET_KEY = "pets"
    DB_CONFIG = {
        "host": "localhost",
        "user": "root",
        "password": "root",
        "database": "petsinn",
    }
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    EMAIL = ""
    PASSWORD = ""