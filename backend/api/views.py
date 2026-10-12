from django.db import connection
from django.http import JsonResponse


def listar_entidades(request):
    # Consultar las entidades profesionales en PostgreSQL
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, nombre, ciudad, pais, url
            FROM portfolio.entidades
            ORDER BY id
        """)

        filas = cursor.fetchall()

    # Convertir los registros SQL en diccionarios Python
    entidades = []

    for fila in filas:
        entidades.append({
            "id": fila[0],
            "nombre": fila[1],
            "ciudad": fila[2],
            "pais": fila[3],
            "url": fila[4],
        })

    # Devolver la información como JSON
    return JsonResponse({"entidades": entidades})

def listar_experiencias(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                ex.id,
                ex.entidad_id,
                e.nombre,
                ex.rol,
                ex.periodo,
                ex.descripcion,

                -- Tecnologías asociadas
                COALESCE(
                    (
                        SELECT ARRAY_AGG(t.nombre ORDER BY t.nombre)
                        FROM portfolio.experiencia_tecnologia AS et
                        INNER JOIN portfolio.tecnologias AS t
                            ON et.tecnologia_id = t.id
                        WHERE et.experiencia_id = ex.id
                    ),
                    ARRAY[]::varchar[]
                ) AS tecnologias,

                -- Conocimientos asociados
                COALESCE(
                    (
                        SELECT ARRAY_AGG(c.nombre ORDER BY c.nombre)
                        FROM portfolio.experiencia_conocimiento AS ec
                        INNER JOIN portfolio.conocimientos AS c
                            ON ec.conocimiento_id = c.id
                        WHERE ec.experiencia_id = ex.id
                    ),
                    ARRAY[]::varchar[]
                ) AS conocimientos

            FROM portfolio.experiencias AS ex
            INNER JOIN portfolio.entidades AS e
                ON ex.entidad_id = e.id
            ORDER BY e.id, ex.id
        """)

        filas = cursor.fetchall()

    experiencias = []

    for fila in filas:
        experiencias.append({
            "id": fila[0],
            "entidad_id": fila[1],
            "entidad": fila[2],
            "rol": fila[3],
            "periodo": fila[4],
            "descripcion": fila[5],
            "tecnologias": fila[6],
            "conocimientos": fila[7],
        })

    return JsonResponse({"experiencias": experiencias})