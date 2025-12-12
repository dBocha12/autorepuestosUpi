const API_USERS = "http://localhost:8000/auth/usuarios";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export function initAdministracion() {
  const listaUsuarios = document.getElementById("usuarios-list") as HTMLElement | null;
  const badgeCount = document.getElementById("usuarios-count") as HTMLElement | null;
  const modalUsuario = document.getElementById("modalUsuario") as HTMLElement | null;
  const btnNuevoUsuario = document.getElementById("btnNuevoUsuario") as HTMLButtonElement | null;
  const btnCancelarUsuario = document.getElementById("btnCancelarUsuario") as HTMLButtonElement | null;
  const formUsuario = document.getElementById("formUsuario") as HTMLFormElement | null;

  if (!listaUsuarios || !badgeCount || !modalUsuario || !btnNuevoUsuario || !btnCancelarUsuario || !formUsuario) {
    console.error("administracion: elementos necesarios no encontrados");
    return;
  }

  async function cargarUsuarios() {
    try {
      const res = await fetch(API_USERS, { headers: { Accept: "application/json" } });
      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error", data.detail || "Error al obtener usuarios", "error");
        return;
      }

      renderUsuarios(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error de conexión con el servidor", "error");
    }
  }

  function renderUsuarios(usuarios: Usuario[]) {
    listaUsuarios.innerHTML = "";

    if (!usuarios || usuarios.length === 0) {
      listaUsuarios.innerHTML = `<p style="opacity:0.7; text-align:center;">No hay usuarios registrados.</p>`;
      badgeCount.textContent = "0 usuarios";
      return;
    }

    badgeCount.textContent = `${usuarios.length} usuario${usuarios.length !== 1 ? "s" : ""}`;

    usuarios.forEach(u => {
      const item = document.createElement("div");
      item.className = "usuario-item";

      const iniciales = (u.nombre || u.email || "?")
        .split(" ")
        .map(x => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const rolClass = u.rol === "admin" ? "user-role-admin" : "user-role-vendedor";
      const rolLabel = u.rol === "admin" ? "ADMINISTRADOR" : "VENDEDOR";

      item.innerHTML = `
        <div class="usuario-main">
            <div class="usuario-avatar">${iniciales}</div>
            <div class="usuario-info">
                <span>${u.nombre}</span>
                <span class="user-email">${u.email}</span>
            </div>
        </div>
        <div class="usuario-actions">
            <span class="user-role-badge ${rolClass}">${rolLabel}</span>
            <button class="btn-delete-user">ELIMINAR</button>
        </div>
      `;

      const btnDelete = item.querySelector(".btn-delete-user") as HTMLButtonElement;
      btnDelete.addEventListener("click", () => eliminarUsuario(u.id));

      listaUsuarios.appendChild(item);
    });
  }

  btnNuevoUsuario.addEventListener("click", () => {
    modalUsuario.classList.remove("hidden");
    formUsuario.reset();
  });

  btnCancelarUsuario.addEventListener("click", () => {
    modalUsuario.classList.add("hidden");
    formUsuario.reset();
  });

  modalUsuario.addEventListener("click", e => {
    if (e.target === modalUsuario) {
      modalUsuario.classList.add("hidden");
      formUsuario.reset();
    }
  });

  formUsuario.addEventListener("submit", async e => {
    e.preventDefault();

    const nombre = (document.getElementById("inpNombreUser") as HTMLInputElement).value.trim();
    const email = (document.getElementById("inpEmailUser") as HTMLInputElement).value.trim();
    const password = (document.getElementById("inpPasswordUser") as HTMLInputElement).value;
    const rol = (document.getElementById("inpRolUser") as HTMLSelectElement).value;

    if (!nombre || !email || !password) {
      Swal.fire("Campos incompletos", "Complete todos los campos.", "warning");
      return;
    }

    try {
      const res = await fetch(API_USERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, rol })
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        Swal.fire("Error", "Error al crear usuario", "error");
        return;
      }

      Swal.fire("Éxito", "Usuario creado correctamente", "success");
      modalUsuario.classList.add("hidden");
      formUsuario.reset();
      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error de conexión al crear usuario", "error");
    }
  });

  async function eliminarUsuario(id: number) {
    const confirm = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_USERS}/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        Swal.fire("Error", "Error al eliminar usuario", "error");
        return;
      }

      Swal.fire("Eliminado", "El usuario ha sido eliminado", "success");
      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error de conexión al eliminar usuario", "error");
    }
  }

  setTimeout(() => {
    cargarUsuarios();
  }, 400);
}
