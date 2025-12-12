from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
from crud.repuestos import listar_repuestos, crear_repuesto, actualizar_stock

router = APIRouter(prefix="/repuestos", tags=["Repuestos"])

class StockUpdate(BaseModel):
  cantidad: int

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

@router.patch("/{id_repuesto}/stock", response_model=RepuestoOut)
def actualizar_stock_route(id_repuesto: int, data: StockUpdate):
    try:
        rep = actualizar_stock(id_repuesto, data.cantidad)
        if not rep:
            raise HTTPException(status_code=404, detail="Repuesto no encontrado")
        return rep
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo actualizar stock: {e}")
