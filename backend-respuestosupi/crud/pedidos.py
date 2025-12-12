from datetime import date
from mssql import get_connection


def listar_pedidos():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            p.id_pedido,
            p.fecha,
            p.total,
            c.id_cliente,
            c.nombre AS nombre_cliente,
            COUNT(d.id_detalle) AS cantidad_items
        FROM Pedidos p
        JOIN Clientes c ON p.id_cliente = c.id_cliente
        LEFT JOIN DetallesPedidos d ON d.id_pedido = p.id_pedido
        GROUP BY p.id_pedido, p.fecha, p.total, c.id_cliente, c.nombre
        ORDER BY p.id_pedido DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    pedidos = []
    for r in rows:
        pedidos.append({
            "id_pedido": r[0],
            "fecha": r[1].isoformat() if isinstance(r[1], date) else r[1],
            "total": float(r[2]),
            "id_cliente": r[3],
            "cliente_nombre": r[4],
            "cantidad_items": r[5],
        })
    return pedidos


def obtener_pedido(pedido_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            p.id_pedido,
            p.fecha,
            p.total,
            c.id_cliente,
            c.nombre AS nombre_cliente
        FROM Pedidos p
        JOIN Clientes c ON p.id_cliente = c.id_cliente
        WHERE p.id_pedido = ?
    """, (pedido_id,))
    encabezado = cursor.fetchone()
    if not encabezado:
        conn.close()
        return None

    cursor.execute("""
        SELECT 
            d.id_detalle,
            d.id_repuesto,
            r.nombre,
            d.cantidad,
            d.subtotal
        FROM DetallesPedidos d
        JOIN Repuestos r ON r.id_repuesto = d.id_repuesto
        WHERE d.id_pedido = ?
        ORDER BY d.id_detalle
    """, (pedido_id,))
    detalles_rows = cursor.fetchall()
    conn.close()

    detalles = []
    for d in detalles_rows:
        detalles.append({
            "id_detalle": d[0],
            "id_repuesto": d[1],
            "repuesto_nombre": d[2],
            "cantidad": d[3],
            "subtotal": float(d[4]),
        })

    return {
        "id_pedido": encabezado[0],
        "fecha": encabezado[1].isoformat() if isinstance(encabezado[1], date) else encabezado[1],
        "total": float(encabezado[2]),
        "id_cliente": encabezado[3],
        "cliente_nombre": encabezado[4],
        "detalles": detalles,
    }


def crear_pedido(data: dict):
    """
    data = {
      "id_cliente": int,
      "fecha": "YYYY-MM-DD" (opcional),
      "items": [
        {"id_repuesto": int, "cantidad": int}
      ]
    }
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        id_cliente = data["id_cliente"]
        fecha_str = data.get("fecha")
        if fecha_str:
            fecha_val = date.fromisoformat(fecha_str)
        else:
            fecha_val = date.today()

        items = data.get("items", [])
        if not items:
            raise ValueError("El pedido debe tener al menos un ítem")

        cursor.execute("""
            INSERT INTO Pedidos (id_cliente, fecha, total)
            OUTPUT INSERTED.id_pedido
            VALUES (?, ?, 0)
        """, (id_cliente, fecha_val))
        id_pedido = cursor.fetchone()[0]

        total = 0.0

        for item in items:
            id_repuesto = item["id_repuesto"]
            cant = int(item["cantidad"])

            cursor.execute(
                "SELECT precio, cantidad FROM Repuestos WHERE id_repuesto = ?",
                (id_repuesto,)
            )
            row_rep = cursor.fetchone()
            if not row_rep:
                raise ValueError(f"Repuesto {id_repuesto} no existe")

            precio_unit = float(row_rep[0])
            stock_actual = int(row_rep[1])

            if stock_actual < cant:
                raise ValueError(
                    f"Stock insuficiente para el repuesto {id_repuesto}. "
                    f"Disponible: {stock_actual}, solicitado: {cant}"
                )

            subtotal = precio_unit * cant

            cursor.execute("""
                INSERT INTO DetallesPedidos (id_pedido, id_repuesto, cantidad, subtotal)
                VALUES (?, ?, ?, ?)
            """, (id_pedido, id_repuesto, cant, subtotal))

            cursor.execute("""
                UPDATE Repuestos
                SET cantidad = cantidad - ?
                WHERE id_repuesto = ?
            """, (cant, id_repuesto))

            total += subtotal

        cursor.execute(
            "UPDATE Pedidos SET total = ? WHERE id_pedido = ?",
            (total, id_pedido)
        )

        conn.commit()

        return obtener_pedido(id_pedido)

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def eliminar_pedido(pedido_id: int):
    """
    Elimina un pedido y RESTAURA el stock de los repuestos
    usando los DetallesPedidos antes de borrarlos (ON DELETE CASCADE).
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id_repuesto, cantidad
            FROM DetallesPedidos
            WHERE id_pedido = ?
        """, (pedido_id,))
        detalles = cursor.fetchall()

        if not detalles:
            cursor.execute("DELETE FROM Pedidos WHERE id_pedido = ?", (pedido_id,))
            filas = cursor.rowcount
            conn.commit()
            return filas > 0

        # Devolver stock
        for id_repuesto, cant in detalles:
            cursor.execute("""
                UPDATE Repuestos
                SET cantidad = cantidad + ?
                WHERE id_repuesto = ?
            """, (cant, id_repuesto))

        cursor.execute("DELETE FROM Pedidos WHERE id_pedido = ?", (pedido_id,))
        filas = cursor.rowcount

        conn.commit()
        return filas > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
