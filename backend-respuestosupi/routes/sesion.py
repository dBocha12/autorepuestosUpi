from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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
    if data.email == "admin@upi.com" and data.password == "1234":
        return {"token": "fake-jwt-token", "user": "admin"}
    raise HTTPException(status_code=401, detail="credenciales inválidas")

@router.post("/register")
async def register(data: RegisterRequest):
    if not data.email or not data.password:
        raise HTTPException(status_code=400, detail="faltan campos")
    return {"message": f"usuario {data.nombre} registrado correctamente"}
