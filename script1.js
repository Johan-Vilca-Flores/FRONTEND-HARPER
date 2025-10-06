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
        // En una aplicación real, aquí harías una llamada a tu backend de Vercel
        // para consultar la API de RENIEC o tu base de datos.
        // const response = await fetch(`URL_DE_TU_API_VERCEL/api/buscar-dni?dni=${dni}`);
        // const persona = await response.json();

        // SIMULACIÓN: Usamos un objeto de datos de ejemplo
        const persona = await new Promise(resolve => {
            setTimeout(() => {
                const mockData = {
                    '12345678': { nombre: 'JUAN PÉREZ GARCÍA', foto: 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png' },
                    '87654321': { nombre: 'MARÍA LÓPEZ RIVERA', foto: 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png' },
                    '55555555': { nombre: 'ANA GONZÁLEZ VÁSQUEZ', foto: 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png' }
                };
                resolve(mockData[dni]);
            }, 1000);
        });

        if (persona && persona.nombre) {
            // Obtiene la hora actual
            const now = new Date();
            const timeString = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

            // Crea una nueva fila en la tabla
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><img src="${persona.foto}" alt="Foto de ${persona.nombre}" class="user-photo"></td>
                <td>${persona.nombre}</td>
                <td>${dni}</td>
                <td>${timeString}</td>
            `;

            // Agrega la fila al inicio de la tabla (los registros más recientes primero)
            tableBody.prepend(newRow);

            // Limpia el campo de entrada
            document.getElementById('dni').value = '';
        } else {
            dniError.textContent = 'DNI no encontrado o no válido.';
            dniError.style.display = 'block';
        }

    } catch (error) {
        dniError.textContent = 'Error al conectar con el servidor. Intenta de nuevo más tarde.';
        dniError.style.display = 'block';
        console.error('Error:', error);
    } finally {
        // Habilita el botón y restaura el texto
        btn.textContent = 'Registrar Entrada';
        btn.disabled = false;
    }
});
