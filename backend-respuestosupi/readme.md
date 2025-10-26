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

### SQL

Debe tener una servicio de SQL de Microsoft corriendo, puede descargar [este archivo](https://drive.proton.me/urls/WR8FQ00D0C#AGTdBt8gFIOz) para crear la base de datos, tabla y meter informacion de prueba.


### Comandos

Correr los comandos en orden

```bash
cd backend-respuestosupi\

python -m pip install -r requisitos.txt

python -m uvicorn main:app --reload

npm run dev
```

Abrir [http://localhost:8000](http://localhost:8000/)
