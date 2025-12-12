from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.sesion import router as auth_router
from routes.repuestos import router as repuestos_router
from routes.categorias import router as categorias_router
from routes.proveedores import router as proveedores_router
from routes.clientes import router as clientes_router
from routes.vehiculos import router as vehiculos_router
from routes.pedidos import router as pedidos_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(repuestos_router)
app.include_router(categorias_router)
app.include_router(proveedores_router)
app.include_router(clientes_router)
app.include_router(vehiculos_router)
app.include_router(pedidos_router)

@app.get("/")
def root():
    return {"message": "api funcionando"}
