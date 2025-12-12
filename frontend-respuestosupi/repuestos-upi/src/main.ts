import "./css/style.css";
import { applyRoleToNav, getCurrentRol } from "./script/roles";

function loadPage(
  page: string,
  cssFile?: string,
  initModule?: () => Promise<void>
) {
  fetch(page)
    .then(res => res.text())
    .then(async html => {
      const content = document.getElementById("content")!;
      content.innerHTML = html;

      const oldLink = document.getElementById("page-style");
      if (oldLink) oldLink.remove();

      if (cssFile) {
        const link = document.createElement("link");
        link.id = "page-style";
        link.rel = "stylesheet";
        link.href = cssFile;
        document.head.appendChild(link);
      }

      if (initModule) {
        await initModule();
      }
    });
}

window.addEventListener("DOMContentLoaded", () => {
  applyRoleToNav(getCurrentRol());

  document.getElementById("btnInicio")?.addEventListener("click", () =>
    loadPage("/pages/inicio.html", "/src/css/inicio.css", async () => {
      const m = await import("/src/script/inicio.ts");
      if (m.initInicio) m.initInicio();
    })
  );

  document.getElementById("btnInventario")?.addEventListener("click", () =>
    loadPage("/pages/inventario.html", "/src/css/inventario.css", async () => {
      const m = await import("/src/script/inventario.ts");
      m.initInventario();
    })
  );

  document.getElementById("btnProveedores")?.addEventListener("click", () =>
    loadPage("/pages/proveedores.html", "/src/css/proveedores.css", async () => {
      const m = await import("/src/script/proveedores.ts");
      if (m.initProveedores) m.initProveedores();
    })
  );

  document.getElementById("btnSesion")?.addEventListener("click", () =>
    loadPage("/pages/sesion.html", "/src/css/sesion.css", async () => {
      const m = await import("/src/script/sesion.ts");
      if (m.initSesion) m.initSesion();
    })
  );

  document.getElementById("btnClientes")?.addEventListener("click", () =>
    loadPage("/pages/clientes.html", "/src/css/clientes.css", async () => {
      const m = await import("/src/script/clientes.ts");
      if (m.initClientes) m.initClientes();
    })
  );

  document.getElementById("btnCategorias")?.addEventListener("click", () =>
    loadPage("/pages/categorias.html", "/src/css/categorias.css", async () => {
      const m = await import("/src/script/categorias.ts");
      if (m.initCategorias) m.initCategorias();
    })
  );

  document.getElementById("btnAdministracion")?.addEventListener("click", () =>
    loadPage("/pages/administracion.html", "/src/css/administracion.css", async () => {
      const m = await import("/src/script/administracion.ts");
      m.initAdministracion();
    })
  );

  document.getElementById("btnPedidos")?.addEventListener("click", () =>
    loadPage("/pages/pedidos.html", "/src/css/pedidos.css", async () => {
      const m = await import("/src/script/pedidos.ts");
      m.initPedidos();
    })
  );

  loadPage("/pages/inicio.html", "/src/css/inicio.css", async () => {
    const m = await import("/src/script/inicio.ts");
    if (m.initInicio) m.initInicio();
  });
});
