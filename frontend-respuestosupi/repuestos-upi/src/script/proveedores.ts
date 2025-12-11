const API_PROVEEDORES = "http://localhost:8000/proveedores";

interface Proveedor {
  id_proveedor: number;
  nombre: string;
  telefono?: string | null;
  correo?: string | null;
}

export function initProveedores() {
  const listaProveedores = document.getElementById("proveedores-list") as HTMLElement | null;
  const badgeCount = document.getElementById("proveedores-count") as HTMLElement | null;
  const modalProveedor = document.getElementById("modalProveedor") as HTMLElement | null;
  const btnNuevoProveedor = document.getElementById("btnNuevoProveedor") as HTMLButtonElement | null;
  const btnCancelarProveedor = document.getElementById("btnCancelarProveedor") as HTMLButtonElement | null;
  const formProveedor = document.getElementById("formProveedor") as HTMLFormElement | null;

  if (
    !listaProveedores ||
    !badgeCount ||
    !modalProveedor ||
    !btnNuevoProveedor ||
    !btnCancelarProveedor ||
    !formProveedor
  ) {
    console.error("proveedores: elementos necesarios no encontrados");
    return;
  }

  async function cargarProveedores() {
    try {
      const res = await fetch(API_PROVEEDORES, { headers: { Accept: "application/json" } });
      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Error al obtener proveedores");
        return;
      }

      renderProveedores(data);
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  }

function renderProveedores(proveedores: Proveedor[]) {
  listaProveedores.innerHTML = "";

  if (!proveedores || proveedores.length === 0) {
    listaProveedores.innerHTML =
      '<p style="opacity:0.7; text-align:center;">No hay proveedores registrados.</p>';
    badgeCount.textContent = "0 proveedores";
    return;
  }

  badgeCount.textContent = `${proveedores.length} proveedor${
    proveedores.length !== 1 ? "es" : ""
  }`;

  proveedores.forEach(p => {
    const item = document.createElement("div");
    item.className = "proveedor-item";

    const iniciales = (p.nombre || p.correo || "?")
      .split(" ")
      .map(x => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    item.innerHTML = `
      <div class="proveedor-main">
        <div class="proveedor-avatar">${iniciales}</div>
        <div class="proveedor-info">
          <span class="proveedor-nombre">${p.nombre}</span>
          <span class="proveedor-email">${p.correo || ""}</span>
          <span class="proveedor-telefono">${p.telefono || ""}</span>
        </div>
      </div>
      <div class="proveedor-actions">
        <button class="proveedores-btn-delete">ELIMINAR</button>
      </div>
    `;

    const btnDelete = item.querySelector(".proveedores-btn-delete") as HTMLButtonElement;
    btnDelete.addEventListener("click", () => eliminarProveedor(p.id_proveedor)); // 👈 aquí

    listaProveedores.appendChild(item);
  });
}


  btnNuevoProveedor.addEventListener("click", () => {
    modalProveedor.classList.remove("proveedores-modal-hidden");
    formProveedor.reset();
    const inp = document.getElementById("inpNombreProveedor") as HTMLInputElement | null;
    inp?.focus();
  });

  btnCancelarProveedor.addEventListener("click", () => {
    modalProveedor.classList.add("proveedores-modal-hidden");
    formProveedor.reset();
  });

  modalProveedor.addEventListener("click", e => {
    if (e.target === modalProveedor) {
      modalProveedor.classList.add("proveedores-modal-hidden");
      formProveedor.reset();
    }
  });

  formProveedor.addEventListener("submit", async e => {
    e.preventDefault();

    const nombre = (document.getElementById("inpNombreProveedor") as HTMLInputElement).value.trim();
    const telefono = (document.getElementById("inpTelefonoProveedor") as HTMLInputElement).value.trim();
    const correo = (document.getElementById("inpCorreoProveedor") as HTMLInputElement).value.trim();

    if (!nombre) {
      alert("El nombre del proveedor es obligatorio.");
      return;
    }

    try {
      const res = await fetch(API_PROVEEDORES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          telefono: telefono || null,
          correo: correo || null,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        alert("Error al crear proveedor");
        return;
      }

      modalProveedor.classList.add("proveedores-modal-hidden");
      formProveedor.reset();
      await cargarProveedores();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al crear proveedor");
    }
  });

  async function eliminarProveedor(id: number) {
    if (!confirm("¿Seguro que desea eliminar este proveedor?")) return;

    try {
      const res = await fetch(`${API_PROVEEDORES}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        alert("Error al eliminar proveedor");
        return;
      }

      await cargarProveedores();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al eliminar proveedor");
    }
  }

  setTimeout(() => {
    cargarProveedores();
  }, 400);
}
