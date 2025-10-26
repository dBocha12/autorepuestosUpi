from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from mssql import get_connection

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

class Usuario(BaseModel):
    nombre: str
    email: str
    password: str

@router.post("/")
def crear_usuario(usuario: Usuario):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
            (usuario.nombre, usuario.email, usuario.password)
        )
        conn.commit()
        conn.close()
        return {"message": "Usuario creado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/")
def listar_usuarios():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, nombre, email FROM usuarios")
        usuarios = cursor.fetchall()
        conn.close()
        return {"usuarios": [{"id": row[0], "nombre": row[1], "email": row[2]} for row in usuarios]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))