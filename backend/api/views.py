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


def listar_formaciones(request):
    # Consultar la formación académica en PostgreSQL
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                id,
                institucion,
                titulo,
                tipo,
                periodo,
                descripcion,
                ciudad,
                pais,
                url
            FROM portfolio.formaciones
            ORDER BY id DESC
        """)

        filas = cursor.fetchall()

    # Convertir los registros en diccionarios
    formaciones = []

    for fila in filas:
        formaciones.append({
            "id": fila[0],
            "institucion": fila[1],
            "titulo": fila[2],
            "tipo": fila[3],
            "periodo": fila[4],
            "descripcion": fila[5],
            "ciudad": fila[6],
            "pais": fila[7],
            "url": fila[8],
        })

    return JsonResponse({"formaciones": formaciones})


def listar_trabajos_academicos(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                ta.id,
                ta.formacion_id,
                ta.tipo,
                ta.titulo,
                ta.anio,
                ta.descripcion,
                ta.url,

                -- Tecnologías asociadas
                COALESCE(
                    (
                        SELECT ARRAY_AGG(t.nombre ORDER BY t.nombre)
                        FROM portfolio.trabajo_tecnologia AS tt
                        INNER JOIN portfolio.tecnologias AS t
                            ON tt.tecnologia_id = t.id
                        WHERE tt.trabajo_id = ta.id
                    ),
                    ARRAY[]::varchar[]
                ) AS tecnologias,

                -- Conocimientos asociados
                COALESCE(
                    (
                        SELECT ARRAY_AGG(c.nombre ORDER BY c.nombre)
                        FROM portfolio.trabajo_conocimiento AS tc
                        INNER JOIN portfolio.conocimientos AS c
                            ON tc.conocimiento_id = c.id
                        WHERE tc.trabajo_id = ta.id
                    ),
                    ARRAY[]::varchar[]
                ) AS conocimientos

            FROM portfolio.trabajos_academicos AS ta
            ORDER BY ta.anio DESC, ta.id DESC
        """)

        filas = cursor.fetchall()

    trabajos = []

    for fila in filas:
        trabajos.append({
            "id": fila[0],
            "formacion_id": fila[1],
            "tipo": fila[2],
            "titulo": fila[3],
            "anio": fila[4],
            "descripcion": fila[5],
            "url": fila[6],
            "tecnologias": fila[7],
            "conocimientos": fila[8],
        })

    return JsonResponse({"trabajos": trabajos})
