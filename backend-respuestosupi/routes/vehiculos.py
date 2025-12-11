from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from crud.vehiculos import (
    listar_vehiculos as crud_listar_vehiculos
)

router = APIRouter(prefix="/vehiculos", tags=["Vehiculos"])

class VehiculoData(BaseModel):
    marca: str
    modelo: str
    anno: int

@router.get("/")
def listar():
    return crud_listar_vehiculos()

@router.post("/", status_code=201)
def crear(vehiculo: VehiculoData):
    try:
        return crud_crear_vehiculo(vehiculo.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo crear: {e}")
    
@router.delete("/{vehiculo_id}", status_code=204)
def eliminar(vehiculo_id: int):
    try:
        crud_eliminar_vehiculo(vehiculo_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo eliminar: {e}")
