from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
from crud.repuestos import listar_repuestos, crear_repuesto

router = APIRouter(prefix="/repuestos", tags=["Repuestos"])

class RepuestoCreate(BaseModel):
    nombre: str = Field(..., min_length=1)
    descripcion: str | None = ""
    precio: float
    id_categoria: int
    id_proveedor: int
    cantidad: int
    ubicacion: str | None = ""

class RepuestoOut(BaseModel):
    id_repuesto: int
    nombre: str
    descripcion: str | None = None
    precio: float
    id_categoria: int     
    id_proveedor: int       
    cantidad: int
    ubicacion: str | None = None
    categoria: str | None = None 
    proveedor: str | None = None 

@router.get("/", response_model=List[RepuestoOut])
def listar():
    return listar_repuestos()


@router.post("/", response_model=RepuestoOut, status_code=201)
def crear(data: RepuestoCreate):
    try:
        return crear_repuesto(data.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo crear: {e}")
