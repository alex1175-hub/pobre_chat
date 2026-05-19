// ========================
// VARIABLES GLOBALES
// ========================
let currentUser = {
    id: null,
    name: null,
    color: "#667eea"
};

let socket = null;
let typingTimeout = null;

// ========================
// CARGAR DATOS DEL USUARIO
// ========================
function loadUser() {

    const userId = localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_name');
    const userColor = localStorage.getItem('user_color');

    // Si no hay sesión
    if (!userId || !userName) {
        window.location.href = '/';
        return false;
    }

    currentUser.id = userId;
    currentUser.name = userName;
    currentUser.color = userColor || "#667eea";

    console.log("Usuario cargado:", currentUser);

    // Opcionales
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userColorDisplay = document.getElementById('userColorDisplay');

    if (userNameDisplay) {
        userNameDisplay.textContent = currentUser.name;
    }

    if (userColorDisplay) {
        userColorDisplay.style.backgroundColor = currentUser.color;
    }

    return true;
}

// ========================
// CONECTAR SOCKET.IO
// ========================
function connectSocket() {

    socket = io();

    // ====================
    // CONEXIÓN EXITOSA
    // ====================
    socket.on('connect', () => {

        console.log('✅ Conectado al servidor');

        // Identificarse
        socket.emit('user-connected', {
            userId: currentUser.id,
            userName: currentUser.name,
            userColor: currentUser.color
        });
    });

    // ====================
    // BIENVENIDA
    // ====================
    socket.on('welcome', (data) => {

        addSystemMessage(data.message);

        addSystemMessage(
            `👥 Hay ${data.usersCount} usuario(s) conectado(s)`
        );
    });

    // ====================
    // HISTORIAL
    // ====================
    socket.on('chat-history', (history) => {

        console.log('📜 Historial:', history.length);

        if (history.length === 0) {

            addSystemMessage(
                '💬 No hay mensajes recientes'
            );

        } else {

            renderMessages(history);
        }
    });

    // ====================
    // NUEVO MENSAJE
    // ====================
    socket.on('new-message', (message) => {

        addMessageToChat(message);
    });

    // ====================
    // USUARIO CONECTADO
    // ====================
    socket.on('user-joined', (data) => {

        addSystemMessage(
            `✨ ${data.userName} se ha unido (${data.usersCount} conectados)`
        );
    });

    // ====================
    // USUARIO DESCONECTADO
    // ====================
    socket.on('user-left', (data) => {

        addSystemMessage(
            `👋 ${data.userName} salió (${data.usersCount} conectados)`
        );
    });

    // ====================
    // LISTA ONLINE
    // ====================
    socket.on('online-users', (data) => {

        updateUsersList(data.users, data.count);
    });

    // ====================
    // ESCRIBIENDO
    // ====================
    socket.on('user-typing', (data) => {

        const typingDiv = document.getElementById('typingIndicator');

        if (!typingDiv) return;

        if (
            data.isTyping &&
            data.userId !== currentUser.id
        ) {

            typingDiv.textContent =
                `✍️ ${data.userName} está escribiendo...`;

        } else {

            typingDiv.textContent = '';
        }
    });

    // ====================
    // ERROR
    // ====================
    socket.on('error', (error) => {

        console.error('Socket error:', error);

        addSystemMessage(`❌ Error: ${error}`);
    });

    // ====================
    // DESCONECTADO
    // ====================
    socket.on('disconnect', () => {

        console.log('❌ Desconectado');

        addSystemMessage(
            '❌ Desconectado del servidor'
        );
    });
}

// ========================
// RENDER MENSAJES
// ========================
function renderMessages(messages) {

    const chatDiv = document.getElementById('chat');

    if (!chatDiv) return;

    chatDiv.innerHTML = '';

    messages.forEach(msg => {

        addMessageToChat(msg, false);
    });

    scrollToBottom();
}

// ========================
// AÑADIR MENSAJE
// ========================
function addMessageToChat(msg, scroll = true) {

    const chatDiv = document.getElementById('chat');

    if (!chatDiv) return;

    const isOwn = msg.userId === currentUser.id;

    const messageDiv = document.createElement('div');

    messageDiv.className =
        `message ${isOwn ? 'message-sent' : 'message-received'}`;

    // ====================
    // NOMBRE
    // ====================
    const nameDiv = document.createElement('div');

    nameDiv.className = 'message-name';

    nameDiv.innerHTML = `
        <span style="color:${msg.userColor || '#667eea'};">
            ${escapeHtml(msg.userName)}
        </span>
    `;

    // ====================
    // TEXTO
    // ====================
    const textDiv = document.createElement('div');

    textDiv.className = 'message-text';

    textDiv.innerHTML =
        parseEmojis(
            escapeHtml(msg.text)
        );

    // ====================
    // HORA
    // ====================
    const timeDiv = document.createElement('div');

    timeDiv.className = 'message-time';

    const date = new Date(msg.timestamp);

    timeDiv.textContent = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    // ====================
    // AGREGAR
    // ====================
    messageDiv.appendChild(nameDiv);
    messageDiv.appendChild(textDiv);
    messageDiv.appendChild(timeDiv);

    chatDiv.appendChild(messageDiv);

    if (scroll) {
        scrollToBottom();
    }
}

// ========================
// MENSAJE SISTEMA
// ========================
function addSystemMessage(text) {

    const chatDiv = document.getElementById('chat');

    if (!chatDiv) return;

    const div = document.createElement('div');

    div.className = 'system-message';

    div.textContent = text;

    chatDiv.appendChild(div);

    scrollToBottom();
}

