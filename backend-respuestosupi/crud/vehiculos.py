from mssql import get_connection

def listar_vehiculos():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            v.id_vehiculo,
            v.marca,
            v.modelo,
            v.anno
        FROM Vehiculos v
        ORDER BY v.id_vehiculo DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    vehiculos = []
    for v in rows:
        vehiculos.append({
            "id_vehiculo": v[0],
            "marca": v[1],
            "modelo": v[2],
            "anno": v[3],
        })
    return vehiculos
