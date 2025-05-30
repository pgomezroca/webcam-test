

let stream, dataURL;
let mediaRecorder;
let recordedChunks = [];
let dni = "", region = "", diagnostico = "";
let modo = 'foto';
let progressInterval = null;
const maxDuration = 60000;

// Guarda el historial de pantallas por su id
let historyScreens = ['pantallaBienvenida'];

// Muestra sólo la pantalla indicada
function showScreen(screen) {
  // Lista todas las secciones de tu app
  const all = ['pantallaBienvenida', 'formulario','modoCaptura', 'video',       
    'foto','controles', 'pantallaDespedida'];
  // 1) Oculta todo
  all.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // 2) Muestra la que toque 
  switch(screen) {
    case 'pantallaBienvenida':
      document.getElementById('pantallaBienvenida').style.display = 'flex';
      break;
    case 'formulario':
      document.getElementById('formulario').style.display = 'flex';
      break;
    case 'modoCaptura':
      document.getElementById('modoCaptura').style.display = 'flex';
      break;
    case 'video':  // uso lógico para foto o vídeo activo
      document.getElementById('video').style.display    = 'block';
      document.getElementById('controles').style.display = 'flex';
      break;
    case 'foto':  // tras “sacarFoto()”
      document.getElementById('foto').style.display      = 'block';
      document.getElementById('controles').style.display = 'flex';
      break;
    case 'despedida':
      document.getElementById('pantallaDespedida').style.display = 'flex';
      break;
  }

  // 3) Controla visibilidad del botón Atrás
  const back = document.getElementById('btnBack');
  back.style.display = historyScreens.length > 1
    ? 'inline-block'
    : 'none';
}

// Empuja y muestra
function navigateTo(screen) {
  historyScreens.push(screen);
  showScreen(screen);
}

// Retrocede y muestra anterior
function goBack() {
  if (historyScreens.length > 1) {
    historyScreens.pop();
    showScreen(historyScreens[historyScreens.length - 1]);
  }
}
//fin navegacion
function entrarAplicacion() {
  navigateTo('formulario');
}
function mostrarSubregion() {
  // Oculta todos los selects de subregión
  document.querySelectorAll('.subregion')
    .forEach(sel => sel.style.display = 'none');

  // Muestra el que corresponde
  const region = document.getElementById('regionAnatomica').value;
  const sub = document.getElementById('subregion-' + region);
  if (sub) sub.style.display = 'block';
}

  function iniciarCamara() {
  dni = document.getElementById('dni').value.trim();
  const regionSel = document.getElementById('regionAnatomica').value;
  const sub = Array.from(document.querySelectorAll('.subregion'))
.find(s => s.style.display === 'block');
const diag = sub ? sub.value : "";
//  Validación
if (!dni || !regionSel || !diag) {
alert("Por favor, completá DNI, región anatómica y diagnóstico");
return;
}

//  Asigno a las variables globales
region     = regionSel;
diagnostico = diag;
 
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(s => {
      stream = s;
      navigateTo('modoCaptura');
    })
    .catch(err => alert("Error al acceder a la cámara: " + err.message));
  }
  function setModo(selection) {
    modo = selection;
    document.getElementById('modoCaptura').style.display = 'none';

  const video = document.getElementById('video');
  video.srcObject = stream;
  video.style.display = 'block';
  const ctrls = document.getElementById('controles');
  ctrls.style.display = 'flex';

if (modo === 'foto') {
document.getElementById('botonFoto').style.display = 'block';
document.getElementById('guardarFoto').style.display = 'none';
document.getElementById('startRec').style.display = 'none';
document.getElementById('stopRec').style.display  = 'none';
document.getElementById('btnNuevaFoto').style.display  = 'none';
document.getElementById('btnRepetirVideo').style.display = 'none';
} else { // modo === 'video'
document.getElementById('botonFoto').style.display = 'none';
document.getElementById('startRec').style.display = 'inline-block';
document.getElementById('stopRec').style.display  = 'inline-block';
document.getElementById('btnRepetirVideo').style.display = 'flex';
document.getElementById('guardarVideo').style.display = 'flex';
document.getElementById('guardarFoto').style.display = 'none';
document.getElementById('btnNuevaFoto').style.display  = 'none';
}
}
function sacarFoto() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const foto = document.getElementById('foto');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  dataURL = canvas.toDataURL('image/jpeg', 0.92);
  foto.src = dataURL;
  
  foto.style.display = "block";
  video.style.display = "none";
  document.getElementById('botonFoto').style.display = "none";
  document.getElementById('guardarFoto').style.display   = 'inline-block';
  document.getElementById('btnNuevaFoto').style.display  = 'inline-block';
}

