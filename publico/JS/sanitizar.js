// ==============================
// SANITIZADOR DE TEXTO
// ==============================
class Sanitizador {
    // Elimina etiquetas HTML y caracteres peligrosos
    static limpiarTexto(texto) {
        if (!texto) return "";
        // Convertir a string
        texto = String(texto);
        // Eliminar etiquetas HTML
        texto = texto.replace(/<[^>]*>/g, '');
        // Eliminar scripts peligrosos
        texto = texto.replace(/javascript:/gi, '');
        texto = texto.replace(/onerror/gi, '');
        texto = texto.replace(/onclick/gi, '');
        texto = texto.replace(/onload/gi, '');
        texto = texto.replace(/eval\(/gi, '');
        texto = texto.replace(/document\./gi, '');
        texto = texto.replace(/window\./gi, '');
        // Eliminar caracteres peligrosos
        texto = texto.replace(/[<>`"'\\;]/g, '');
        // Eliminar saltos de línea excesivos
        texto = texto.replace(/\n{3,}/g, '\n\n');
        // Eliminar espacios múltiples
        texto = texto.replace(/\s{2,}/g, ' ');
        // Eliminar lenguaje grosero
        texto = texto.replace(/sexo/gi, '');
        texto = texto.replace(/puto/gi, '');
        texto = texto.replace(/puta/gi, '');
        texto = texto.replace(/verga/gi, '');
        texto = texto.replace(/pito/gi, '');
        texto = texto.replace(/pendejo/gi, '');
        texto = texto.replace(/pendeja/gi, '');
        texto = texto.replace(/estupido/gi, '');
        texto = texto.replace(/estupida/gi, '');
        texto = texto.replace(/inbecil/gi, '');
        texto = texto.replace(/coger/gi, '');
        texto = texto.replace(/cogan/gi, '');
        texto = texto.replace(/follar/gi, '');
        texto = texto.replace(/mierda/gi, '');
        texto = texto.replace(/culer/gi, '');
        texto = texto.replace(/culo/gi, '');
        texto = texto.replace(/teta/gi, '');
        // Limitar longitud
        texto = texto.substring(0, 200);
        // Quitar espacios extremos
        texto = texto.trim();
        return texto;
    }
    // Validar longitud
    static esValido(texto) {
        if (!texto) return false;
        texto = texto.trim();
        if (texto.length < 1) return false;
        if (texto.length > 200) return false;
        return true;
    }
}