// navbar.js — compartilhado entre todas as páginas
// Lê dados do localStorage (preenchido futuramente pelo fluxo de login)
// TODO: quando o login for integrado, salvar userId/userName/userCurso no localStorage

const API_BASE = 'http://10.92.199.29:3000'; // mantido para uso futuro

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

document.addEventListener('DOMContentLoaded', loadNavbar);
