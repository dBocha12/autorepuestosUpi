from mssql import get_connection

def listar_clientes():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id_cliente, nombre, telefono, correo
        FROM Clientes
        ORDER BY id_cliente DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    clientes = []
    for r in rows:
        clientes.append({
            "id": r[0],
            "nombre": r[1],
            "telefono": r[2],
            "correo": r[3],
        })

    return clientes


def obtener_cliente(id_cliente: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id_cliente, nombre, telefono, correo
        FROM Clientes
        WHERE id_cliente = ?
    """, (id_cliente,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row[0],
        "nombre": row[1],
        "telefono": row[2],
        "correo": row[3],
    }


def crear_cliente(data: dict):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO Clientes (nombre, telefono, correo)
            OUTPUT INSERTED.id_cliente, INSERTED.nombre, INSERTED.telefono, INSERTED.correo
            VALUES (?, ?, ?)
        """, (
            data["nombre"],
            data.get("telefono"),
            data.get("correo"),
        ))

        row = cursor.fetchone()
        conn.commit()

        return {
            "id": row[0],
            "nombre": row[1],
            "telefono": row[2],
            "correo": row[3],
        }
    finally:
        conn.close()


def actualizar_cliente(id_cliente: int, data: dict):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE Clientes
            SET nombre = ?, telefono = ?, correo = ?
            WHERE id_cliente = ?
        """, (
            data["nombre"],
            data.get("telefono"),
            data.get("correo"),
            id_cliente,
        ))

        if cursor.rowcount == 0:
            conn.rollback()
            return None

        conn.commit()

        return obtener_cliente(id_cliente)
    finally:
        conn.close()


def eliminar_cliente(id_cliente: int):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            DELETE FROM Clientes
            WHERE id_cliente = ?
        """, (id_cliente,))

        if cursor.rowcount == 0:
            conn.rollback()
            return False

        conn.commit()
        return True
    finally:
        conn.close()
