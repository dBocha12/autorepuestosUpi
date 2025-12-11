from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from crud.clientes import (
    listar_clientes as crud_listar_clientes,
    obtener_cliente as crud_obtener_cliente,
    crear_cliente as crud_crear_cliente,
    actualizar_cliente as crud_actualizar_cliente,
    eliminar_cliente as crud_eliminar_cliente,
)

router = APIRouter(prefix="/clientes", tags=["Clientes"])


class ClienteBase(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None


class ClienteOut(ClienteBase):
    id: int


@router.get("/", response_model=List[ClienteOut])
def listar():
    return crud_listar_clientes()


@router.get("/{id_cliente}", response_model=ClienteOut)
def obtener(id_cliente: int):
    cliente = crud_obtener_cliente(id_cliente)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.post("/", response_model=ClienteOut, status_code=201)
def crear(cliente: ClienteBase):
    nuevo = crud_crear_cliente(cliente.dict())
    return nuevo


@router.put("/{id_cliente}", response_model=ClienteOut)
def actualizar(id_cliente: int, cliente: ClienteBase):
    actualizado = crud_actualizar_cliente(id_cliente, cliente.dict())
    if not actualizado:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return actualizado


@router.delete("/{id_cliente}", status_code=204)
def eliminar(id_cliente: int):
    ok = crud_eliminar_cliente(id_cliente)
    if not ok:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return
