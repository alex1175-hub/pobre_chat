const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
const http = require('http');

const app = express();
const puerto = 8080;

//  Crear servidor HTTP manual
const server = http.createServer(app);

// ==============================
// CONEXIÓN A MONGODB
// ==============================
mongoose.connect('mongodb://127.0.0.1:27017/Pobre_chat')
    .then(() => console.log("MongoDB conectado"))
    .catch(err => console.log(err));

// ==============================
// DIRECTORIO
// ==============================
app.use(express.static(path.join(__dirname, 'publico')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==============================
// FUNCIÓN HASH SHA256
// ==============================
function sha256(texto) {
    return crypto.createHash('sha256').update(texto).digest('hex');
}

// ==============================
// MODELO DE USUARIO
// ==============================
const UsuarioSchema = new mongoose.Schema({
    user_name: String,
    user_pass: String,
    color_code: String
});
const Usuario = mongoose.model('Usuarios', UsuarioSchema);

// ==============================
// RUTA DE REGISTRO
// ==============================
app.post('/registro', async (req, res) => {
    try {
        const { user_name, user_pass, confirm_pass, color } = req.body;
        if (!user_name || !user_pass || !confirm_pass) {
            return res.send("Faltan datos");
        }
        if (user_pass !== confirm_pass) {
            return res.send("Las contraseñas no coinciden");
        }
        const existe = await Usuario.findOne({ user_name });
        if (existe) {
            return res.send("El usuario ya existe");
        }
        const nuevoUsuario = new Usuario({
            user_name,
            user_pass: sha256(user_pass),
            color_code: color
        });
        await nuevoUsuario.save();
        res.send("Usuario registrado correctamente");
    } catch (error) {
        console.log(error);
        res.send("Error en el servidor");
    }
});

// ==============================
// RUTA DE LOGIN
// ==============================
app.post('/login', async (req, res) => {
    try {
        const { user_name, user_pass } = req.body;
        if (!user_name || !user_pass) {
            return res.json({ ok: false, msg: "Faltan datos" });
        }
        const usuario = await Usuario.findOne({ user_name });
        if (!usuario) {
            return res.json({ ok: false, msg: "Usuario no encontrado" });
        }
        const hash = sha256(user_pass);
        if (usuario.user_pass !== hash) {
            return res.json({ ok: false, msg: "Contraseña incorrecta" });
        }
        res.json({
            ok: true,
            msg: "Login correcto",
            user_id: usuario._id,
            user_name: usuario.user_name,
            color: usuario.color_code
        });
    } catch (error) {
        console.log(error);
        res.json({ ok: false, msg: "Error en el servidor" });
    }
});

// ==============================
// RUTA EDITAR PERFIL
// ==============================
app.post('/editar', async (req, res) => {
    try {
        const { user_id, user_name, user_pass, color } = req.body;
        // Verificar usuario
        const usuario = await Usuario.findById(user_id);
        if (!usuario) {
            return res.json({
                ok: false,
                msg: "Usuario no encontrado"
            });
        }
        // Verificar si el nuevo nombre ya existe
        const existe = await Usuario.findOne({
            user_name,
            _id: { $ne: user_id }
        });
        if (existe) {
            return res.json({
                ok: false,
                msg: "Ese nombre ya está en uso"
            });
        }
        // Actualizar datos básicos
        usuario.user_name = user_name;
        usuario.color_code = color;
        // SOLO cambiar contraseña si escribió algo
        if (user_pass && user_pass.trim() !== "") {
            usuario.user_pass = sha256(user_pass);
        }
        await usuario.save();
        res.json({
            ok: true,
            msg: "Perfil actualizado",
            user_name: usuario.user_name,
            color: usuario.color_code
        });
    } catch (error) {
        console.log(error);

        res.json({
            ok: false,
            msg: "Error del servidor"
        });
    }
});

// ==============================
// SERVIDOR
// ==============================
server.listen(puerto, () => {
    console.log(`Servidor funcionando en http://localhost:${puerto}`);
});