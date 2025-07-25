// Estado global
let estado = {
  pensum: [], // Array de semestres { semestre: string, materias: [{id, nombre, aprobada, desbloqueada}] }
  materiasAprobadas: new Set(),
  notas: {}, // idMateria: texto
  materiaSeleccionada: null,
};

// Elementos DOM
const pensumDiv = document.getElementById("pensum");
const notesContent = document.getElementById("notesContent");
const notesTextarea = document.getElementById("notesTextarea");
const saveNotesBtn = document.getElementById("saveNotesBtn");
const addSemestreBtn = document.getElementById("addSemestreBtn");

const modalAddMateria = document.getElementById("modalAddMateria");
const nombreMateriaInput = document.getElementById("nombreMateriaInput");
const guardarMateriaBtn = document.getElementById("guardarMateriaBtn");
const cerrarModalBtn = document.getElementById("cerrarModalBtn");

// Cargar estado de localStorage
function cargarEstado() {
  const data = localStorage.getItem("pensumEstado");
  if (data) {
    const obj = JSON.parse(data);
    estado.pensum = obj.pensum || [];
    estado.materiasAprobadas = new Set(obj.materiasAprobadas || []);
    estado.notas = obj.notas || {};
  } else {
    // Si no hay datos, iniciar con 1 semestre vacío para facilitar
    estado.pensum = [
      {
        semestre: "Semestre 1",
        materias: [],
      },
    ];
  }
}

// Guardar estado en localStorage
function guardarEstado() {
  localStorage.setItem(
    "pensumEstado",
    JSON.stringify({
      pensum: estado.pensum,
      materiasAprobadas: Array.from(estado.materiasAprobadas),
      notas: estado.notas,
    })
  );
}

// Crear un ID único para materias
function crearIdMateria(nombre, semestreIndex) {
  // ej: m_sem1_Matematicas_I (sin espacios)
  return (
    "m_sem" +
    (semestreIndex + 1) +
    "_" +
    nombre.trim().toLowerCase().replace(/\s+/g, "_")
  );
}

// Renderizar la malla pensum
function renderPensum() {
  pensumDiv.innerHTML = "";

  estado.pensum.forEach((semestreData, semIndex) => {
    const semestreDiv = document.createElement("div");
    semestreDiv.classList.add("semestre");

    const tituloSemestre = document.createElement("div");
    tituloSemestre.classList.add("semestre-title");
    tituloSemestre.textContent = semestreData.semestre;
    semestreDiv.appendChild(tituloSemestre);

    // Materias
    semestreData.materias.forEach((materia) => {
      const matDiv = document.createElement("div");
      matDiv.classList.add("materia");

      // ID para la materia (si no tiene, se genera)
      if (!materia.id) {
        materia.id = crearIdMateria(materia.nombre, semIndex);
      }

      matDiv.dataset.id = materia.id;
      matDiv.textContent = materia.nombre;

      // Estado: aprobada, bloqueada
      if (estado.materiasAprobadas.has(materia.id)) {
        matDiv.classList.add("aprobada");
        // Agregar icono check
        const icon = document.createElement("i");
        icon.classList.add("fa", "fa-check-circle");
        matDiv.appendChild(icon);
      }

      // Bloqueo: si no está desbloqueada y no es semestre 0 (si quieres lógica)
      if (materia.bloqueada) {
        matDiv.classList.add("bloqueada");
      }

      // Click para seleccionar materia (solo si no bloqueada)
      if (!matDiv.classList.contains("bloqueada")) {
        matDiv.addEventListener("click", () => {
          seleccionarMateria(materia.id);
        });

        // Click para aprobar / desaprobar con Ctrl + click o doble click
        matDiv.addEventListener("dblclick", () => {
          toggleAprobacionMateria(materia.id);
        });
      }

      semestreDiv.appendChild(matDiv);
    });

    // Botón para añadir materia en este semestre
    const addMatBtn = document.createElement("div");
    addMatBtn.classList.add("add-materia-btn");
    addMatBtn.innerHTML = '<i class="fa fa-plus"></i> Añadir materia';
    addMatBtn.addEventListener("click", () => {
      abrirModalAddMateria(semIndex);
    });
    semestreDiv.appendChild(addMatBtn);

    pensumDiv.appendChild(semestreDiv);
  });
}

