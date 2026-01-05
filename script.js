let cursosAprobados = new Set();
let cursosPlanificados = [];
const CREDITOS_MAX = 22;

fetch("data/malla.json")
  .then(res => res.json())
  .then(data => renderMalla(data));

function renderMalla(malla) {
  const contenedor = document.getElementById("malla");
  contenedor.innerHTML = "";

  Object.keys(malla).forEach(sem => {
    const semDiv = document.createElement("div");
    semDiv.className = "semestre";

    const titulo = document.createElement("h2");
    titulo.textContent = `Semestre ${sem}`;
    semDiv.appendChild(titulo);

    const cursosDiv = document.createElement("div");
    cursosDiv.className = "cursos";

    malla[sem].forEach(curso => {
      const cursoDiv = document.createElement("div");
      cursoDiv.classList.add("curso");
      cursoDiv.dataset.id = curso.id;
      cursoDiv.textContent = curso.nombre;

      if (curso.electivo) {
        cursoDiv.classList.add("electivo");
      }

      actualizarEstadoCurso(curso, cursoDiv);

      // Click → aprobar / desaprobar
      cursoDiv.addEventListener("click", () => {
        if (cursoDiv.classList.contains("bloqueado")) return;

        if (cursosAprobados.has(curso.id)) {
          cursosAprobados.delete(curso.id);
        } else {
          cursosAprobados.add(curso.id);
        }

        document.querySelectorAll(".curso").forEach(div => {
          const id = div.dataset.id;
          const cursoData = buscarCursoPorId(malla, id);
          if (cursoData) actualizarEstadoCurso(cursoData, div);
        });
      });

      // Doble click → agregar al plan
      cursoDiv.addEventListener("dblclick", () => {
        if (!cursoDiv.classList.contains("disponible")) return;
        agregarCurso(curso);
      });

      cursosDiv.appendChild(cursoDiv);
    });

    semDiv.appendChild(cursosDiv);
    contenedor.appendChild(semDiv);
  });
}

function actualizarEstadoCurso(curso, div) {
  div.classList.remove("bloqueado", "disponible", "aprobado");

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

function buscarCursoPorId(malla, id) {
  for (const sem in malla) {
    const curso = malla[sem].find(c => c.id === id);
    if (curso) return curso;
  }
  return null;
}

/* ====== PLANIFICADOR ====== */

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

  cursosPlanificados.forEach((c, index) => {
    const li = document.createElement("li");
    li.textContent = `${c.nombre} (${c.creditos} cr)`;

    const btnEliminar = document.createElement("span");
    btnEliminar.textContent = "✖";
    btnEliminar.className = "btn-eliminar";
    btnEliminar.addEventListener("click", () => {
      cursosPlanificados.splice(index, 1);
      actualizarPlanificador();
    });

    li.appendChild(btnEliminar);
    lista.appendChild(li);
    total += c.creditos;
  });

  totalSpan.textContent = total;
  totalSpan.style.color = total > CREDITOS_MAX ? "red" : "green";
}
  totalSpan.style.color = total > CREDITOS_MAX ? "red" : "green";
}
