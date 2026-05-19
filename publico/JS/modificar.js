// ==============================
// FORMULARIO
// ==============================
const form = document.querySelector("form");

// ==============================
// CARGAR USER_ID
// ==============================
const userIdInput =
    document.querySelector("[name=user_id]");

if (userIdInput) {

    userIdInput.value =
        localStorage.getItem("user_id");
}

// ==============================
// MODIFICAR PERFIL
// ==============================
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    // ==========================
    // OBTENER INPUTS
    // ==========================
    const userId =
        document.querySelector("[name=user_id]")?.value;

    const userNameInput =
        document.querySelector("[name=user_name]");

    const userPassInput =
        document.querySelector("[name=user_pass]");

    const colorInput =
        document.querySelector("[name=color]");

    // ==========================
    // VALIDAR EXISTENCIA
    // ==========================
    if (
        !userId ||
        !userNameInput ||
        !userPassInput ||
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

    const color =
        Sanitizador.limpiarTexto(
            colorInput.value
        );

    // ==========================
    // VALIDAR
    // ==========================
    if (!Sanitizador.esValido(user_name)) {

        alert("Nombre inválido");

        return;
    }

    // Permitir contraseña vacía
    // si no desea cambiarla
    if (
        user_pass.length > 0 &&
        !Sanitizador.esValido(user_pass)
    ) {

        alert("Contraseña inválida");

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
        user_id: userId,
        user_name,
        user_pass,
        color
    };

    try {

        // ======================
        // FETCH
        // ======================
        const res = await fetch('/editar', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(data)
        });

        // ======================
        // RESPUESTA
        // ======================
        const resultado =
            await res.json();

        // ======================
        // ERROR
        // ======================
        if (!resultado.ok) {

            alert(resultado.msg);

            return;
        }

        // ======================
        // ACTUALIZAR STORAGE
        // ======================
        localStorage.setItem(
            "user_name",
            resultado.user_name
        );

        // IMPORTANTE:
        // usar user_color
        localStorage.setItem(
            "user_color",
            resultado.color
        );

        // ======================
        // MENSAJE
        // ======================
        alert("Perfil actualizado");

        // ======================
        // REDIRECCIÓN
        // ======================
        window.location.href =
            "/perfil.html";

    } catch (error) {

        console.error(error);

        alert(
            "Error al actualizar perfil"
        );
    }
});