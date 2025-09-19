document.getElementById('btnEntrada').addEventListener('click', async () => {
  const dniInput = document.getElementById('dni');
  const msg = document.getElementById('msg');
  const studentInfo = document.getElementById('student-info');
  const dni = dniInput.value.trim();

  msg.style.color = '#dc3545'; // rojo por defecto para errores
  studentInfo.textContent = '';
  msg.textContent = '';

  if (!dni) {
    msg.textContent = 'Por favor ingresa un DNI válido.';
    return;
  }

  // Deshabilitar botón mientras se procesa
  const btn = document.getElementById('btnEntrada');
  btn.disabled = true;
  btn.textContent = 'Registrando...';

  try {
    // Cambia esta URL por la de tu backend en Vercel
    const response = await fetch('https://asistencia-harper-i6iy.vercel.app/api/attendances/check-in/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dni })
    });

    if (!response.ok) {
      throw new Error('Error en la conexión con el servidor');
    }

    const data = await response.json();

    if (data.exists) {
      msg.style.color = '#28a745'; // verde para éxito
      msg.textContent = 'Entrada registrada correctamente.';
      studentInfo.textContent = `Alumno: ${data.name} - Curso: ${data.course}`;
    } else {
      msg.style.color = '#dc3545';
      msg.textContent = 'Alumno no encontrado. Por favor regístrese primero.';
    }
  } catch (error) {
    msg.textContent = 'Error al conectar con el servidor. Intenta más tarde.';
    console.error(error);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Registrar Entrada';
  }
});
