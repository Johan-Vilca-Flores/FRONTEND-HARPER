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

    btn.textContent = 'Buscando...';
    btn.disabled = true;

    const successSoundUrl = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
    const errorSoundUrl = "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg";

    try {
        const API_BASE = "https://asistencia-harper-i6iy.vercel.app";

        const response = await fetch(`${API_BASE}/api/attendances/check-in/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni })
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => `Error ${response.status}`);
            try { new Audio(errorSoundUrl).play(); } catch(e){ /* ignore */ }
            throw new Error(`Error ${response.status}: ${errText}`);
        }

        const data = await response.json();
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

            try { await new Audio(successSoundUrl).play(); } catch (e) { /* ignore */ }

            document.getElementById('dni').value = '';
            document.getElementById('dni').focus();

        } else {
            try { new Audio(errorSoundUrl).play(); } catch(e) { /* ignore */ }

            dniError.textContent = 'DNI no encontrado en la base de datos.';
            dniError.style.display = 'block';
            document.getElementById('dni').focus();
        }

    } catch (error) {
        try { new Audio(errorSoundUrl).play(); } catch(e){ /* ignore */ }

        dniError.textContent = 'Error al conectar con el servidor. Intenta de nuevo.';
        dniError.style.display = 'block';
        console.error('Error:', error);
        document.getElementById('dni').focus();
    } finally {
        btn.textContent = 'Registrar Entrada';
        btn.disabled = false;
    }
});
