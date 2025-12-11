const API_CLIENTES = "http://localhost:8000/clientes";

declare const Swal: any;

interface Cliente {
  id: number;
  nombre: string;
  telefono?: string | null;
  correo?: string | null;
}

export function initClientes() {
  const listaClientes = document.getElementById("clientes-list") as HTMLElement | null;
  const badgeCount = document.getElementById("clientes-count") as HTMLElement | null;
  const modalCliente = document.getElementById("modalCliente") as HTMLElement | null;
  const btnNuevoCliente = document.getElementById("btnNuevoCliente") as HTMLButtonElement | null;
  const btnCancelarCliente = document.getElementById("btnCancelarCliente") as HTMLButtonElement | null;
  const formCliente = document.getElementById("formCliente") as HTMLFormElement | null;

  if (!listaClientes || !badgeCount || !modalCliente || !btnNuevoCliente || !btnCancelarCliente || !formCliente) {
    console.error("clientes: elementos necesarios no encontrados");
    return;
  }

  async function cargarClientes() {
    try {
      const res = await fetch(API_CLIENTES, { headers: { Accept: "application/json" } });
      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error", data.detail || "Error al obtener clientes", "error");
        return;
      }

      renderClientes(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error de conexión con el servidor", "error");
    }
  }

  function renderClientes(clientes: Cliente[]) {
    listaClientes.innerHTML = "";

    if (!clientes || clientes.length === 0) {
      listaClientes.innerHTML = `<p style="opacity:0.7; text-align:center;">No hay clientes registrados.</p>`;
      badgeCount.textContent = "0 clientes";
      return;
    }

    badgeCount.textContent = `${clientes.length} cliente${clientes.length !== 1 ? "s" : ""}`;

    clientes.forEach(c => {
      const item = document.createElement("div");
      item.className = "usuario-item";

      const baseTexto = c.nombre || c.correo || c.telefono || "?";
      const iniciales = baseTexto
        .split(" ")
        .map(x => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      item.innerHTML = `
        <div class="usuario-main">
          <div class="usuario-avatar">${iniciales}</div>
          <div class="usuario-info">
            <span>${c.nombre}</span>
            <span class="user-email">${c.correo || ""}</span>
            <span class="user-email">${c.telefono || ""}</span>
          </div>
        </div>
        <div class="usuario-actions">
          <button class="btn-delete-user">ELIMINAR</button>
        </div>
      `;

      const btnDelete = item.querySelector(".btn-delete-user") as HTMLButtonElement;
      btnDelete.addEventListener("click", () => eliminarCliente(c.id, c.nombre));

      listaClientes.appendChild(item);
    });
  }

  btnNuevoCliente.addEventListener("click", () => {
    modalCliente.classList.remove("hidden");
    formCliente.reset();
  });

  btnCancelarCliente.addEventListener("click", () => {
    modalCliente.classList.add("hidden");
    formCliente.reset();
  });

  modalCliente.addEventListener("click", e => {
    if (e.target === modalCliente) {
      modalCliente.classList.add("hidden");
      formCliente.reset();
    }
  });

  formCliente.addEventListener("submit", async e => {
    e.preventDefault();

    const nombre = (document.getElementById("inpNombreCliente") as HTMLInputElement).value.trim();
    const telefono = (document.getElementById("inpTelefonoCliente") as HTMLInputElement).value.trim();
    const correo = (document.getElementById("inpCorreoCliente") as HTMLInputElement).value.trim();

    if (!nombre) {
      Swal.fire("Atención", "El nombre es obligatorio.", "warning");
      return;
    }

    try {
      const res = await fetch(API_CLIENTES, {
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
        Swal.fire("Error", "Error al crear cliente", "error");
        return;
      }

      modalCliente.classList.add("hidden");
      formCliente.reset();
      await cargarClientes();
      Swal.fire("Listo", "Cliente creado correctamente", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error de conexión al crear cliente", "error");
    }
  });

  async function eliminarCliente(id: number, nombre: string) {
    const result = await Swal.fire({
      title: "¿Eliminar cliente?",
      text: `Se eliminará a "${nombre}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_CLIENTES}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        Swal.fire("Error", "Error al eliminar cliente", "error");
        return;
      }

      await cargarClientes();
      Swal.fire("Eliminado", "Cliente eliminado correctamente", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error de conexión al eliminar cliente", "error");
    }
  }

  setTimeout(() => {
    cargarClientes();
  }, 400);
}
