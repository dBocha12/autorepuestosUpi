from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from crud.categorias import listar_categorias, crear_categoria, eliminar_categoria

router = APIRouter(prefix="/categorias", tags=["Categorias"])

class CategoriaData(BaseModel):
    nombre: str

@router.get("/")
def listar():
    return listar_categorias()

@router.post("/", status_code=201)
def crear(categoria: CategoriaData):
    try:
        return crear_categoria(categoria.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo crear: {e}")
    
@router.delete("/{categoria_id}", status_code=204)
def eliminar(categoria_id: int):
    try:
        eliminar_categoria(categoria_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo eliminar: {e}")
