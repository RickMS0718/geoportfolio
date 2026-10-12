// --------------------------------------------------
// 1. CAPA BASE - OpenStreetMap
// --------------------------------------------------

const osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
});


// --------------------------------------------------
// 2. ENTIDADES PROFESIONALES - GeoServer
// --------------------------------------------------

const entidadesSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),

    url: 'http://localhost:8080/geoserver/portfolio/ows?' +
         'service=WFS&' +
         'version=2.0.0&' +
         'request=GetFeature&' +
         'typeNames=portfolio:entidades&' +
         'outputFormat=application/json'
});


const entidadesLayer = new ol.layer.Vector({
    source: entidadesSource,

    style: new ol.style.Style({

        image: new ol.style.Circle({
            radius: 8,

            fill: new ol.style.Fill({
                color: '#2563eb'
            }),

            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 2
            })
        })

    })
});


// --------------------------------------------------
// 3. ESTILO PARA ENTIDADES RESALTADAS
// --------------------------------------------------

const estiloResaltado = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 11,

        fill: new ol.style.Fill({
            color: '#f59e0b'
        }),

        stroke: new ol.style.Stroke({
            color: '#ffffff',
            width: 3
        })
    })
});

// --------------------------------------------------
// 3. VISTA INICIAL
// --------------------------------------------------

const view = new ol.View({
    center: ol.proj.fromLonLat([-20, 20]),
    zoom: 2
});


// --------------------------------------------------
// 4. MAPA
// --------------------------------------------------

const map = new ol.Map({
    target: 'map',

    layers: [
        osmLayer,
        entidadesLayer
    ],

    view: view
});

// --------------------------------------------------
// 5. POPUP
// --------------------------------------------------

const popupElement = document.getElementById('popup');
const popupNombre = document.getElementById('popup-nombre');
const popupUbicacion = document.getElementById('popup-ubicacion');
const popupUrl = document.getElementById('popup-url');
// Elementos del popup para la experiencia profesional
const popupExperiencia = document.getElementById('popup-experiencia');
const popupRol = document.getElementById('popup-rol');
const popupPeriodo = document.getElementById('popup-periodo');
const popupDescripcion = document.getElementById('popup-descripcion');
const popupTecnologias = document.getElementById('popup-tecnologias');
const popupConocimientos = document.getElementById('popup-conocimientos');
const popupClose = document.getElementById('popup-close');

const popup = new ol.Overlay({
    element: popupElement,
    positioning: 'bottom-center',
    offset: [0, -12],
    stopEvent: true
});

map.addOverlay(popup);
// --------------------------------------------------
// 6. AJUSTAR VISTA A LAS ENTIDADES
// --------------------------------------------------

entidadesSource.on('featuresloadend', function () {

    const extent = entidadesSource.getExtent();

    view.fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 6
    });

});

// --------------------------------------------------
// 7. MOSTRAR INFORMACIÓN DE LA ENTIDAD
// --------------------------------------------------


map.on('singleclick', function (event) {

    const feature = map.forEachFeatureAtPixel(
        event.pixel,
        function (feature) {
            return feature;
        }
    );

    if (feature) {

        const propiedades = feature.getProperties();

        // Obtener el ID de la entidad desde GeoServer
        const idGeoServer = feature.getId();

        const entidadId = Number(
            String(idGeoServer).split('.').pop()
        );

        // Buscar la experiencia en los datos de Django
        const experiencia = experienciasPorEntidad.get(entidadId);

        // Información geográfica
        popupNombre.textContent = propiedades.nombre;

        popupUbicacion.textContent =
            propiedades.ciudad + ', ' + propiedades.pais;

        popupUrl.href = propiedades.url || '#';

        // Información profesional
        if (experiencia) {

            popupExperiencia.style.display = 'block';

            popupRol.textContent = experiencia.rol || '';

            popupPeriodo.textContent = experiencia.periodo || '';

            popupDescripcion.textContent =
                experiencia.descripcion || '';

            // Tecnologías
            popupTecnologias.textContent =
                (experiencia.tecnologias || []).join(' · ');

            // Conocimientos
            popupConocimientos.textContent =
                (experiencia.conocimientos || []).join(' · ');

        } else {

            // Si todavía no se han cargado los datos de Django
            popupExperiencia.style.display = 'none';

            console.warn(
                'No se encontró experiencia para la entidad:',
                entidadId
            );
        }

        // Mostrar el popup
        popupElement.style.display = 'block';

        popup.setPosition(event.coordinate);

    } else {

        popup.setPosition(undefined);
        popupElement.style.display = 'none';

    }

});


// --------------------------------------------------
// 8. CERRAR POPUP
// --------------------------------------------------

popupClose.addEventListener('click', function () {

    popup.setPosition(undefined);
    popupElement.style.display = 'none';

});

// --------------------------------------------------
// RESALTAR ENTIDADES AL PASAR EL RATÓN
// --------------------------------------------------

let entidadResaltada = null;

map.on('pointermove', function (event) {

    if (event.dragging) {
        return;
    }

    const feature = map.forEachFeatureAtPixel(
            event.pixel,
            function (feature) {
                return feature;
            },
            {
                layerFilter: function (layer) {
                    return layer === entidadesLayer;
                },
                hitTolerance: 5
            }
    );

    // Restaurar el estilo de la entidad anterior
    if (entidadResaltada && entidadResaltada !== feature) {
        entidadResaltada.setStyle(undefined);
    }

    // Resaltar la nueva entidad
    if (feature && entidadResaltada !== feature) {
        feature.setStyle(estiloResaltado);
    }

    entidadResaltada = feature || null;

    // Cambiar el cursor
    map.getTargetElement().style.cursor =
        feature ? 'pointer' : '';

});

// --------------------------------------------------
// 9. CONSULTAR EXPERIENCIAS DESDE DJANGO
// --------------------------------------------------

const API_EXPERIENCIAS =
    'http://127.0.0.1:8000/api/experiencias/';

// Guardar las experiencias utilizando entidad_id como clave
const experienciasPorEntidad = new Map();

async function cargarExperiencias() {
    try {
        const respuesta = await fetch(API_EXPERIENCIAS);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        // Asociar cada experiencia con su entidad
        datos.experiencias.forEach(experiencia => {
            experienciasPorEntidad.set(
                Number(experiencia.entidad_id),
                experiencia
            );
        });

        console.log(
            'Experiencias organizadas por entidad:',
            experienciasPorEntidad
        );

        console.log(
            'Experiencia asociada a entidad 1:',
            experienciasPorEntidad.get(1)
        );

        console.log(
            'Experiencias recibidas desde Django:',
            datos.experiencias
        );

    } catch (error) {
        console.error(
            'Error al consultar la API de Django:',
            error
        );
    }
}

cargarExperiencias();