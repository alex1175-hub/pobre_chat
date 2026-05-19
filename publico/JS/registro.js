// ==============================
// REGISTRO
// ==============================

document
    .querySelector("form")
    .addEventListener("submit", async (e) => {

    e.preventDefault();

    // ==========================
    // OBTENER INPUTS
    // ==========================
    const userNameInput =
        document.querySelector("[name=user_name]");

    const userPassInput =
        document.querySelector("[name=user_pass]");

    const confirmPassInput =
        document.querySelector("[name=confirm_pass]");

    const colorInput =
        document.querySelector("[name=color]");

    // ==========================
    // VALIDAR EXISTENCIA
    // ==========================
    if (
        !userNameInput ||
        !userPassInput ||
        !confirmPassInput ||
        !colorInput
    ) {

        alert("Faltan campos");

        return;
    }

    // ==========================
    // SANITIZAR
    // ==========================
    const user_name =
        Sanitizador.limpiarTexto(
            userNameInput.value
        );

    const user_pass =
        Sanitizador.limpiarTexto(
            userPassInput.value
        );

    const confirm_pass =
        Sanitizador.limpiarTexto(
            confirmPassInput.value
        );

    const color =
        Sanitizador.limpiarTexto(
            colorInput.value
        );

    // ==========================
    // VALIDAR USUARIO
    // ==========================
    if (!Sanitizador.esValido(user_name)) {

        alert("Nombre de usuario inválido");

        return;
    }

    if (user_name.length < 3) {

        alert(
            "El nombre debe tener al menos 3 caracteres"
        );

        return;
    }

    // ==========================
    // VALIDAR PASSWORD
    // ==========================
    if (!Sanitizador.esValido(user_pass)) {

        alert("Contraseña inválida");

        return;
    }

    if (user_pass.length < 4) {

        alert(
            "La contraseña debe tener al menos 4 caracteres"
        );

        return;
    }

    // ==========================
    // VALIDAR CONFIRMACIÓN
    // ==========================
    if (user_pass !== confirm_pass) {

        alert(
            "Las contraseñas no coinciden"
        );

        return;
    }

    // ==========================
    // VALIDAR COLOR HEX
    // ==========================
    const colorRegex =
        /^#([0-9A-F]{3}){1,2}$/i;

    if (!colorRegex.test(color)) {

        alert("Color inválido");

        return;
    }

    // ==========================
    // DATOS
    // ==========================
    const data = {
        user_name,
        user_pass,
        confirm_pass,
        color
    };

    try {

        // ======================
        // FETCH
        // ======================
        const res = await fetch('/registro', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(data)
        });

        // ======================
        // RESPUESTA
        // ======================
        const texto = await res.text();

        // ======================
        // MENSAJE
        // ======================
        alert(texto);

        // ======================
        // REDIRECCIÓN
        // ======================
        if (
            texto.includes("correctamente")
        ) {

            window.location.href =
                "/index.html";
        }

    } catch (error) {

        console.error(error);

        alert(
            "Error al registrar usuario"
        );
    }
});