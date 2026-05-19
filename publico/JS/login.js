// ==============================
// LOGIN
// ==============================

document
    .getElementById("loginForm")
    .addEventListener("submit", async (e) => {

    e.preventDefault();

    // ==========================
    // OBTENER INPUTS
    // ==========================
    const userInput =
        document.querySelector("[name=user_name]");

    const passInput =
        document.querySelector("[name=user_pass]");

    if (!userInput || !passInput) {

        alert("Faltan campos");

        return;
    }

    // ==========================
    // SANITIZAR
    // ==========================
    const user_name =
        Sanitizador.limpiarTexto(userInput.value);

    const user_pass =
        Sanitizador.limpiarTexto(passInput.value);

    // ==========================
    // VALIDAR
    // ==========================
    if (!Sanitizador.esValido(user_name)) {

        alert("Nombre de usuario inválido");

        return;
    }

    if (!Sanitizador.esValido(user_pass)) {

        alert("Contraseña inválida");

        return;
    }

    // ==========================
    // DATOS
    // ==========================
    const data = {
        user_name,
        user_pass
    };

    try {

        // ======================
        // FETCH LOGIN
        // ======================
        const res = await fetch('/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(data)
        });

        // ======================
        // RESPUESTA
        // ======================
        const resultado = await res.json();

        // ======================
        // ERROR LOGIN
        // ======================
        if (!resultado.ok) {

            alert(resultado.msg);

            return;
        }

        // ======================
        // GUARDAR SESIÓN
        // ======================
        localStorage.setItem(
            "user_id",
            resultado.user_id
        );

        localStorage.setItem(
            "user_name",
            resultado.user_name
        );

        localStorage.setItem(
            "user_color",
            resultado.color
        );

        // ======================
        // REDIRECCIÓN
        // ======================
        window.location.href = "/chat.html";

    } catch (error) {

        console.error(error);

        alert(
            "Error al conectar con el servidor"
        );
    }
});