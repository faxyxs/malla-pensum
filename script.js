// Datos de ejemplo: materias por semestre y prerequisitos
const pensumData = [
  {
    semestre: "Semestre 1",
    materias: [
      { id: "m1", nombre: "Matemáticas I", desbloqueada: true },
      { id: "m2", nombre: "Introducción a la Programación", desbloqueada: true },
      { id: "m3", nombre: "Química General", desbloqueada: true },
    ],
  },
  {
    semestre: "Semestre 2",
    materias: [
      { id: "m4", nombre: "Matemáticas II", prerequisitos: ["m1"] },
      { id: "m5", nombre: "Estructura de Datos", prerequisitos: ["m2"] },
      { id: "m6", nombre: "Física I", prerequisitos: ["m3"] },
    ],
  },
  {
    semestre: "Semestre 3",
    materias: [
      { id: "m7", nombre: "Algoritmos Avanzados", prerequisitos: ["m5"] },
      { id: "m8", nombre: "Bases de Datos", prerequisitos: ["m5"] },
      { id: "m9", nombre: "Física II", prerequisitos: ["m6"] },
    ],
  },
];

// Estado global
let estado = {
  materiasAprobadas: new Set(),
  notas: {}, // idMateria: texto
  materiaSeleccionada: null,
};

// Elementos del DOM
const pensumDiv = document.getElementById("pensum");
const notesContent = document.getElementById("notesContent");
const notesTextarea = document.getElementById("notesTextarea");
const saveNotesBtn = document.getElementById("saveNotesBtn");

// Función para mostrar mensaje de felicitación
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

// Guardar estado en localStorage
function guardarEstado() {
  localStorage.setItem("pensumEstado", JSON.stringify({
    materiasAprobadas: Array.from(estado.materiasAprobadas),
    notas: estado.notas,
  }));
}

// Cargar estado de localStorage
function cargarEstado() {
  const data = localStorage.getItem("pensumEstado");
  if (data) {
    const obj = JSON.parse(data);
    estado.materiasAprobadas = new Set(obj.materiasAprobadas);
    estado.notas = obj.notas || {};
  }
}

// Verificar si puede desbloquear una materia (prerrequisitos aprobados)
function puedeDesbloquear(materia) {
  if (materia.desbloqueada) return true
