import "./css/style.css";

function loadPage(page: string, cssFile?: string, scriptFile?: string) {
  fetch(page)
    .then(res => res.text())
    .then(html => {
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

      const oldScript = document.getElementById("page-script");
      if (oldScript) oldScript.remove();

      if (scriptFile) {
        const script = document.createElement("script");
        script.id = "page-script";
        script.type = "module";
        script.src = scriptFile;
        document.body.appendChild(script);
      }
    });
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnInicio")?.addEventListener("click", () =>
    loadPage("/pages/inicio.html", "/src/css/inicio.css", "/src/script/inicio.ts")
  );

  document.getElementById("btnInventario")?.addEventListener("click", () =>
    loadPage("/pages/inventario.html", "/src/css/inventario.css", "/src/script/inventario.ts")
  );

  document.getElementById("btnProveedores")?.addEventListener("click", () =>
    loadPage("/pages/proveedores.html", "/src/css/proveedores.css", "/src/script/proveedores.ts")
  );

  document.getElementById("btnSesion")?.addEventListener("click", () =>
    loadPage("/pages/sesion.html", "/src/css/sesion.css", "/src/script/sesion.ts")
  );

  loadPage("/pages/inicio.html", "/src/css/inicio.css", "/src/script/inicio.ts");
});
