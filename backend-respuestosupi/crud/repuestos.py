from mssql import get_connection

def listar_repuestos():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            r.id_repuesto,
            r.nombre,
            r.descripcion,
            r.precio,
            r.id_categoria,        
            r.id_proveedor,       
            r.cantidad,
            r.ubicacion,
            c.nombre AS categoria,   
            p.nombre AS proveedor    
        FROM Repuestos r
        INNER JOIN Categorias c ON r.id_categoria = c.id_categoria
        INNER JOIN Proveedores p ON r.id_proveedor = p.id_proveedor
        ORDER BY r.id_repuesto DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    repuestos = []
    for r in rows:
        repuestos.append({
            "id_repuesto": r[0],
            "nombre": r[1],
            "descripcion": r[2],
            "precio": float(r[3]),
            "id_categoria": r[4],  
            "id_proveedor": r[5],  
            "cantidad": r[6],
            "ubicacion": r[7],
            "categoria": r[8],     
            "proveedor": r[9],    
        })
    return repuestos


def crear_repuesto(data):
    """
    data: dict con keys:
      nombre, descripcion, precio, id_categoria, id_proveedor, cantidad, ubicacion
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Repuestos (nombre, descripcion, precio, id_categoria, id_proveedor, cantidad, ubicacion)
            OUTPUT INSERTED.id_repuesto
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data["nombre"],
            data.get("descripcion", ""),
            float(data["precio"]),
            int(data["id_categoria"]),
            int(data["id_proveedor"]),
            int(data["cantidad"]),
            data.get("ubicacion", "")
        ))
        new_id = cursor.fetchone()[0]
        conn.commit()

        cursor.execute("""
            SELECT 
                r.id_repuesto,
                r.nombre,
                r.descripcion,
                r.precio,
                r.id_categoria,
                r.id_proveedor,
                r.cantidad,
                r.ubicacion,
                c.nombre AS categoria,
                p.nombre AS proveedor
            FROM Repuestos r
            INNER JOIN Categorias c ON r.id_categoria = c.id_categoria
            INNER JOIN Proveedores p ON r.id_proveedor = p.id_proveedor
            WHERE r.id_repuesto = ?
        """, (new_id,))
        r = cursor.fetchone()

        return {
            "id_repuesto": r[0],
            "nombre": r[1],
            "descripcion": r[2],
            "precio": float(r[3]),
            "id_categoria": r[4],
            "id_proveedor": r[5],
            "cantidad": r[6],
            "ubicacion": r[7],
            "categoria": r[8],
            "proveedor": r[9],
        }
    finally:
        conn.close()

def actualizar_stock(id_repuesto: int, cantidad: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE Repuestos
            SET cantidad = ?
            WHERE id_repuesto = ?
        """, (int(cantidad), int(id_repuesto)))
        
        if cursor.rowcount == 0:
            conn.rollback()
            return None
        
        conn.commit()

        cursor.execute("""
            SELECT 
                r.id_repuesto,
                r.nombre,
                r.descripcion,
                r.precio,
                r.id_categoria,
                r.id_proveedor,
                r.cantidad,
                r.ubicacion,
                c.nombre AS categoria,
                p.nombre AS proveedor
            FROM Repuestos r
            INNER JOIN Categorias c ON r.id_categoria = c.id_categoria
            INNER JOIN Proveedores p ON r.id_proveedor = p.id_proveedor
            WHERE r.id_repuesto = ?
        """, (id_repuesto,))
        r = cursor.fetchone()
        if not r:
            return None

        return {
            "id_repuesto": r[0],
            "nombre": r[1],
            "descripcion": r[2],
            "precio": float(r[3]),
            "id_categoria": r[4],
            "id_proveedor": r[5],
            "cantidad": r[6],
            "ubicacion": r[7],
            "categoria": r[8],
            "proveedor": r[9],
        }
    finally:
        conn.close()
