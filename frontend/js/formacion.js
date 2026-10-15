
/* ==========================================
   FORMACIÓN Y TRABAJOS ACADÉMICOS
   ========================================== */

const API_FORMACIONES =
    'http://127.0.0.1:8000/api/formaciones/';

const API_TRABAJOS =
    'http://127.0.0.1:8000/api/trabajos-academicos/';

const formacionesContainer =
    document.getElementById('formaciones-container');

async function cargarFormaciones() {
    try {
        // Consultar ambos endpoints
        const [respuestaFormaciones, respuestaTrabajos] =
            await Promise.all([
                fetch(API_FORMACIONES),
                fetch(API_TRABAJOS)
            ]);

        if (!respuestaFormaciones.ok || !respuestaTrabajos.ok) {
            throw new Error('Error al consultar la API de Django');
        }

        const datosFormaciones = await respuestaFormaciones.json();
        const datosTrabajos = await respuestaTrabajos.json();

        // Organizar los trabajos por formación
        const trabajosPorFormacion = new Map();

        datosTrabajos.trabajos.forEach(trabajo => {
            const idFormacion = Number(trabajo.formacion_id);

            if (!trabajosPorFormacion.has(idFormacion)) {
                trabajosPorFormacion.set(idFormacion, []);
            }

            trabajosPorFormacion.get(idFormacion).push(trabajo);
        });

        formacionesContainer.replaceChildren();

        // Crear las tarjetas académicas
        datosFormaciones.formaciones.forEach(formacion => {

            const tarjeta = document.createElement('article');
            tarjeta.className = 'education-card';

            const tipo = document.createElement('span');
            tipo.className = 'education-type';
            tipo.textContent = formacion.tipo || '';

            const titulo = document.createElement('h3');
            titulo.textContent = formacion.titulo || '';

            const institucion = document.createElement('p');
            institucion.className = 'education-institution';
            institucion.textContent = formacion.institucion || '';

            const periodo = document.createElement('p');
            periodo.className = 'education-period';
            periodo.textContent = formacion.periodo || '';

            const ubicacion = document.createElement('p');
            ubicacion.className = 'education-location';
            ubicacion.textContent = [
                formacion.ciudad,
                formacion.pais
            ].filter(Boolean).join(', ');

            tarjeta.append(
                tipo,
                titulo,
                institucion,
                periodo,
                ubicacion
            );

            // Añadir trabajos asociados a la formación
            const trabajos =
                trabajosPorFormacion.get(Number(formacion.id)) || [];

            if (trabajos.length > 0) {

                const seccionTrabajos = document.createElement('div');
                seccionTrabajos.className = 'education-works';

                trabajos.forEach(trabajo => {

                    const bloque = document.createElement('div');
                    bloque.className = 'education-work';

                    const etiqueta = document.createElement('h4');
                    etiqueta.textContent = trabajo.tipo || 'Trabajo académico';

                    const tituloTrabajo = document.createElement('p');
                    tituloTrabajo.className = 'education-work-title';
                    tituloTrabajo.textContent = trabajo.titulo || '';

                    bloque.append(etiqueta, tituloTrabajo);

                    
                    // Descripción desplegable del trabajo académico
                    if (trabajo.descripcion && trabajo.descripcion.trim()) {
                    
                        const detalles = document.createElement('details');
                        detalles.className = 'education-work-details';
                    
                        const resumen = document.createElement('summary');
                        resumen.textContent = 'Ver detalles del trabajo';
                    
                        const descripcion = document.createElement('p');
                        descripcion.className = 'education-work-description';
                        descripcion.textContent = trabajo.descripcion;
                    
                        detalles.append(resumen, descripcion);
                        bloque.appendChild(detalles);
                    }


                    
                    // Tecnologías utilizadas en el trabajo académico
                    if (trabajo.tecnologias && trabajo.tecnologias.length > 0) {
                    
                        const tituloTecnologias = document.createElement('h5');
                        tituloTecnologias.className = 'education-work-subtitle';
                        tituloTecnologias.textContent = 'Tecnologías utilizadas';
                    
                        const contenedorTecnologias = document.createElement('div');
                        contenedorTecnologias.className = 'education-work-tags';
                    
                        trabajo.tecnologias.forEach(tecnologia => {
                            const etiquetaTecnologia = document.createElement('span');
                            etiquetaTecnologia.className = 'tecnologia-tag';
                            etiquetaTecnologia.textContent = tecnologia;
                            contenedorTecnologias.appendChild(etiquetaTecnologia);
                        });
                    
                        bloque.append(tituloTecnologias, contenedorTecnologias);
                    }

                    // Conocimientos aplicados
                    if (trabajo.conocimientos && trabajo.conocimientos.length > 0) {
                    
                        const tituloConocimientos = document.createElement('h5');
                        tituloConocimientos.className = 'education-work-subtitle';
                        tituloConocimientos.textContent = 'Conocimientos aplicados';
                    
                        const contenedorConocimientos = document.createElement('div');
                        contenedorConocimientos.className = 'education-work-tags';
                    
                        trabajo.conocimientos.forEach(conocimiento => {
                            const etiquetaConocimiento = document.createElement('span');
                            etiquetaConocimiento.className = 'conocimiento-tag';
                            etiquetaConocimiento.textContent = conocimiento;
                            contenedorConocimientos.appendChild(etiquetaConocimiento);
                        });
                    
                        bloque.append(tituloConocimientos, contenedorConocimientos);
                    }


                    if (trabajo.anio) {
                        const anio = document.createElement('span');
                        anio.className = 'education-work-year';
                        anio.textContent = String(trabajo.anio);
                        bloque.appendChild(anio);
                    }

                    if (trabajo.url) {
                        const enlace = document.createElement('a');
                        enlace.href = trabajo.url;
                        enlace.target = '_blank';
                        enlace.rel = 'noopener noreferrer';
                        enlace.textContent = 'Ver trabajo académico ↗';
                        enlace.className = 'education-work-link';
                        bloque.appendChild(enlace);
                    }

                    seccionTrabajos.appendChild(bloque);
                });

                tarjeta.appendChild(seccionTrabajos);
            }

            formacionesContainer.appendChild(tarjeta);
        });

        console.log('Formaciones:', datosFormaciones.formaciones);
        console.log('Trabajos académicos:', datosTrabajos.trabajos);

    } catch (error) {
        console.error('Error al cargar formación académica:', error);

        formacionesContainer.textContent =
            'No se pudo cargar la formación académica.';
    }
}

cargarFormaciones();
