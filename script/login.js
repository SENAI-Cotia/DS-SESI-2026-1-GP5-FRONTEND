
function showAlert(message) {
    alert(message);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('senha')?.value.trim();

        if (!email || !password) {
            return showAlert('Email e senha são obrigatórios.');
        }

        try {
            const response = await fetch(`${window.API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                return showAlert(data.error || 'Falha ao fazer login.');
            }

            if (data.user?.id) {
                localStorage.setItem('userId', String(data.user.id));
            }
            if (data.user?.email) {
                localStorage.setItem('userEmail', data.user.email);
            }

            showAlert('Login realizado com sucesso!');
            window.location.href = '/pages/inicio.html';
        } catch (error) {
            console.error(error);
            showAlert('Erro de rede ao fazer login. Tente novamente.');
        }
    });
});