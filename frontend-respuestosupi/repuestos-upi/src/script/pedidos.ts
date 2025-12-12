const API_PEDIDOS = "http://localhost:8000/pedidos/";
const API_CLIENTES = "http://localhost:8000/clientes/";
const API_REPUESTOS = "http://localhost:8000/repuestos/";

interface PedidoResumen {
  id_pedido: number;
  fecha: string;
  total: number;
  id_cliente: number;
  cliente_nombre: string;
  cantidad_items: number;
}

interface PedidoDetalleItem {
  id_repuesto: number;
  cantidad: number;
}

interface Cliente {
  id_cliente: number;
  nombre: string;
  telefono?: string;
  correo?: string;
}


interface Repuesto {
  id_repuesto: number;
  nombre: string;
  precio: number;
}

export function initPedidos() {
  const listaPedidos = document.getElementById("pedidos-list") as HTMLElement | null;
  const badgeCount = document.getElementById("pedidos-count") as HTMLElement | null;
  const modalPedido = document.getElementById("modalPedido") as HTMLElement | null;
  const btnNuevoPedido = document.getElementById("btnNuevoPedido") as HTMLButtonElement | null;
  const btnCancelarPedido = document.getElementById("btnCancelarPedido") as HTMLButtonElement | null;
  const formPedido = document.getElementById("formPedido") as HTMLFormElement | null;

  const selectCliente = document.getElementById("inpPedidoCliente") as HTMLSelectElement | null;
  const itemsContainer = document.getElementById("pedidoItemsContainer") as HTMLElement | null;
  const btnAgregarLinea = document.getElementById("btnAgregarLinea") as HTMLButtonElement | null;
  const totalPreview = document.getElementById("pedidoTotalPreview") as HTMLElement | null;

  if (!listaPedidos || !badgeCount || !modalPedido || !btnNuevoPedido || !btnCancelarPedido || !formPedido || !selectCliente || !itemsContainer || !btnAgregarLinea || !totalPreview) {
    console.error("pedidos: elementos necesarios no encontrados");
    return;
  }

  let clientes: Cliente[] = [];
  let repuestos: Repuesto[] = [];

async function cargarClientesYRepuestos() {
  try {
    const [resCli, resRep] = await Promise.all([
      fetch(API_CLIENTES, { headers: { Accept: "application/json" } }),
      fetch(API_REPUESTOS, { headers: { Accept: "application/json" } }),
    ]);
    const dataCli = await resCli.json();
    const dataRep = await resRep.json();

    if (!resCli.ok || !resRep.ok) {
      console.error("Error al cargar clientes o repuestos", dataCli, dataRep);
      return;
    }

    clientes = (dataCli as any[]).map(c => ({
      id_cliente: c.id_cliente ?? c.id ?? c.idCliente,
      nombre: c.nombre,
      telefono: c.telefono,
      correo: c.correo,
    })).filter(c => c.id_cliente != null);

    repuestos = (dataRep as any[]).map(r => ({
      id_repuesto: r.id_repuesto ?? r.id ?? r.idRepuesto,
      nombre: r.nombre,
      precio: Number(r.precio ?? r.costo ?? 0),
    }));

    llenarSelectClientes();
  } catch (err) {
    console.error(err);
  }
}


    function llenarSelectClientes() {
    selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';
    clientes.forEach(c => {
        const opt = document.createElement("option");
        opt.value = String(c.id_cliente); 
        opt.textContent = c.nombre;
        selectCliente.appendChild(opt);
    });
    }


  function crearFilaItem() {
    const row = document.createElement("div");
    row.className = "pedido-item-row";

    const sel = document.createElement("select");
    sel.className = "item-repuesto";
    sel.innerHTML = '<option value="">Repuesto...</option>';
    repuestos.forEach(r => {
      const opt = document.createElement("option");
      opt.value = String(r.id_repuesto);
      opt.textContent = r.nombre;
      sel.appendChild(opt);
    });

    const inpCant = document.createElement("input");
    inpCant.type = "number";
    inpCant.min = "1";
    inpCant.value = "1";
    inpCant.className = "item-cantidad";

    const btnQuitar = document.createElement("button");
    btnQuitar.type = "button";
    btnQuitar.textContent = "X";

    btnQuitar.addEventListener("click", () => {
      row.remove();
      actualizarTotalPreview();
    });

    sel.addEventListener("change", actualizarTotalPreview);
    inpCant.addEventListener("input", actualizarTotalPreview);

    row.appendChild(sel);
    row.appendChild(inpCant);
    row.appendChild(btnQuitar);

    itemsContainer.appendChild(row);
    actualizarTotalPreview();
  }

  function actualizarTotalPreview() {
    let total = 0;
    const filas = itemsContainer.querySelectorAll(".pedido-item-row");
    filas.forEach(row => {
      const sel = row.querySelector(".item-repuesto") as HTMLSelectElement | null;
      const inpCant = row.querySelector(".item-cantidad") as HTMLInputElement | null;
      if (!sel || !inpCant) return;
      const idRep = Number(sel.value);
      const cant = Number(inpCant.value) || 0;
      if (!idRep || cant <= 0) return;
      const rep = repuestos.find(r => r.id_repuesto === idRep);
      if (!rep) return;
      total += rep.precio * cant;
    });
    totalPreview.textContent = `₡${total.toFixed(2)}`;
  }

  async function cargarPedidos() {
    try {
      const res = await fetch(API_PEDIDOS, { headers: { Accept: "application/json" } });
      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        listaPedidos.innerHTML = '<p style="opacity:0.7; text-align:center;">No se pudieron cargar los pedidos.</p>';
        badgeCount.textContent = "0 pedidos";
        return;
      }

      renderPedidos(data);
    } catch (err) {
      console.error(err);
      listaPedidos.innerHTML = '<p style="opacity:0.7; text-align:center;">Error de conexión.</p>';
      badgeCount.textContent = "0 pedidos";
    }
  }

  function renderPedidos(pedidos: PedidoResumen[]) {
    listaPedidos.innerHTML = "";

    if (!pedidos || pedidos.length === 0) {
      listaPedidos.innerHTML = '<p style="opacity:0.7; text-align:center;">No hay pedidos registrados.</p>';
      badgeCount.textContent = "0 pedidos";
      return;
    }

    badgeCount.textContent = `${pedidos.length} pedido${pedidos.length !== 1 ? "s" : ""}`;

    pedidos.forEach(p => {
      const item = document.createElement("div");
      item.className = "pedido-item";

      const fechaTexto = p.fecha ? new Date(p.fecha).toLocaleDateString() : "";

      item.innerHTML = `
        <div class="pedido-main">
          <span class="pedido-cliente">${p.cliente_nombre}</span>
          <span class="pedido-meta">${fechaTexto} · ${p.cantidad_items} ítem${p.cantidad_items !== 1 ? "s" : ""}</span>
        </div>
        <div class="pedido-actions">
          <span class="pedido-total">₡${p.total.toFixed(2)}</span>
          <button class="pedidos-btn-delete">ELIMINAR</button>
        </div>
      `;

      const btnDelete = item.querySelector(".pedidos-btn-delete") as HTMLButtonElement;
      btnDelete.addEventListener("click", () => eliminarPedido(p.id_pedido));

      listaPedidos.appendChild(item);
    });
  }

  btnNuevoPedido.addEventListener("click", () => {
    modalPedido.classList.remove("pedidos-modal-hidden");
    formPedido.reset();
    itemsContainer.innerHTML = "";
    crearFilaItem();
    actualizarTotalPreview();
  });

  btnCancelarPedido.addEventListener("click", () => {
    modalPedido.classList.add("pedidos-modal-hidden");
    formPedido.reset();
    itemsContainer.innerHTML = "";
  });

  modalPedido.addEventListener("click", e => {
    if (e.target === modalPedido) {
      modalPedido.classList.add("pedidos-modal-hidden");
      formPedido.reset();
      itemsContainer.innerHTML = "";
    }
  });

  btnAgregarLinea.addEventListener("click", () => {
    if (repuestos.length === 0) {
      Swal.fire({icon: "warning", title: "Atención", text: "Primero debe haber repuestos cargados."});
      return;
    }
    crearFilaItem();
  });

    formPedido.addEventListener("submit", async e => {
    e.preventDefault();

    const valorCliente = selectCliente.value;
    if (!valorCliente) {
        Swal.fire({icon: "warning", title: "Atención", text: "Seleccione un cliente."});
        return;
    }

    const idCliente = parseInt(valorCliente, 10);
    if (isNaN(idCliente) || idCliente <= 0) {
        Swal.fire({icon: "warning", title: "Atención", text: "Seleccione un cliente válido."});
        return;
    }


    const filas = itemsContainer.querySelectorAll(".pedido-item-row");
    const items: PedidoDetalleItem[] = [];

    filas.forEach(row => {
      const sel = row.querySelector(".item-repuesto") as HTMLSelectElement | null;
      const inpCant = row.querySelector(".item-cantidad") as HTMLInputElement | null;
      if (!sel || !inpCant) return;
      const idRep = Number(sel.value);
      const cant = Number(inpCant.value);
      if (!idRep || cant <= 0) return;
      items.push({ id_repuesto: idRep, cantidad: cant });
    });

    if (items.length === 0) {
      Swal.fire({icon: "warning", title: "Atención", text: "Agregue al menos un repuesto al pedido."});
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);

    try {
      const res = await fetch(API_PEDIDOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: idCliente,
          fecha: hoy,
          items
        })
      });

      if (!res.ok) {
        let mensaje = "Error al crear pedido";

        try {
            const dataError = await res.json();
            if (dataError?.detail) mensaje = dataError.detail;
        } catch (_) {}

        Swal.fire({
            icon: "error",
            title: "No se pudo crear el pedido",
            text: mensaje,
        });
        return;
        }


      modalPedido.classList.add("pedidos-modal-hidden");
      formPedido.reset();
      itemsContainer.innerHTML = "";
      await cargarPedidos();
    } catch (err) {
      console.error(err);
      Swal.fire({icon: "error", title: "Error", text: "Error de conexión al crear pedido"});
    }
  });

  async function eliminarPedido(id_pedido: number) {
    if (!confirm("¿Seguro que desea eliminar este pedido?")) return;

    try {
      const res = await fetch(`${API_PEDIDOS}${id_pedido}`, {
        method: "DELETE"
      });

      if (!res.ok && res.status !== 204) {
        const txt = await res.text();
        console.error(txt);
        Swal.fire({icon: "error", title: "Error", text: "Error al eliminar pedido"});
        return;
      }

      await cargarPedidos();
    } catch (err) {
      console.error(err);
      Swal.fire({icon: "error", title: "Error", text: "Error de conexión al eliminar pedido"});
    }
  }

  cargarClientesYRepuestos();
  cargarPedidos();
}
