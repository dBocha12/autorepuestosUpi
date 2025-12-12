from datetime import date
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from crud.pedidos import (
    listar_pedidos as crud_listar_pedidos,
    obtener_pedido as crud_obtener_pedido,
    crear_pedido as crud_crear_pedido,
    eliminar_pedido as crud_eliminar_pedido,
)

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


class DetalleItem(BaseModel):
    id_repuesto: int
    cantidad: int


class PedidoCrear(BaseModel):
    id_cliente: int
    fecha: Optional[date] = None
    items: List[DetalleItem]


@router.get("/")
def listar():
    return crud_listar_pedidos()


@router.get("/{pedido_id}")
def obtener(pedido_id: int):
    pedido = crud_obtener_pedido(pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


@router.post("/", status_code=201)
def crear(pedido: PedidoCrear):
    try:
        data = pedido.dict()
        if data.get("fecha"):
            data["fecha"] = data["fecha"].isoformat()
        return crud_crear_pedido(data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo crear: {e}")


@router.delete("/{pedido_id}", status_code=204)
def eliminar(pedido_id: int):
    try:
        ok = crud_eliminar_pedido(pedido_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo eliminar: {e}")
