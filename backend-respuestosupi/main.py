from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mssql import get_connection
from routes.manejo_usuarios import router as manejo_usuarios_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(manejo_usuarios_router)

@app.get("/")
def root():
    return {"message": "api funcionando"}

@app.get("/test-db")
def test_db():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT TOP 1 * FROM usuarios")
        row = cursor.fetchone()
        conn.close()
        return {"data": str(row)}
    except Exception as e:
        return {"error": str(e)}