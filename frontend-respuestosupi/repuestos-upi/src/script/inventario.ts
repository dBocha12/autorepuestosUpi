const API = "http://localhost:8000/repuestos/";
const API_CATS = "http://localhost:8000/categorias/";
const API_PROVS = "http://localhost:8000/proveedores/";

export function initInventario() {
  let repuestosData: any[] = [];

  const selFiltroCategoria = document.getElementById("filtroCategoria") as HTMLSelectElement | null;
  const selOrdenarPor = document.getElementById("ordenarPor") as HTMLSelectElement | null;
  const modalDetalle = document.getElementById("modalDetalle") as HTMLElement | null;
  const btnCerrarDetalle = document.getElementById("cerrarDetalle") as HTMLElement | null;
  const modal = document.getElementById("modal") as HTMLElement | null;
  const btnNuevo = document.getElementById("btnNuevo") as HTMLElement | null;
  const btnCancelar = document.getElementById("btnCancelar") as HTMLElement | null;
  const form = document.getElementById("formRepuesto") as HTMLFormElement | null;

  if (!document.getElementById("grid-repuestos") || !modalDetalle || !btnCerrarDetalle || !modal || !btnNuevo || !btnCancelar || !form) {
    console.error("inventario: elementos necesarios no encontrados");
    return;
  }

  async function cargarRepuestos() {
    const res = await fetch(API, { headers: { Accept: "application/json" } });
    const data = await res.json();
    repuestosData = data || [];
    poblarFiltroCategorias(repuestosData);
    aplicarFiltrosYOrden();
  }

  function llenarCards(repuestos: any[]) {
    const cont = document.querySelector("#grid-repuestos") as HTMLElement;
    cont.innerHTML = "";

    if (!repuestos || repuestos.length === 0) {
      cont.innerHTML = `<p style="grid-column: 1/-1; text-align:center; opacity:0.7">Sin repuestos</p>`;
      return;
    }

    repuestos.forEach(r => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
            <h3>${r.nombre}</h3>
            <p>${(r.descripcion ?? "").slice(0, 70)}${r.descripcion?.length > 70 ? "..." : ""}</p>
            <p class="card-price">₡${r.precio}</p>
            <div class="card-meta">
                <span>Stock: ${r.cantidad}</span>
                <span>${r.categoria ?? ""}</span>
            </div>
        `;
      card.addEventListener("click", () => mostrarDetalle(r));
      cont.appendChild(card);
    });
  }

  function poblarFiltroCategorias(repuestos: any[]) {
    if (!selFiltroCategoria) return;
    const categoriasUnicas = Array.from(
      new Set(
        repuestos
          .map((r: any) => r.categoria)
          .filter((c: string | null) => c && c.trim() !== "")
      )
    );
    selFiltroCategoria.innerHTML = `<option value="todos">Todas las categorías</option>`;
    categoriasUnicas.forEach((cat: any) => {
      const opt = document.createElement("option");
      opt.value = String(cat);
      opt.textContent = String(cat);
      selFiltroCategoria.appendChild(opt);
    });
  }

  function aplicarFiltrosYOrden() {
    let lista = [...repuestosData];

    if (selFiltroCategoria && selFiltroCategoria.value !== "todos") {
      const filtro = selFiltroCategoria.value;
      lista = lista.filter(r => r.categoria === filtro);
    }

    if (selOrdenarPor) {
      const [campo, dir] = selOrdenarPor.value.split("-");
      lista.sort((a, b) => {
        let va: any;
        let vb: any;

        if (campo === "nombre") {
          va = (a.nombre ?? "").toString().toLowerCase();
          vb = (b.nombre ?? "").toString().toLowerCase();
          if (va < vb) return dir === "asc" ? -1 : 1;
          if (va > vb) return dir === "asc" ? 1 : -1;
          return 0;
        }

        if (campo === "precio") {
          va = Number(a.precio) || 0;
          vb = Number(b.precio) || 0;
        } else {
          va = Number(a.cantidad) || 0;
          vb = Number(b.cantidad) || 0;
        }

        return dir === "asc" ? va - vb : vb - va;
      });
    }

    llenarCards(lista);
  }

  function mostrarDetalle(r: any) {
    (document.getElementById("detalleNombre") as HTMLElement | null)!.textContent = r.nombre;
    (document.getElementById("detalleDescripcion") as HTMLElement | null)!.textContent = r.descripcion;
    (document.getElementById("detallePrecio") as HTMLElement | null)!.textContent = r.precio;
    (document.getElementById("detalleCategoria") as HTMLElement | null)!.textContent = r.categoria;
    (document.getElementById("detalleProveedor") as HTMLElement | null)!.textContent = r.proveedor;
    (document.getElementById("detalleStock") as HTMLElement | null)!.textContent = r.cantidad;
    (document.getElementById("detalleUbicacion") as HTMLElement | null)!.textContent = r.ubicacion;
    modalDetalle.classList.remove("hidden");
  }

  btnCerrarDetalle.addEventListener("click", () => {
    modalDetalle.classList.add("hidden");
  });

  modalDetalle.addEventListener("click", e => {
    if (e.target === modalDetalle) modalDetalle.classList.add("hidden");
  });

  btnNuevo.addEventListener("click", () => {
    modal.classList.remove("hidden");
    cargarCatalogos().catch(err => {
      console.error(err);
      alert("No se pudieron cargar categorías/proveedores");
    });
  });

  btnCancelar.addEventListener("click", () => {
    modal.classList.add("hidden");
    form.reset();
  });

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      form.reset();
    }
  });

  async function cargarCatalogos() {
    const [catsRes, provRes] = await Promise.all([
      fetch(API_CATS, { headers: { Accept: "application/json" } }),
      fetch(API_PROVS, { headers: { Accept: "application/json" } })
    ]);

    if (!catsRes.ok || !provRes.ok) {
      throw new Error("Error cargando catálogos");
    }

    const categorias = await catsRes.json();
    const proveedores = await provRes.json();

    llenarSelect("inpCategoria", categorias, "id_categoria", "nombre");
    llenarSelect("inpProveedor", proveedores, "id_proveedor", "nombre");
  }

  function llenarSelect(id: string, data: any[], valueKey: string, labelKey: string) {
    const sel = document.getElementById(id) as HTMLSelectElement | null;
    if (!sel) return;
    sel.innerHTML = `<option disabled selected>Seleccione</option>`;
    data.forEach(item => {
      const opt = document.createElement("option");
      opt.value = String(item[valueKey]);
      opt.textContent = item[labelKey];
      sel.appendChild(opt);
    });
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const repuesto = {
      nombre: (document.getElementById("inpNombre") as HTMLInputElement).value,
      descripcion: (document.getElementById("inpDescripcion") as HTMLTextAreaElement).value,
      precio: Number((document.getElementById("inpPrecio") as HTMLInputElement).value),
      id_categoria: Number((document.getElementById("inpCategoria") as HTMLSelectElement).value),
      id_proveedor: Number((document.getElementById("inpProveedor") as HTMLSelectElement).value),
      cantidad: Number((document.getElementById("inpStock") as HTMLInputElement).value),
      ubicacion: (document.getElementById("inpUbicacion") as HTMLInputElement).value
    };

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(repuesto)
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(txt);
      alert("Error al guardar");
      return;
    }

    modal.classList.add("hidden");
    form.reset();
    await cargarRepuestos();
  });

  if (selFiltroCategoria) {
    selFiltroCategoria.addEventListener("change", aplicarFiltrosYOrden);
  }
  if (selOrdenarPor) {
    selOrdenarPor.addEventListener("change", aplicarFiltrosYOrden);
  }

  setTimeout(() => {
    cargarRepuestos().catch(err => {
      console.error(err);
      alert("No se pudieron cargar los repuestos");
    });
  }, 300);
}
