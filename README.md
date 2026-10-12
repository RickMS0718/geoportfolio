

\# GeoPortfolio



GeoPortfolio profesional desarrollado para visualizar y consultar información geográfica relacionada con mi trayectoria laboral, académica y proyectos geoespaciales.



\## Objetivo



Construir una aplicación Web GIS interactiva que integre mi perfil profesional con información geográfica de las instituciones y organizaciones en las que he trabajado.



\## Tecnologías



\- PostgreSQL y PostGIS: almacenamiento y gestión de información espacial.

\- GeoServer: publicación de servicios geográficos WFS.

\- OpenLayers: visualización e interacción con mapas.

\- HTML, CSS y JavaScript: desarrollo del frontend.

\- Docker Compose: gestión de servicios y contenedores.

\- Python y Django: futura API para consultar datos relacionados.



\## Funcionalidades implementadas



\- Mapa interactivo con OpenStreetMap.

\- Consulta de entidades profesionales mediante WFS y GeoJSON.

\- Ventanas emergentes con información de cada entidad.

\- Resaltado de entidades al pasar el cursor.



\## Estado del proyecto



En desarrollo. Próxima etapa: implementar una API con Django para consultar experiencias profesionales, tecnologías y conocimientos almacenados en PostgreSQL.



\## Ejecución local



1\. Crear un archivo `.env` a partir de `.env.example` y configurar las credenciales.

2\. Ejecutar `docker compose up -d` desde la raíz del proyecto.

3\. Iniciar el frontend desde la carpeta `frontend` con `python -m http.server 5500`.

4\. Abrir `http://localhost:5500` en el navegador.



\## Autor



Ricardo Moreno Segura — Ingeniería Forestal, Análisis Espacial y Geomática.



