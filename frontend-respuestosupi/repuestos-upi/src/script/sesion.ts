import { setCurrentRol } from "./roles";

setTimeout(() => {
  const loginForm = document.querySelector("form") as HTMLFormElement;
  const email = document.querySelector("#email") as HTMLInputElement;
  const password = document.querySelector("#password") as HTMLInputElement;

  if (loginForm && email && password) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();

      try {
        const res = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.value, password: password.value })
        });

        const data = await res.json();

        if (res.ok && data.token) {
          if (data.rol) setCurrentRol(data.rol);
          Swal.fire({icon: "success", title: "Éxito", text: "Inicio de sesión correcto"});
        } else {
          Swal.fire({icon: "error", title: "Error", text: data.detail || "Credenciales inválidas"});
        }
      } catch {
        Swal.fire({icon: "error", title: "Error", text: "Error de conexión con el servidor"});
      }
    };
  }

  const modal = document.getElementById("registerModal");
  const open = document.getElementById("openRegister");
  const close = document.getElementById("closeModal");

  if (modal && open && close) {
    open.onclick = (e) => {
      e.preventDefault();
      modal.classList.remove("hidden");
    };
    close.onclick = () => modal.classList.add("hidden");
    window.onclick = (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    };
  }

  const registerForm = document.getElementById("registerForm") as HTMLFormElement;

  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();

      const nombre = (document.getElementById("nombre") as HTMLInputElement).value;
      const emailR = (document.getElementById("registerEmail") as HTMLInputElement).value;
      const passwordR = (document.getElementById("registerPassword") as HTMLInputElement).value;
      const confirm = (document.getElementById("registerConfirm") as HTMLInputElement).value;

      if (passwordR !== confirm) {
        Swal.fire({icon: "warning", title: "Atención", text: "Las contraseñas no coinciden"});
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/auth/registrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, email: emailR, password: passwordR })
        });

        const data = await res.json();

        if (res.ok) {
          modal?.classList.add("hidden");
          Swal.fire({icon: "success", title: "Éxito", text: data.message});
        } else {
          Swal.fire({icon: "error", title: "Error", text: data.detail || "Error al registrar"});
        }
      } catch {
        Swal.fire({icon: "error", title: "Error", text: "Error de conexión con el servidor"});
      }
    };
  }
}, 50);
