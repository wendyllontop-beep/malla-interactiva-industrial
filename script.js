let cursosAprobados = new Set();
let cursosPlanificados = [];
let electivosElegidosPorSemestre = {}; // { "X": "cursoID" }

const CREDITOS_MAX = 22;

fetch("./data/malla.json")
  .then(res => res.json())
  .then(malla => renderMalla(malla))
  .catch(err => console.error("Error cargando malla:", err));

function renderMalla(malla) {
  const contenedor = document.getElementById("malla");
  contenedor.innerHTML = "";

  Object.keys(malla).forEach(sem => {
    const semDiv = document.createElement("div");
    semDiv.className = "semestre";
    semDiv.dataset.semestre = sem;

    const titulo = document.createElement("h2");
    titulo.textContent = `Semestre ${sem}`;
    semDiv.appendChild(titulo);

    const cursosDiv = document.createElement("div");
    cursosDiv.className = "cursos";

    malla[sem].forEach(curso => {
      const div = document.createElement("div");
      div.classList.add("curso");
      div.dataset.id = curso.id;
      div.dataset.semestre = sem;
      div.textContent = curso.nombre;

      if (curso.electivo) div.classList.add("electivo");

      actualizarEstadoCurso(curso, div, sem);

      // CLICK → aprobar / desaprobar
      div.addEventListener("click", () => {
        if (div.classList.contains("bloqueado") || div.classList.contains("descartado")) return;

        const yaAprobado = cursosAprobados.has(curso.id);

        if (yaAprobado) {
          cursosAprobados.delete(curso.id);

          // liberar electivos del semestre
          if (curso.electivo) {
            delete electivosElegidosPorSemestre[sem];
          }
        } else {
          cursosAprobados.add(curso.id);

          // si es electivo → descartar los demás del semestre
          if (curso.electivo) {
            electivosElegidosPorSemestre[sem] = curso.id;
          }
        }

        document.querySelectorAll(".curso").forEach(c => {
          const data = buscarCurso(malla, c.dataset.id);
          actualizarEstadoCurso(data, c, c.dataset.semestre);
        });
      });

      // DOBLE CLICK → planificador
      div.addEventListener("dblclick", () => {
        if (div.classList.contains("disponible")) agregarCurso(curso);
      });

      cursosDiv.appendChild(div);
    });

    semDiv.appendChild(cursosDiv);
    contenedor.appendChild(semDiv);
  });
}

function actualizarEstadoCurso(curso, div, semestre) {
  div.classList.remove("bloqueado", "disponible", "aprobado", "descartado");

  // electivo descartado
  if (
    curso.electivo &&
    electivosElegidosPorSemestre[semestre] &&
    electivosElegidosPorSemestre[semestre] !== curso.id
  ) {
    div.classList.add("descartado");
    return;
  }

  const cumpleReq = curso.req.every(r => cursosAprobados.has(r));

  if (cursosAprobados.has(curso.id)) {
    div.classList.add("aprobado");
  } else if (cumpleReq) {
    div.classList.add("disponible");
  } else {
    div.classList.add("bloqueado");
  }

  if (curso.req.length > 0) {
    div.title = "Prerrequisitos: " + curso.req.join(", ");
  }
}

function buscarCurso(malla, id) {
  for (const sem in malla) {
    const curso = malla[sem].find(c => c.id === id);
    if (curso) return curso;
  }
  return null;
}

/* ===== PLANIFICADOR ===== */

function agregarCurso(curso) {
  if (cursosPlanificados.some(c => c.id === curso.id)) return;

  cursosPlanificados.push({
    id: curso.id,
    nombre: curso.nombre,
    creditos: curso.creditos || 3
  });

  actualizarPlanificador();
}

function actualizarPlanificador() {
  const lista = document.getElementById("lista-plan");
  const totalSpan = document.getElementById("total-creditos");

  lista.innerHTML = "";
  let total = 0;

  cursosPlanificados.forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = `${c.nombre} (${c.creditos} cr)`;

    const x = document.createElement("span");
    x.textContent = "✖";
    x.className = "btn-eliminar";
    x.onclick = () => {
      cursosPlanificados.splice(i, 1);
      actualizarPlanificador();
    };

    li.appendChild(x);
    lista.appendChild(li);
    total += c.creditos;
  });

  totalSpan.textContent = total;
  totalSpan.style.color = total > CREDITOS_MAX ? "red" : "green";
}
