from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
import bcrypt

from crud.manejo_usuarios import (
    listar_usuarios,
    crear_usuario,
    obtener_usuario_por_email,
    eliminar_usuario,
)

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    nombre: str
    email: str
    password: str


class UsuarioCreate(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str = "vendedor"


@router.post("/login")
async def login(data: LoginRequest):
    user = obtener_usuario_por_email(data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    user_id, nombre, email, stored_hash, rol = user

    try:
        if not stored_hash or not bcrypt.checkpw(
            data.password.encode("utf-8"),
            stored_hash.encode("utf-8")
        ):
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    except Exception:
        logger.exception("error verificando password")
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    return {
        "message": "login exitoso",
        "user": {
            "id": user_id,
            "nombre": nombre,
            "email": email,
            "rol": rol,
        },
        "token": "fake-jwt-token",
        "rol": rol,
    }


@router.get("/usuarios")
def obtener_usuarios():
    return listar_usuarios()


@router.post("/usuarios", status_code=201)
def crear_usuario_desde_admin(data: UsuarioCreate):
    exist = obtener_usuario_por_email(data.email)
    if exist:
        raise HTTPException(status_code=400, detail="email ya registrado")

    hashed = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    crear_usuario(data.email, data.nombre, hashed, data.rol)
    return {"message": "usuario creado"}


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


@router.delete("/usuarios/{id_usuario}", status_code=204)
def delete_usuario(id_usuario: int):
    eliminar_usuario(id_usuario)
    return
