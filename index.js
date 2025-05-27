
// al principio de index.js
let stream, dataURL;
let mediaRecorder;
let recordedChunks = [];

let dni = "", region = "", diagnostico = "";
let modo = 'foto';
function entrarAplicacion() {
document.getElementById('pantallaBienvenida').style.display = 'none';
document.getElementById('formulario').style.display = 'flex';

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
 
  document.getElementById('formulario').style.display = 'none';

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(s => {
      stream = s;
      document.getElementById('modoCaptura').style.display = 'flex';
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
document.getElementById('startRec').style.display = 'none';
document.getElementById('stopRec').style.display  = 'none';
} else { // modo === 'video'
document.getElementById('botonFoto').style.display = 'none';
document.getElementById('startRec').style.display = 'inline-block';
document.getElementById('stopRec').style.display  = 'inline-block';
document.getElementById('finalizar').style.display = 'flex';
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
  document.getElementById('controles').style.display = "flex";
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

function repetirFoto() {
  document.getElementById('foto').style.display = "none";
  document.getElementById('video').style.display = "block";
  document.getElementById('botonFoto').style.display = "block";
  document.getElementById('controles').style.display = "none";
}
function startRecording() {
  if (!stream) return alert("La cámara no está iniciada");
  
  recordedChunks = [];
  // crea el MediaRecorder con el stream de vídeo
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

  // cada vez que haya datos disponibles, los guardamos
  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  // cuando pare de grabar, montamos el blob y lo reproducimos
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const video = document.getElementById('video');

    // ponemos el vídeo en modo reproducción
    video.srcObject = null;
    video.src = url;
    video.controls = true;
    video.play();

    // ocultamos botones de grabación y mostramos los generales
    document.getElementById('startRec').style.display = 'none';
    document.getElementById('stopRec').style.display  = 'none';
    document.getElementById('controles').style.display = 'flex';
  };

  // ajusta visibilidad de botones
  document.getElementById('startRec').style.display = 'none';
  document.getElementById('stopRec').style.display  = 'inline-block';
  document.getElementById('botonFoto').style.display = 'none';

  mediaRecorder.start();
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}
function guardarVideo() {
  console.log("guardarVideo llamado");
  if (!recordedChunks || recordedChunks.length === 0) {
    return alert("No hay vídeo para guardar.");
  }
  // Construye el blob
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url  = URL.createObjectURL(blob);

  // Genera un nombre con fecha y metadatos
  const fecha = new Date().toISOString().replace(/[:.]/g, '-');
  const nombre = `${dni}_${region}_${diagnostico}_${fecha}.webm`;

  // Descarga automática
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Libera memoria
  URL.revokeObjectURL(url);
}
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM listo: intentando enlazar guardarVideo");
  const btnGuardar = document.getElementById('guardarVideo');
  if (!btnGuardar) {
    return console.error("No encontré #guardarVideo en el DOM");
  }
  btnGuardar.addEventListener('click', () => {
    console.log("Click detectado en guardarVideo 👇");
    guardarVideo();
  });
});
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
