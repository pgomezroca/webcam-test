//parte vieja


function mostrarSubregionUpload() {
  // 1) Oculto todos los selects de diagnóstico
  document.querySelectorAll('.subregion-upload')
    .forEach(sel => sel.style.display = 'none');

  // 2) Leo el valor elegido en el select con id="regionUpload"
  const region = document.getElementById('regionUpload').value;

  // 3) Muestro el select asociado, cuyo id es "subregionUpload-" + ese valor
  const sub = document.getElementById('subregionUpload-' + region);
  if (sub) sub.style.display = 'block';
}

  // Validación: región y diagnóstico obligatorios; DNI opcional
  if (!regionSel || !diag) {
    alert("Por favor, completá región anatómica y diagnóstico");
    return;
  }

  // Si pasó la validación, abro el selector de archivos
  document.getElementById('uploadInput').click();

// Llamar a esta función cuando cambie el <input type="file">
document.getElementById('uploadInput')
  .addEventListener('change', function() {
    const archivos = this.files;
    const feedbackDiv = document.getElementById('feedback');
    const btnProcesar = document.getElementById('btnProcesar');
    const btnFinalizar=document.getElementById('despedida');
    if (archivos.length === 0) {
      feedbackDiv.textContent = '';
      btnProcesar.style.display = 'none';
      btnFinalizar.style.display='none' 
      return;
    }

    if (archivos.length === 1) {
      feedbackDiv.innerHTML = `1 archivo seleccionado: <span>${archivos[0].name}</span>`;
    } else {
      // Listar nombres de todos o simplemente mostrar la cantidad
      const listaNombres = Array.from(archivos)
        .map(file => file.name)
        .join(', ');
      feedbackDiv.innerHTML = `${archivos.length} archivos seleccionados: <span>${listaNombres}</span>`;
    }
    btnProcesar.style.display = 'inline-block';
    btnFinalizar.style.display='inline-block';
  });
  //definicion funcion procesar
  function procesarYGuardarArchivos(files) {
    console.log ('guardando')
   
    // Tomo valores del formulario para asignarlos a globals
    const dniInput     = document.getElementById('dniUpload').value.trim();
    const regionInput  = document.getElementById('regionUpload').value;
    const subVisible   = Array.from(document.querySelectorAll('.subregion-upload'))
                              .find(s => s.style.display === 'block');
    const diagInput    = subVisible ? subVisible.value : '';
  
    Array.from(files).forEach(file => {
      const reader = new FileReader();
  
      reader.onload = function(e) {
        // 1) Asigno globals como los necesita guardarFoto()
        dataURL       = e.target.result;  
        dni           = dniInput;         
        region        = regionInput;      
        diagnostico   = diagInput;        
  
       
        guardarFoto();
      };
  
      // 3) Leo el archivo como DataURL
      reader.readAsDataURL(file);
    });
  }
  
  //click en boton procesar
  document.getElementById('btnProcesar')
  .addEventListener('click', () => {
    const archivos = document.getElementById('uploadInput').files;
    if (!archivos || archivos.length === 0) {
      alert('Primero debés seleccionar una o varias imágenes.');
      return;
    }
    procesarYGuardarArchivos(archivos);
  });
