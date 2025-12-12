export type Rol = "anon" | "vendedor" | "admin";

const ROLE_KEY = "userRole";

const ALL_TABS = [
  "btnInicio",
  "btnInventario",
  "btnProveedores",
  "btnClientes",
  "btnAdministracion",
  "btnSesion",
  "btnCategorias",
  "btnPedidos"
];

const CONFIG_ROL: Record<Rol, string[]> = {
  anon: ["btnInicio", "btnSesion"],
  vendedor: ["btnInicio", "btnInventario", "btnProveedores", "btnClientes", "btnSesion", "btnCategorias", "btnPedidos"],
  admin: ["btnInicio", "btnInventario", "btnProveedores", "btnClientes", "btnAdministracion", "btnSesion", "btnCategorias", "btnPedidos"]
};

export function getCurrentRol(): Rol {
  const r = localStorage.getItem(ROLE_KEY) as Rol | null;
  return r ?? "anon";
}

export function setCurrentRol(rol: Rol) {
  localStorage.setItem(ROLE_KEY, rol);
  applyRoleToNav(rol);
}

export function clearRol() {
  localStorage.removeItem(ROLE_KEY);
  applyRoleToNav("anon");
}

export function applyRoleToNav(rol: Rol = getCurrentRol()) {
  const allowed = new Set(CONFIG_ROL[rol]);

  ALL_TABS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (allowed.has(id)) {
      el.classList.remove("nav-hidden");
    } else {
      el.classList.add("nav-hidden");
    }
  });
}
