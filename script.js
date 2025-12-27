let aprobados = JSON.parse(localStorage.getItem("aprobados")) || [];

fetch("data/malla.json")
  .then(response => response.json())
  .then(data => dibujarMalla(data));

function dibujarMalla(data) {
  const contenedor = document.getElementById("malla");
  contenedor.innerHTML = "";

  Object.keys(data).forEach(semestre => {
    const bloqueSemestre = document.createElement("div");
    bloqueSemestre.className = "semestre";

    const titulo = document.createElement("h2");
    titulo.textContent = `Semestre ${semestre}`;
    bloqueSemestre.appendChild(titulo);

    data[semestre].forEach(curso => {
      const divCurso = document.createElement("div");
      divCurso.className = "curso";
      divCurso.textContent = curso.nombre;

      const desbloqueado = curso.req.every(r => aprobados.includes(r));

      if (!desbloqueado) {
        divCurso.classList.add("bloqueado");
      }

      if (aprobados.includes(curso.id)) {
        divCurso.classList.add("aprobado");
      }

      divCurso.addEventListener("click", () => {
        if (!desbloqueado) return;

        if (aprobados.includes(curso.id)) {
          aprobados = aprobados.filter(id => id !== curso.id);
        } else {
          aprobados.push(curso.id);
        }

        localStorage.setItem("aprobados", JSON.stringify(aprobados));
        dibujarMalla(data);
      });

      bloqueSemestre.appendChild(divCurso);
    });

    contenedor.appendChild(bloqueSemestre);
  });
}
