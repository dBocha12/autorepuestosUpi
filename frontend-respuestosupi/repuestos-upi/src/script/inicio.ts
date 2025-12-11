const API_VEHICULOS = "http://localhost:8000/vehiculos";

interface Vehiculo {
  id: number; 
  marca: string;
  modelo: string;
  anno: number;
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getGlbPath(v: Vehiculo): string {
  const marca = slugify(v.marca);
  const modelo = slugify(v.modelo);
  return `/assets/vehiculos/${marca}-${modelo}.glb`;
}

export function initInicio() {
  const ctaInventario = document.getElementById("ctaInventario");
  ctaInventario?.addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("btnInventario")?.click();
  });

  const grid = document.getElementById("vehiculos-grid") as HTMLElement | null;
  if (!grid) {
    console.error("inicio: no se encontró #vehiculos-grid");
    return;
  }

  async function cargarVehiculos() {
    try {
      const res = await fetch(API_VEHICULOS, { headers: { Accept: "application/json" } });
      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        grid.innerHTML =
          '<p style="opacity:0.7; text-align:center;">No se pudieron cargar los vehículos.</p>';
        return;
      }

      renderVehiculos(data);
    } catch (err) {
      console.error(err);
      grid.innerHTML =
        '<p style="opacity:0.7; text-align:center;">Error de conexión al cargar vehículos.</p>';
    }
  }

  function renderVehiculos(vehiculos: Vehiculo[]) {
    grid.innerHTML = "";

    if (!vehiculos || vehiculos.length === 0) {
      grid.innerHTML =
        '<p style="opacity:0.7; text-align:center;">Aún no hay vehículos registrados.</p>';
      return;
    }

    vehiculos.forEach(v => {
      const card = document.createElement("button");
      card.className = "vehiculo-card";
      card.type = "button";

      const glbPath = getGlbPath(v);

      card.innerHTML = `
        <div class="vehiculo-3d">
          <model-viewer
            src="${glbPath}"
            alt="${v.marca} ${v.modelo}"
            auto-rotate
            camera-controls
            disable-zoom
            autoplay
            exposure="1.1"
            shadow-intensity="1"
          ></model-viewer>
        </div>
        <div class="vehiculo-info">
          <h3>${v.marca} ${v.modelo}</h3>
          <p>Año ${v.anno}</p>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  cargarVehiculos();
}