// ========================
// USUARIOS ONLINE
// ========================
function updateUsersList(users, count) {

    const usersListDiv = document.getElementById('usersList');

    const onlineCountSpan = document.getElementById('onlineCount');

    if (onlineCountSpan) {
        onlineCountSpan.textContent =
            `Conectados: ${count}`;
    }

    if (!usersListDiv) return;

    usersListDiv.innerHTML = '';

    users.forEach(user => {

        const isCurrentUser =
            user.userId === currentUser.id;

        const userItem = document.createElement('div');

        userItem.className = 'user-item';

        userItem.innerHTML = `
            <div class="user-color-dot"
                 style="background-color:${user.userColor};">
            </div>

            <div class="user-name">
                ${escapeHtml(user.userName)}
            </div>

            ${isCurrentUser
                ? '<span class="current-user-badge">tú</span>'
                : ''
            }
        `;

        usersListDiv.appendChild(userItem);
    });
}

// ========================
// ESCAPAR HTML
// ========================
function escapeHtml(str) {

    const div = document.createElement('div');

    div.textContent = str;

    return div.innerHTML;
}

// ========================
// PARSE EMOJIS
// ========================
function parseEmojis(text) {

    return text;
}

// ========================
// SCROLL ABAJO
// ========================
function scrollToBottom() {

    const chatDiv = document.getElementById('chat');

    if (!chatDiv) return;

    chatDiv.scrollTop =
        chatDiv.scrollHeight;
}

// ========================
// ENVIAR MENSAJE
// ========================
function sendMessage() {

    const input =
        document.getElementById('mensaje');

    if (!input) return;

    // ====================
    // SANITIZAR
    // ====================
    let text =
        Sanitizador.limpiarTexto(input.value);

    // ====================
    // VALIDAR
    // ====================
    if (!Sanitizador.esValido(text)) {

        alert("Mensaje inválido");

        return;
    }

    // ====================
    // OBJETO MENSAJE
    // ====================
    const messageData = {
        userId: currentUser.id,
        userName: currentUser.name,
        userColor: currentUser.color,
        text: text,
        timestamp: new Date().toISOString()
    };

    // ====================
    // ENVIAR
    // ====================
    socket.emit(
        'send-message',
        messageData
    );

    // ====================
    // LIMPIAR
    // ====================
    input.value = '';

    updateCharCount();

    notifyTyping(false);
}

// ========================
// NOTIFICAR ESCRITURA
// ========================
function notifyTyping(isTyping) {

    if (!socket) return;

    socket.emit('typing', {
        isTyping: isTyping
    });
}

// ========================
// MANEJAR ESCRITURA
// ========================
function handleTyping() {

    notifyTyping(true);

    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(() => {

        notifyTyping(false);

    }, 1500);
}

// ========================
// CONTADOR
// ========================
function updateCharCount() {

    const input =
        document.getElementById('mensaje');

    if (!input) return;

    const count = input.value.length;

    const max = 200;

    const counterDiv =
        document.getElementById('charCounter');

    if (!counterDiv) return;

    counterDiv.textContent =
        `${count} / ${max}`;

    counterDiv.classList.remove(
        'warning',
        'danger'
    );

    if (count > max * 0.9) {

        counterDiv.classList.add('danger');

    } else if (count > max * 0.7) {

        counterDiv.classList.add('warning');
    }
}

// ========================
// AÑADIR EMOJI
// ========================
function addEmoji(emoji) {

    const input =
        document.getElementById('mensaje');

    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    const text = input.value;

    const newText =
        text.substring(0, start) +
        emoji +
        text.substring(end);

    if (newText.length > 200) {

        alert(
            "No puedes exceder 200 caracteres"
        );

        return;
    }

    input.value = newText;

    input.setSelectionRange(
        start + emoji.length,
        start + emoji.length
    );

    input.focus();

    updateCharCount();

    handleTyping();
}

// ========================
// LOGOUT
// ========================
function logout() {

    if (socket) {
        socket.disconnect();
    }

    localStorage.clear();

    window.location.href = '/';
}

// ========================
// INICIALIZAR
// ========================
document.addEventListener(
    'DOMContentLoaded',
    () => {

        if (!loadUser()) return;

        connectSocket();

        const sendBtn =
            document.getElementById('enviar');

        const msgInput =
            document.getElementById('mensaje');

        const logoutBtn =
            document.getElementById('logout');

        const toggleEmoji =
            document.getElementById('toggleEmoji');

        const emojiPanel =
            document.getElementById('emojiPanel');

        // ====================
        // BOTÓN ENVIAR
        // ====================
        if (sendBtn) {

            sendBtn.addEventListener(
                'click',
                (e) => {

                    e.preventDefault();

                    sendMessage();
                }
            );
        }

        // ====================
        // INPUT
        // ====================
        if (msgInput) {

            msgInput.addEventListener(
                'keypress',
                (e) => {

                    if (e.key === 'Enter') {

                        e.preventDefault();

                        sendMessage();
                    }
                }
            );

            msgInput.addEventListener(
                'input',
                () => {

                    updateCharCount();

                    handleTyping();
                }
            );
        }

        // ====================
        // LOGOUT
        // ====================
        if (logoutBtn) {

            logoutBtn.addEventListener(
                'click',
                logout
            );
        }

        // ====================
        // PANEL EMOJIS
        // ====================
        if (toggleEmoji && emojiPanel) {

            toggleEmoji.addEventListener(
                'click',
                () => {

                    emojiPanel.style.display =
                        emojiPanel.style.display === 'none'
                            ? 'flex'
                            : 'none';
                }
            );
        }

        // ====================
        // EMOJIS
        // ====================
        document.querySelectorAll('.emoji-btn')
            .forEach(btn => {

                btn.addEventListener(
                    'click',
                    () => {

                        addEmoji(btn.textContent);
                    }
                );
            });

        updateCharCount();
    }
);