function guardarFoto() {
  if (!dataURL) return;

  const fecha = new Date().toISOString().replace(/[:.]/g, '-');
  const nombreArchivo =  `${dni}_${region}_${diagnostico}_${fecha}.jpg`;

  const exifObj = {
    "0th": {
      [piexif.ImageIFD.Make]: "MiAppWeb",
      [piexif.ImageIFD.Artist]: "Profesional",
      [piexif.ImageIFD.ImageDescription]: diagnostico
    },
    "Exif": {
      [piexif.ExifIFD.DateTimeOriginal]: new Date().toISOString().slice(0, 19).replace(/:/g, ':'),
    }
  };

  const exifBytes = piexif.dump(exifObj);
  const newDataURL = piexif.insert(exifBytes, dataURL);

  const link = document.createElement('a');
  link.href = newDataURL;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Función para 'Tomar otra foto': limpiar y volver a cámara
function nuevaFoto() {
  const video = document.getElementById('video');
  const foto  = document.getElementById('foto');

  // Reset UI
  foto.style.display     = 'none';
  video.style.display    = 'block';
  document.getElementById('botonFoto').style.display     = 'inline-block';
  document.getElementById('guardarFoto').style.display   = 'none';
  document.getElementById('btnNuevaFoto').style.display  = 'none';
} 
function startRecording() {
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
  // mediaRecorder.onstop = saveRecording;   // ya no guarda automáticamente al detener
  mediaRecorder.start();

  // UI: toggle botones
  document.getElementById('startRec').style.display       = 'none';
  document.getElementById('stopRec').style.display        = 'inline-block';
  document.getElementById('recordIndicator').style.display = 'block';

  startProgressBar();
}

// Detención de la grabación
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();   // al finalizar, disparará saveRecording()
  }

  // UI: revertir botones
  document.getElementById('stopRec').style.display        = 'none';
  document.getElementById('startRec').style.display       = 'inline-block';
  document.getElementById('recordIndicator').style.display = 'none';

  stopProgressBar();
}

// Función que crea el archivo de vídeo y dispara la descarga
function saveRecording() {
  if (recordedChunks.length === 0) {
    return;
  }
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url  = URL.createObjectURL(blob);
  const fecha = new Date().toISOString().replace(/[:.]/g,'-');
  const nombre = `${dni}_${region}_${diagnostico}_${fecha}.webm`;

  const link = document.createElement('a');
  link.href = url;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Guardar vídeo manualmente con el botón
function guardarVideo() {
  if (recordedChunks.length === 0) {
    alert('No hay video para guardar.');
    return;
  }
  saveRecording();
}

// Barra de progreso durante la grabación
function startProgressBar() {
  const barFill = document.getElementById('progressFill');
  const start   = Date.now();
  progressInterval = setInterval(() => {
    const elapsed = Date.now() - start;
    const pct     = Math.min((elapsed / maxDuration) * 100, 100);
    barFill.style.width = pct + '%';

    if (pct >= 100) stopRecording();
  }, 100);
}

function stopProgressBar() {
  clearInterval(progressInterval);
  document.getElementById('progressFill').style.width = '0%';
}


//funcion guardar otro video
function repetirVideo() {
  // 1) Limpia los chunks que quedaron de la grabación anterior
  recordedChunks = [];

  // 2) Restaura el <video> al stream vivo
  const video = document.getElementById('video');
  video.srcObject = stream;    
  video.src       = "";        
  video.controls  = true;     // cambie a true
  video.style.display = "block";
  video.play();

  // 3) Ajusta los botones
  document.getElementById('startRec').style.display     = 'inline-block';  // listo para grabar
  document.getElementById('stopRec').style.display      = 'inline-block';
  document.getElementById('guardarVideo').style.display = 'inline-block';         
  document.getElementById('finalizar').style.display    = 'inline-block';  
}

//mostrar despedida
function mostrarDespedida() {
// 1) Detén la cámara si está activa
if (stream) stream.getTracks().forEach(t => t.stop());

// 2) Oculta todas las pantallas y elementos
['formulario','pantallaInicial','pantallaUpload','pantallaBienvenida',
'video','foto','controles'].forEach(id => {
const el = document.getElementById(id);
if (el) el.style.display = 'none';
});

// 3) Muestra la despedida
document.getElementById('pantallaDespedida').style.display = 'flex';
}
