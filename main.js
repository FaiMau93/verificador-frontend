const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const resultDiv = document.getElementById('result');

// 📸 Iniciar cámara
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        resultDiv.innerText = '⚠️ Error al acceder a la cámara';
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
            resultDiv.innerHTML += `<br>❌ ${data.message}`;
        }
    })
    .catch(err => {
        // Mostrar error si no se puede conectar al backend
        resultDiv.innerHTML += '<br>⚠️ Error de conexión con el backend';
        console.error(err);
    });
}