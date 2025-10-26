# Backend

Repo donde se aloja el backend de la pagina web, corre exponiendo APIs

## Como usar

### .env

Se debe crear un .env, plantilla:

```bash
SERVER=
DATABASE=
UID=
PWD=
```
### Comandos
###
```bash
cd backend-respuestosupi\

python -m pip install -r requisitos.txt

python -m uvicorn main:app --reload

npm run dev
```

Abrir [http://localhost:8000](http://localhost:8000/)
