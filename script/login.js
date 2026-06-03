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

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                return showAlert(data.error || 'Email ou senha incorretos.');
            }

            // Salva dados do usuário no localStorage para uso em toda a aplicação
            if (data.user) {
                localStorage.setItem('userId', String(data.user.id));
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userName', data.user.name);
                if (data.user.rm) localStorage.setItem('userRm', String(data.user.rm));
                if (data.user.curso) localStorage.setItem('userCurso', data.user.curso);
                if (data.user.telNumero) localStorage.setItem('userTel', data.user.telNumero);
                if (data.user.funcao) localStorage.setItem('userFuncao', data.user.funcao);
            }

            showAlert('Login realizado com sucesso!');
            window.location.href = '/pages/inicio.html';
        } catch (error) {
            console.error(error);
            showAlert('Erro de rede ao fazer login. Tente novamente.');
        }
    });
});
