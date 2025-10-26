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
          body: JSON.stringify({ email: email.value, password: password.value }),
        });

        const data = await res.json();
        if (res.ok && data.token) {
          alert("inicio de sesión correcto");
        } else {
          alert(data.detail || "credenciales inválidas");
        }
      } catch {
        alert("error de conexión con el servidor");
      }
    };
  } else console.log("form de login no encontrado");

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
  } else console.log("modal no encontrado");


  const registerForm = document.getElementById("registerForm") as HTMLFormElement;
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();

      const nombre = (document.getElementById("nombre") as HTMLInputElement).value;
      const email = (document.getElementById("registerEmail") as HTMLInputElement).value;
      const password = (document.getElementById("registerPassword") as HTMLInputElement).value;
      const confirm = (document.getElementById("registerConfirm") as HTMLInputElement).value;

      if (password !== confirm) return alert("las contraseñas no coinciden");

      try {
        const res = await fetch("http://localhost:8000/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, email, password }),
        });

        const data = await res.json();
        alert(res.ok ? data.message : data.detail || "error al registrar");
        if (res.ok) modal?.classList.add("hidden");
      } catch {
        alert("error de conexión con el servidor");
      }
    };
  } else console.log("form de registro no encontrado");
}, 50);
