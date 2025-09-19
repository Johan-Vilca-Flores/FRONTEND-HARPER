document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    let isValid = true;

    // Validación básica
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    emailError.style.display = 'none';
    passwordError.style.display = 'none';

    // Solo verifica que el campo no esté vacío
    if (!email) {
        emailError.style.display = 'block';
        isValid = false;
    }

    if (!password) {
        passwordError.style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        // Aquí conectarías con tu backend de Vercel
        console.log('Login attempt:', { email, password });

        // Simular envío al backend
        const btn = document.querySelector('.btn-login');
        btn.textContent = 'Iniciando sesión...';
        btn.disabled = true;

        setTimeout(() => {
            alert('Conexión exitosa! (Este es un demo - conecta con tu backend de Vercel)');
            btn.textContent = 'Iniciar Sesión';
            btn.disabled = false;
        }, 1500);
    }
});