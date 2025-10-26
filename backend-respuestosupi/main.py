from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import sesion

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sesion.router)

@app.get("/")
def root():
    return {"message": "api funcionando"}
