document.getElementById('registroForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const dni = document.getElementById('dni').value.trim();
    const dniError = document.getElementById('dniError');
    const tableBody = document.getElementById('registrosTableBody');
    const btn = document.querySelector('.btn-login');

    dniError.style.display = 'none';

    if (dni.length !== 8 || !/^\d+$/.test(dni)) {
        dniError.textContent = 'Por favor, ingresa un DNI válido de 8 dígitos.';
        dniError.style.display = 'block';
        return;
    }

    // Deshabilita el botón y cambia el texto
    btn.textContent = 'Buscando...';
    btn.disabled = true;

    try {
        // 👉 Cambia esta URL por tu backend en Vercel
        const API_BASE = "https://asistencia-harper-i6iy.vercel.app";

        const response = await fetch(`${API_BASE}/api/attendances/check-in/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        // Se espera que el backend devuelva { attendance: {...}, student: {...} }
        const attendance = data.attendance || data;
        const student = attendance.student || data.student;

        if (student && student.nombres) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><img src="${student.foto || student.photo_url || 'https://via.placeholder.com/48'}" alt="Foto de ${student.nombres}" class="user-photo"></td>
                <td>${student.nombres} ${student.apellidos || ''}</td>
                <td>${student.dni}</td>
                <td>${timeString}</td>
            `;

            tableBody.prepend(newRow);
            document.getElementById('dni').value = '';
        } else {
            dniError.textContent = 'DNI no encontrado en la base de datos.';
            dniError.style.display = 'block';
        }

    } catch (error) {
        dniError.textContent = 'Error al conectar con el servidor. Intenta de nuevo.';
        dniError.style.display = 'block';
        console.error('Error:', error);
    } finally {
        btn.textContent = 'Registrar Entrada';
        btn.disabled = false;
    }
});
