from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
import bcrypt

from crud.manejo_usuarios import listar_usuarios, crear_usuario, obtener_usuario_por_email

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    nombre: str
    email: str
    password: str


@router.post("/login")
async def login(data: LoginRequest):
    user = obtener_usuario_por_email(data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    user_id, nombre, email, stored_hash = user
    if not bcrypt.checkpw(data.password.encode("utf-8"), stored_hash.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {
        "message": "login exitoso",
        "user": {
            "id": user_id,
            "nombre": nombre,
            "email": email
        },
        "token": "fake-jwt-token"
    }


@router.get("/usuarios")
async def get_usuarios():
    usuarios = listar_usuarios()
    return {
        "usuarios": [
            {"id": u[0], "nombre": u[1], "email": u[2]}
            for u in usuarios
        ]
    }


@router.post("/registrar")
async def register(data: RegisterRequest):
    exist = obtener_usuario_por_email(data.email)
    if exist:
        raise HTTPException(status_code=400, detail="email ya registrado")
    hashed = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")
    crear_usuario(data.email, data.nombre, hashed)
    return {
        "message": f"usuario {data.nombre} registrado correctamente"
    }
