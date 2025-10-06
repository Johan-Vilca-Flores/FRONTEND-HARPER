// script.js
// ========== CONFIG ==========
const API_BASE = "https://asistencia-harper-i6iy.vercel.app"; // <- CAMBIA AQUÍ por tu backend Vercel
// endpoints
const CHECKIN_PATH = "/api/attendances/check-in/";
const LIST_PATH = "/api/attendances/"; // lista con ?date=YYYY-MM-DD

// fecha hoy en formato YYYY-MM-DD
function todayISO(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

// util DOM
const q = id => document.getElementById(id);

// form & UI
const form = q("registroForm");
const dniInput = q("dni");
const dniError = q("dniError");
const btnEntrada = q("btnEntrada");
const msg = q("msg");
const tableBody = q("registrosTableBody");

// validar dni: 8 dígitos numéricos
function validarDni(val){
  return /^\d{8}$/.test(val);
}

// mostrar mensaje (tiempo breve)
function showMessage(text, isError=true){
  msg.style.color = isError ? "#dc3545" : "#28a745";
  msg.textContent = text;
  if(!text) return;
  setTimeout(()=> {
    if(msg.textContent === text) msg.textContent = "";
  }, 6000);
}

// render fila en la tabla
function addRegistroRow(student, check_in_iso){
  const tr = document.createElement("tr");

  // foto: puede ser URL o null
  const fotoTd = document.createElement("td");
  const img = document.createElement("img");
  img.src = (student && (student.foto || student.photo_url)) ? (student.foto || student.photo_url) : "https://via.placeholder.com/48x48?text=No+Foto";
  img.alt = `${student?.nombres || ""} ${student?.apellidos || ""}`;
  fotoTd.appendChild(img);

  const nombreTd = document.createElement("td");
  nombreTd.textContent = `${student?.nombres || "—"} ${student?.apellidos || ""}`;

  const dniTd = document.createElement("td");
  dniTd.textContent = student?.dni || "—";

  const horaTd = document.createElement("td");
  horaTd.textContent = check_in_iso ? new Date(check_in_iso).toLocaleString() : "-";

  tr.appendChild(fotoTd);
  tr.appendChild(nombreTd);
  tr.appendChild(dniTd);
  tr.appendChild(horaTd);

  // insertar arriba (más reciente primero)
  if(tableBody.firstChild) tableBody.insertBefore(tr, tableBody.firstChild);
  else tableBody.appendChild(tr);

  // keep max rows (ej: 20)
  while(tableBody.childNodes.length > 20) tableBody.removeChild(tableBody.lastChild);
}

// petición POST para check-in
async function postCheckin(dni){
  const url = API_BASE + CHECKIN_PATH;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dni })
  });
  const text = await res.text();
  // intenta parsear JSON si existe; si no, lanza error
  try {
    const json = JSON.parse(text);
    return { ok: res.ok, status: res.status, json };
  } catch(e){
    return { ok: res.ok, status: res.status, text };
  }
}

// lista registros de hoy
async function fetchRegistrosHoy(){
  const url = `${API_BASE}${LIST_PATH}?date=${todayISO()}`;
  try {
    const res = await fetch(url);
    if(!res.ok){
      console.warn("fetchRegistrosHoy not ok", res.status);
      return;
    }
    const data = await res.json();
    // espera array de attendances con .student y .check_in
    if(Array.isArray(data)){
      tableBody.innerHTML = "";
      data.forEach(a => {
        const student = a.student || a.student_data || null;
        addRegistroRow(student, a.check_in || a.check_in);
      });
    } else if (Array.isArray(data.results)) {
      tableBody.innerHTML = "";
      data.results.forEach(a => {
        addRegistroRow(a.student, a.check_in);
      });
    } else {
      // si la respuesta es { attendance: {...} } o similar, ignorar
      console.log("fetchRegistrosHoy: formato inesperado", data);
    }
  } catch (err){
    console.error("Error fetching registros:", err);
  }
}

// ---- evento submit ----
form.addEventListener("submit", async function(e){
  e.preventDefault();
  const dni = dniInput.value.trim();
  dniError.style.display = "none";
  showMessage("");

  if(!validarDni(dni)){
    dniError.style.display = "block";
    showMessage("DNI inválido (debe tener 8 dígitos).");
    return;
  }

  btnEntrada.disabled = true;
  btnEntrada.textContent = "Registrando...";

  try {
    const result = await postCheckin(dni);

    if(!result.ok){
      // show server message if available
      const detail = result.json?.detail || result.json?.message || result.text || `Error ${result.status}`;
      showMessage(detail || "Error en el servidor", true);
    } else {
      // normal: { exists: true, attendance: {...} } o attendance directo
      const payload = result.json || {};
      const attendance = payload.attendance || payload;
      const exists = payload.exists !== undefined ? payload.exists : true;

      if(!exists){
        showMessage("Alumno no encontrado. Regístralo primero.", true);
      } else {
        // muestra éxito y añade fila
        const student = attendance.student || attendance.student_data || payload.student || null;
        const check_in = attendance.check_in || attendance.check_in;
        showMessage("Entrada registrada correctamente.", false);
        addRegistroRow(student, check_in);

        // clear input
        dniInput.value = "";
      }
    }
  } catch (err){
    console.error("Error:", err);
    showMessage("Error de red. Intenta nuevamente.", true);
  } finally {
    btnEntrada.disabled = false;
    btnEntrada.textContent = "Registrar Entrada";
  }
});

// al cargar la página traemos registros de hoy
fetchRegistrosHoy();
