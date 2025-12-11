const API_CATEGORIAS = "http://localhost:8000/categorias";

interface Categoria {
  id_categoria: number;
  nombre: string;
}

export function initCategorias() {
  const listaCategorias = document.getElementById("categorias-list") as HTMLElement | null;
  const badgeCount = document.getElementById("categorias-count") as HTMLElement | null;
  const modalCategoria = document.getElementById("modalCategoria") as HTMLElement | null;
  const btnNuevaCategoria = document.getElementById("btnNuevaCategoria") as HTMLButtonElement | null;
  const btnCancelarCategoria = document.getElementById("btnCancelarCategoria") as HTMLButtonElement | null;
  const formCategoria = document.getElementById("formCategoria") as HTMLFormElement | null;

  if (
    !listaCategorias ||
    !badgeCount ||
    !modalCategoria ||
    !btnNuevaCategoria ||
    !btnCancelarCategoria ||
    !formCategoria
  ) {
    console.error("categorias: elementos necesarios no encontrados");
    return;
  }

  async function cargarCategorias() {
    try {
      const res = await fetch(API_CATEGORIAS, { headers: { Accept: "application/json" } });
      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Error al obtener categorías");
        return;
      }

      renderCategorias(data);
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  }

  function renderCategorias(categorias: Categoria[]) {
    listaCategorias.innerHTML = "";

    if (!categorias || categorias.length === 0) {
      listaCategorias.innerHTML =
        '<p style="opacity:0.7; text-align:center;">No hay categorías registradas.</p>';
      badgeCount.textContent = "0 categorías";
      return;
    }

    badgeCount.textContent = `${categorias.length} categoría${
      categorias.length !== 1 ? "s" : ""
    }`;

    categorias.forEach(c => {
      const item = document.createElement("div");
      item.className = "categoria-item";
      item.innerHTML = `
        <div class="categoria-main">
          <div class="categoria-info">
            <span>${c.nombre}</span>
          </div>
        </div>
        <div class="categoria-actions">
          <button class="categorias-btn-delete">ELIMINAR</button>
        </div>
      `;

      const btnDelete = item.querySelector(".categorias-btn-delete") as HTMLButtonElement;
      btnDelete.addEventListener("click", () => eliminarCategoria(c.id_categoria));

      listaCategorias.appendChild(item);
    });
  }

  // abrir modal
  btnNuevaCategoria.addEventListener("click", () => {
    modalCategoria.classList.remove("categorias-modal-hidden");
    formCategoria.reset();
    const inp = document.getElementById("inpNombreCategoria") as HTMLInputElement | null;
    inp?.focus();
  });

  // cerrar modal (botón cancelar)
  btnCancelarCategoria.addEventListener("click", () => {
    modalCategoria.classList.add("categorias-modal-hidden");
    formCategoria.reset();
  });

  // cerrar modal clickeando fuera
  modalCategoria.addEventListener("click", e => {
    if (e.target === modalCategoria) {
      modalCategoria.classList.add("categorias-modal-hidden");
      formCategoria.reset();
    }
  });

  // submit crear categoría
  formCategoria.addEventListener("submit", async e => {
    e.preventDefault();

    const nombre = (document.getElementById("inpNombreCategoria") as HTMLInputElement).value.trim();

    if (!nombre) {
      alert("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      const res = await fetch(API_CATEGORIAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        alert("Error al crear categoría");
        return;
      }

      modalCategoria.classList.add("categorias-modal-hidden");
      formCategoria.reset();
      await cargarCategorias();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al crear categoría");
    }
  });

  async function eliminarCategoria(id: number) {
    if (!confirm("¿Seguro que desea eliminar esta categoría?")) return;

    try {
      const res = await fetch(`${API_CATEGORIAS}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error(txt);
        alert("Error al eliminar categoría");
        return;
      }

      await cargarCategorias();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al eliminar categoría");
    }
  }

  setTimeout(() => {
    cargarCategorias();
  }, 400);
}
