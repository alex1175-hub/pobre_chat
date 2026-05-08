const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
const http = require('http');

const app = express();
const puerto = 8080;

//  Crear servidor HTTP manual
const server = http.createServer(app);

// Integrar Socket.IO
const { Server } = require('socket.io');
const io = new Server(server);

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
// SOCKET.IO - CHAT
// ==============================
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Escuchar mensajes del cliente
    socket.on('mensaje', (data) => {
        console.log('Mensaje recibido:', data);

        // Enviar a TODOS los usuarios conectados
        io.emit('mensaje', data);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

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
// SERVIDOR
// ==============================
server.listen(puerto, () => {
    console.log(`Servidor funcionando en http://localhost:${puerto}`);
});