// Abrir modal para añadir materia
let semestreParaAgregar = null;
function abrirModalAddMateria(semIndex) {
  semestreParaAgregar = semIndex;
  nombreMateriaInput.value = "";
  modalAddMateria.classList.remove("hidden");
  nombreMateriaInput.focus();
}

// Cerrar modal
function cerrarModal() {
  modalAddMateria.classList.add("hidden");
  semestreParaAgregar = null;
}

// Añadir materia al semestre
function agregarMateria() {
  const nombre = nombreMateriaInput.value.trim();
  if (!nombre) {
    alert("Por favor, escribe el nombre de la materia.");
    return;
  }
  if (semestreParaAgregar === null) return;

  const idMateria = crearIdMateria(nombre, semestreParaAgregar);

  // Evitar materias con mismo ID
  const existe = estado.pensum[semestreParaAgregar].materias.some(
    (m) => m.id === idMateria
  );
  if (existe) {
    alert("Ya existe una materia con ese nombre en este semestre.");
    return;
  }

  estado.pensum[semestreParaAgregar].materias.push({
    id: idMateria,
    nombre,
  });

  guardarEstado();
  renderPensum();
  cerrarModal();
}

// Seleccionar materia para ver/agregar notas
function seleccionarMateria(id) {
  estado.materiaSeleccionada = id;
  const materia = buscarMateriaPorId(id);
  if (!materia) return;

  notesContent.textContent = `Notas para "${materia.nombre}":`;
  notesTextarea.value = estado.notas[id] || "";
}

// Guardar notas de la materia actual
saveNotesBtn.addEventListener("click", () => {
  if (!estado.materiaSeleccionada) {
    alert("Selecciona una materia primero.");
    return;
  }
  estado.notas[estado.materiaSeleccionada] = notesTextarea.value.trim();
  guardarEstado();
  alert("Notas guardadas.");
});

// Buscar materia por ID
function buscarMateriaPorId(id) {
  for (const semestre of estado.pensum) {
    for (const materia of semestre.materias) {
      if (materia.id === id) return materia;
    }
  }
  return null;
}

// Aprobar o desaprobar materia
function toggleAprobacionMateria(id) {
  if (estado.materiasAprobadas.has(id)) {
    estado.materiasAprobadas.delete(id);
  } else {
    estado.materiasAprobadas.add(id);
    mostrarMensaje(`¡Felicidades! Aprobaste "${buscarMateriaPorId(id).nombre}"`);
  }
  guardarEstado();
  renderPensum();
}

// Mostrar mensaje de felicitación temporal
function mostrarMensaje(texto) {
  let msg = document.getElementById("mensajeFelicitacion");
  if (!msg) {
    msg = document.createElement("div");
    msg.id = "mensajeFelicitacion";
    document.body.appendChild(msg);
  }
  msg.textContent = texto;
  msg.classList.add("show");
  setTimeout(() => {
    msg.classList.remove("show");
  }, 3000);
}

// Añadir semestre
addSemestreBtn.addEventListener("click", () => {
  const numNuevoSemestre = estado.pensum.length + 1;
  estado.pensum.push({
    semestre: `Semestre ${numNuevoSemestre}`,
    materias: [],
  });
  guardarEstado();
  renderPensum();
});

// Botones del modal
guardarMateriaBtn.addEventListener("click", agregarMateria);
cerrarModalBtn.addEventListener("click", cerrarModal);

// Cerrar modal con Esc
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cerrarModal();
  }
});

// Al cargar la página
cargarEstado();
renderPensum();
