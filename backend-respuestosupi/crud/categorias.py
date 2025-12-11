from mssql import get_connection

def listar_categorias():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id_categoria, nombre FROM Categorias ORDER BY id_categoria DESC")
    rows = cursor.fetchall()
    conn.close()

    categorias = []
    for r in rows:
        categorias.append({
            "id_categoria": r[0],
            "nombre": r[1]
        })
    return categorias


def crear_categoria(data):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Categorias (nombre)
            OUTPUT INSERTED.id_categoria
            VALUES (?)
        """, (data["nombre"],))
        new_id = cursor.fetchone()[0]
        conn.commit()
        return {
            "id_categoria": new_id,
            "nombre": data["nombre"],
            "mensaje": "Categoría creada exitosamente"
        }
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}
    finally:
        conn.close()

def eliminar_categoria(categoria_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Categorias WHERE id_categoria = ?", (categoria_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()