from mssql import get_connection

def listar_proveedores():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id_proveedor, nombre, telefono, correo FROM proveedores")

    rows = cursor.fetchall()
    conn.close()

    repuestos = []
    for r in rows:
        repuestos.append({
            "id_proveedor": r[0],
            "nombre": r[1],
            "telefono": r[2],
            "correo": r[3],
        })

    return repuestos

def crear_proveedor(proveedor_data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO proveedores (nombre, telefono, correo) VALUES (?, ?, ?)",
        (proveedor_data["nombre"], proveedor_data["telefono"], proveedor_data["correo"])
    )
    conn.commit()
    conn.close()

    return {"message": "Proveedor creado exitosamente"}

def eliminar_proveedor(id_proveedor):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM proveedores WHERE id_proveedor = ?",
        (id_proveedor,)
    )
    conn.commit()
    conn.close()

    return {"message": "Proveedor eliminado exitosamente"}
