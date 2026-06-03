// Determina a base da API automaticamente em ambiente de desenvolvimento (localhost)
window.API_BASE = window.__API_BASE__ || ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000' : 'http://10.92.199.16:3000'); // mantido para uso futuro

function loadNavbar() {
    const userName = localStorage.getItem('userName') || 'Usuário';
    const userCurso = localStorage.getItem('userCurso') || '';
    const firstName = userName.split(' ')[0] || 'Usuário';

    const nameEl = document.getElementById('nav-user-name');
    const cursoEl = document.getElementById('nav-user-curso');
    const avatarEl = document.getElementById('nav-avatar');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarFirst = document.getElementById('sidebar-firstname');

    if (nameEl) nameEl.textContent = userName;
    if (cursoEl) cursoEl.textContent = userCurso;
    if (avatarEl) avatarEl.textContent = firstName.charAt(0).toUpperCase();
    if (sidebarAvatar) sidebarAvatar.textContent = firstName.charAt(0).toUpperCase();
    if (sidebarFirst) sidebarFirst.textContent = firstName;
}

// Aplica preferências de acessibilidade salvas no localStorage em todas as páginas
function aplicarAcessibilidade() {
    const sizeMap = { small: '13px', medium: '16px', large: '20px' };
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.documentElement.style.fontSize = sizeMap[fontSize] || '16px';

    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark-mode');
    }
    if (localStorage.getItem('altoContraste') === 'true') {
        document.documentElement.classList.add('alto-contraste');
    }
}

// Roda imediatamente (antes do DOMContentLoaded) para evitar flash
aplicarAcessibilidade();

document.addEventListener('DOMContentLoaded', loadNavbar);
