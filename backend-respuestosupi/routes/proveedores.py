from fastapi import APIRouter
from pydantic import BaseModel
from crud.proveedores import *

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])

class ProveedorData(BaseModel):
    nombre: str
    telefono: str
    correo: str

@router.get("/")
def listar():
    return listar_proveedores()

@router.post("/")
def crear(proveedor: ProveedorData):
    return crear_proveedor(proveedor.dict())

@router.delete("/{id_proveedor}")
def eliminar(id_proveedor: int):
    return eliminar_proveedor(id_proveedor)