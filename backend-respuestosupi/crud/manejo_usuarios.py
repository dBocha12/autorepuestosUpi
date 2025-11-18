from mssql import get_connection

def listar_usuarios():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, email FROM usuarios")
    usuarios = cursor.fetchall()
    conn.close()
    return usuarios

def crear_usuario(email, nombre, password):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO usuarios (email, nombre, password) VALUES (?, ?, ?)",
        (email, nombre, password)
    )
    conn.commit()
    conn.close()
    return cursor

def obtener_usuario_por_email(email):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, nombre, email, password FROM usuarios WHERE email = ?",
        (email,)
    )
    user = cursor.fetchone()
    conn.close()
    return user
