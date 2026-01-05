let cursosPlanificados = [];
const CREDITOS_MAX = 22;

fetch("data/malla.json")
  .then(res => res.json())
  .then(data => renderMalla(data));

function renderMalla(malla) {
  const contenedor = document.getElementById("malla");

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
      cursoDiv.className = "curso";
      cursoDiv.textContent = curso.nombre;

      // Electivo
      if (curso.electivo) {
        cursoDiv.classList.add("electivo");
      }

      // Doble clic → agregar al plan
      cursoDiv.addEventListener("dblclick", () => {
        agregarCurso(curso);
      });

      cursosDiv.appendChild(cursoDiv);
    });

    semDiv.appendChild(cursosDiv);
    contenedor.appendChild(semDiv);
  });
}

function agregarCurso(curso) {
  if (cursosPlanificados.includes(curso)) return;

  cursosPlanificados.push({
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

  cursosPlanificados.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.nombre} (${c.creditos} cr)`;
    lista.appendChild(li);
    total += c.creditos;
  });

  totalSpan.textContent = total;
  totalSpan.style.color = total > CREDITOS_MAX ? "red" : "green";
}
