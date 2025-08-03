const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const resultDiv = document.getElementById('result');

// 📸 Iniciar cámara (AHORA ABRE LA CÁMARA TRASERA)
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        resultDiv.innerHTML = '⚠️ Error al acceder a la cámara. Asegúrate de tener una cámara conectada y haber dado permiso.';
        console.error(err);
    });

// 📷 Escanear imagen cuando se presiona el botón
document.getElementById('scanBtn').addEventListener('click', () => {
    resultDiv.innerHTML = '🔄 Escaneando imagen...'; // Usar innerHTML para poder borrar la imagen anterior

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Usar OCR con Tesseract para leer texto
    Tesseract.recognize(canvas, 'eng', {
        logger: m => console.log(m)
    }).then(({ data: { text } }) => {
        const scannedText = text.trim().toUpperCase();
        console.log('🔍 Texto OCR en mayúsculas:', scannedText);
        
        // Si el texto detectado está vacío o es muy corto, mostramos un mensaje de error
        if (scannedText.length < 5) {
            resultDiv.innerHTML = `❌ No se detectó un código válido. Intenta de nuevo.`;
            return; // Detenemos la ejecución
        }

        resultDiv.innerHTML = `✅ Texto detectado:\n${scannedText}`;

        // 👇 Mandar el texto escaneado al backend para verificar
        verificarClave(scannedText);
    }).catch(err => {
        resultDiv.innerHTML = '❌ Error en el OCR';
        console.error(err);
    });
});

// Función que manda la clave al backend y muestra el resultado
function verificarClave(clave) {
    resultDiv.innerHTML += '<br>🧠 Verificando clave...';

    fetch('https://verificador-backend-1.onrender.com/verificar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clave })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Mostrar los datos recibidos si la clave es válida, incluyendo la foto
            resultDiv.innerHTML = `
                <div class="result-box">
                    <p>✅ ¡Clave válida!</p>
                    <img id="client-photo" src="${data.datos.url_foto}" alt="Foto del cliente">
                    <p>👤 Cliente: ${data.datos.usuario_cliente}</p>
                    <p>🧬 Entropía: ${data.datos.entropia}</p>
                    <p>📅 Compra: ${data.datos.fecha_compra}</p>
                </div>
            `;
        } else {
            // Mostrar mensaje de error si clave no válida o no encontrada
            resultDiv.innerHTML = `<br>❌ ${data.message}`;
        }
    })
    .catch(err => {
        // Mostrar error si no se puede conectar al backend
        resultDiv.innerHTML += '<br>⚠️ Error de conexión con el backend. Por favor, verifica tu conexión a internet o la URL del backend.';
        console.error(err);
    });
}
