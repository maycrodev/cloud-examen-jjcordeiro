const statusPartidos = document.getElementById("status-partidos");
const statusPoleras = document.getElementById("status-poleras");
const tableEl = document.getElementById("partidos-table");
const tbodyEl = document.getElementById("partidos-body");
const detalleEl = document.getElementById("partido-detalle");
const polerasGrid = document.getElementById("poleras-grid");
const inputId = document.getElementById("partido-id");
const btnBuscar = document.getElementById("btn-buscar");

const partidosEstaticos = [
  { id: "partido-001", fecha: "2026-06-11", local: "México", visitante: "Sudáfrica", estadio: "Azteca", grupo: "A" },
  { id: "partido-002", fecha: "2026-06-12", local: "Brasil", visitante: "Marruecos", estadio: "MetLife", grupo: "B" },
  { id: "partido-003", fecha: "2026-06-13", local: "Argentina", visitante: "Polonia", estadio: "Hard Rock", grupo: "C" },
  { id: "partido-004", fecha: "2026-06-14", local: "España", visitante: "Japón", estadio: "SoFi", grupo: "D" },
];

const polerasLocales = [
  { archivo: "argentina.svg", pais: "Argentina" },
  { archivo: "brasil.svg", pais: "Brasil" },
  { archivo: "mexico.svg", pais: "México" },
  { archivo: "espana.svg", pais: "España" },
];

function setStatus(el, text) {
  el.textContent = text;
}

function nombrePais(archivo) {
  return archivo.replace(".svg", "").replace(/-/g, " ");
}

function renderPartidos(partidos) {
  tbodyEl.innerHTML = "";
  partidos.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><code>${p.id || "-"}</code></td>
      <td>${p.fecha}</td>
      <td><strong>${p.local}</strong></td>
      <td>${p.visitante}</td>
      <td>${p.estadio}</td>
      <td><span class="badge-grupo">${p.grupo}</span></td>
    `;
    tbodyEl.appendChild(row);
  });
  tableEl.hidden = false;
}

function renderPoleras(poleras) {
  polerasGrid.innerHTML = "";
  poleras.forEach((p) => {
    const nombre = p.pais || nombrePais(p.archivo);
    const imgUrl =
      p.url && p.url !== "#"
        ? p.url
        : `images/poleras/${p.archivo}`;

    const card = document.createElement("div");
    card.className = "polera-card";
    card.innerHTML = `
      <img src="${imgUrl}" alt="Polera ${nombre}" loading="lazy">
      <span>${nombre}</span>
      <a href="${imgUrl}" target="_blank" rel="noreferrer">Ver diseño</a>
    `;
    polerasGrid.appendChild(card);
  });
}

async function cargarPartidos() {
  if (!API_PARTIDOS) {
    setStatus(statusPartidos, "Modo local — completa API_PARTIDOS en config.js (Lab 3)");
    renderPartidos(partidosEstaticos);
    return;
  }

  try {
    const res = await fetch(API_PARTIDOS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setStatus(statusPartidos, "Partidos desde API Gateway ✅");
    renderPartidos(data.partidos || data);
  } catch (err) {
    setStatus(statusPartidos, `Error API: ${err.message}. Mostrando datos locales.`);
    renderPartidos(partidosEstaticos);
  }
}

async function buscarPartido() {
  const id = inputId.value.trim();
  if (!id) return;

  if (!API_PARTIDO_ID) {
    const local = partidosEstaticos.find((p) => p.id === id);
    detalleEl.textContent = local
      ? JSON.stringify(local, null, 2)
      : "Partido no encontrado (modo local)";
    return;
  }

  try {
    const res = await fetch(`${API_PARTIDO_ID}/${id}`);
    const data = await res.json();
    detalleEl.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    detalleEl.textContent = `Error: ${err.message}`;
  }
}

async function cargarPoleras() {
  if (!API_POLERAS) {
    setStatus(statusPoleras, "Modo local — completa API_POLERAS en config.js (Lab 3)");
    renderPoleras(polerasLocales);
    return;
  }

  try {
    const res = await fetch(API_POLERAS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setStatus(statusPoleras, "Poleras desde S3 vía Lambda ✅");
    renderPoleras(data.poleras || []);
  } catch (err) {
    setStatus(statusPoleras, `Error API: ${err.message}. Mostrando imágenes locales.`);
    renderPoleras(polerasLocales);
  }
}

btnBuscar.addEventListener("click", buscarPartido);
inputId.addEventListener("keydown", (e) => {
  if (e.key === "Enter") buscarPartido();
});

cargarPartidos();
cargarPoleras();
