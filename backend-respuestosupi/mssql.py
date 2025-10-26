import pyodbc
from dotenv import load_dotenv
import os

load_dotenv()

db_server = os.getenv("SERVER")
db_database = os.getenv("DATABASE")
db_user = os.getenv("UID")
db_password = os.getenv("PWD")

def get_connection():
    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        f"SERVER={db_server};"
        f"DATABASE={db_database};"
        f"UID={db_user};"
        f"PWD={db_password};"
    )
    return conn
