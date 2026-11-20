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

// --------------------------------------------------
// 2.1. AGRUPACIÓN DE ENTIDADES (CLUSTER)
// --------------------------------------------------

const clusterSource = new ol.source.Cluster({
    distance: 40,
    minDistance: 0,
    source: entidadesSource
});



// --------------------------------------------------
// 2.2. CAPA DE ENTIDADES AGRUPADAS
// --------------------------------------------------

const entidadesLayer = new ol.layer.Vector({

    source: clusterSource,

    style: function (feature) {

    const entidades = feature.get('features') || [];
    const cantidad = entidades.length;

    // Color y tamaño según la cantidad de entidades
    const esGrupo = cantidad > 1;

    return new ol.style.Style({

        image: new ol.style.Circle({
            radius: esGrupo ? 19 : 8,

            fill: new ol.style.Fill({
                color: esGrupo ? '#0f766e' : '#2563eb'
            }),

            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: esGrupo ? 3 : 2
            })
        }),

        text: esGrupo
            ? new ol.style.Text({
                text: String(cantidad),
                font: 'bold 15px Arial',
                fill: new ol.style.Fill({
                    color: '#ffffff'
                })
            })
            : undefined
    });
    }
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
const popupGrupo = document.getElementById('popup-grupo');
const popupListaEntidades = document.getElementById('popup-lista-entidades');
const popupDetalle = document.getElementById('popup-detalle');
const popupVolver = document.getElementById('popup-volver');

let grupoActual = null;

const popup = new ol.Overlay({
    element: popupElement,
    positioning: 'bottom-center',
    stopEvent: true,

    autoPan: {
        animation: {
            duration: 250
        },
        margin: 25
    }
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


function mostrarDetalleEntidad(entidadOriginal, coordenada) {

    const propiedades = entidadOriginal.getProperties();

    const idGeoServer = entidadOriginal.getId();

    const entidadId = Number(
        String(idGeoServer).split('.').pop()
    );

    const experiencia = experienciasPorEntidad.get(entidadId);

    // Mostrar detalle y ocultar listado
    popupGrupo.hidden = true;
    popupDetalle.hidden = false;
    popupUrl.hidden = false;
    // Mostrar el botón solo si venimos de un grupo
    
    const botonVolver = document.getElementById('popup-volver');

    if (botonVolver) {
        botonVolver.hidden = grupoActual === null;
    } else {
        console.warn('No se encontró el botón popup-volver');
    }

    // Información de la institución
    popupNombre.textContent = propiedades.nombre || '';

    popupUbicacion.textContent = [
        propiedades.ciudad,
        propiedades.pais
    ].filter(Boolean).join(', ');

    popupUrl.href = propiedades.url || '#';

    // Información profesional
    if (experiencia) {

        popupExperiencia.style.display = 'block';

        popupRol.textContent = experiencia.rol || '';
        popupPeriodo.textContent = experiencia.periodo || '';
        popupDescripcion.textContent = experiencia.descripcion || '';

        popupTecnologias.replaceChildren();

        (experiencia.tecnologias || []).forEach(tecnologia => {
            const etiqueta = document.createElement('span');
            etiqueta.className = 'tecnologia-tag';
            etiqueta.textContent = tecnologia;
            popupTecnologias.appendChild(etiqueta);
        });

        popupConocimientos.replaceChildren();

        (experiencia.conocimientos || []).forEach(conocimiento => {
            const etiqueta = document.createElement('span');
            etiqueta.className = 'conocimiento-tag';
            etiqueta.textContent = conocimiento;
            popupConocimientos.appendChild(etiqueta);
        });

    } else {
        popupExperiencia.style.display = 'none';
    }

    popupElement.style.display = 'block';
    popup.setPosition(coordenada);
}


function mostrarGrupoEntidades(entidades, coordenada) {

    // Guardar el grupo para poder regresar al listado
    grupoActual = {
        entidades: entidades,
        coordenada: coordenada
    };

    // Mostrar el listado y ocultar el detalle
    popupGrupo.hidden = false;
    popupDetalle.hidden = true;
    popupUrl.hidden = true;

    popupListaEntidades.replaceChildren();

    entidades.forEach(entidad => {

        const propiedades = entidad.getProperties();

        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'popup-entidad-btn';

        boton.textContent = propiedades.nombre || 'Entidad sin nombre';

        boton.addEventListener('click', function () {
            mostrarDetalleEntidad(entidad, coordenada);
        });

        popupListaEntidades.appendChild(boton);
    });

    popupElement.style.display = 'block';
    popup.setPosition(coordenada);
}

if (popupVolver) {

    popupVolver.addEventListener('click', function () {

        if (grupoActual) {

            mostrarGrupoEntidades(
                grupoActual.entidades,
                grupoActual.coordenada
            );

        }

    });

} else {

    console.error(
        'No se encontró el botón popup-volver en el HTML'
    );

}


// --------------------------------------------------
// 7. MOSTRAR INFORMACIÓN DE LA ENTIDAD
// --------------------------------------------------



map.on('singleclick', function (event) {

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

    // Clic fuera de las entidades
     if (!feature) {
        popup.setPosition(undefined);
        popupElement.style.display = 'none';
        grupoActual = null;
        popupVolver.hidden = true;
        return;
    }

    // Recuperar entidades del cluster
    const entidadesAgrupadas = feature.get('features') || [];

    if (entidadesAgrupadas.length === 0) {
        return;
    }

    // Si hay varias entidades, mostrar el listado
    if (entidadesAgrupadas.length > 1) {

        mostrarGrupoEntidades(
            entidadesAgrupadas,
            feature.getGeometry().getCoordinates()
        );

        return;
    }

    // Si hay una sola entidad, mostrar su ficha
    grupoActual = null;
    mostrarDetalleEntidad(
        entidadesAgrupadas[0],
        feature.getGeometry().getCoordinates()
    );

});



// --------------------------------------------------
// 8. CERRAR POPUP
// --------------------------------------------------


popupClose.addEventListener('click', function () {

    // Cerrar el popup
    popup.setPosition(undefined);
    popupElement.style.display = 'none';

    // Limpiar el grupo seleccionado
    grupoActual = null;

    // Ocultar el botón de volver
    popupVolver.hidden = true;
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
