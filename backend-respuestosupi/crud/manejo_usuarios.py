from mssql import get_connection

def listar_usuarios():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id_usuario, nombre, email, rol FROM usuarios")
    rows = cursor.fetchall()
    conn.close()

    usuarios = []
    for r in rows:
        usuarios.append({
            "id": r[0],
            "nombre": r[1],
            "email": r[2],
            "rol": r[3],
        })

    return usuarios


def crear_usuario(email, nombre, password, rol="vendedor"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO usuarios (email, nombre, password, rol) VALUES (?, ?, ?, ?)",
        (email, nombre, password, rol)
    )
    conn.commit()
    conn.close()


def obtener_usuario_por_email(email):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id_usuario, nombre, email, password, rol FROM usuarios WHERE email = ?",
        (email,),
    )
    user = cursor.fetchone()
    conn.close()
    return user


def eliminar_usuario(id_usuario: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM usuarios WHERE id_usuario = ?", (id_usuario,))
    conn.commit()
    conn.close()
