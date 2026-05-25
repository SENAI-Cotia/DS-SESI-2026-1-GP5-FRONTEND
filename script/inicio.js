// inicio.js
// TODO: integrar com API quando o fluxo de login estiver pronto
// const API_BASE = 'http://10.92.199.12:3000';
// Exemplo de como buscar produtos futuramente:
// const res = await fetch(`${API_BASE}/produtos`);

function loadNavbarInicio() {
    const userName = localStorage.getItem('userName') || 'Usuário';
    const userCurso = localStorage.getItem('userCurso') || '';
    const firstName = userName.split(' ')[0] || 'Usuário';

    const nameEl = document.getElementById('nav-user-name');
    const cursoEl = document.getElementById('nav-user-curso');
    const avatarEl = document.getElementById('nav-avatar');
    const welcomeEl = document.getElementById('welcomeText');
    const welcomeCursoEl = document.getElementById('welcomeCurso');

    if (nameEl) nameEl.textContent = userName;
    if (cursoEl) cursoEl.textContent = userCurso;
    if (avatarEl) avatarEl.textContent = firstName.charAt(0).toUpperCase();
    if (welcomeEl) welcomeEl.textContent = `Bem-vindo, ${userName}`;
    if (welcomeCursoEl) welcomeCursoEl.textContent = userCurso;
}

document.addEventListener('DOMContentLoaded', () => {
    loadNavbarInicio();

    const busca = document.getElementById('txtBusca');
    if (busca) {
        busca.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.card').forEach(card => {
                card.style.display = card.innerText.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }
});
