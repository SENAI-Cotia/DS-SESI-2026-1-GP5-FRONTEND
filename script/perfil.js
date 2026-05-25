// perfil.js — Configurações da conta
// Dados lidos do localStorage (preenchido futuramente pelo login)
// TODO: quando login for integrado, chamar API para PUT ao editar campos
// const API_BASE = 'http://10.92.199.12:3000';
// Exemplo de update futuro:
// await fetch(`${API_BASE}/usuarios/${userId}`, { method: 'PUT', ... });

function setupInteractions() {
    document.querySelectorAll('.edit-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.parentElement.querySelector('input');
            input.disabled = false;
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        });
    });

    document.querySelectorAll('.field input').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        });
        input.addEventListener('blur', () => {
            input.disabled = true;
            // Salva localmente por enquanto
            // TODO: enviar para API quando login estiver integrado
            if (input.id === 'profile-name' || input.id === 'profile-lastname') {
                const nome = document.getElementById('profile-name').value || '';
                const sobre = document.getElementById('profile-lastname').value || '';
                const fullName = `${nome} ${sobre}`.trim();
                localStorage.setItem('userName', fullName);
                // atualiza navbar
                const navName = document.getElementById('nav-user-name');
                const sidebarFirst = document.getElementById('sidebar-firstname');
                const navAvatar = document.getElementById('nav-avatar');
                const sidebarAvatar = document.getElementById('sidebar-avatar');
                const firstName = fullName.split(' ')[0] || 'Usuário';
                if (navName) navName.textContent = fullName;
                if (sidebarFirst) sidebarFirst.textContent = firstName;
                if (navAvatar) navAvatar.textContent = firstName.charAt(0).toUpperCase();
                if (sidebarAvatar) sidebarAvatar.textContent = firstName.charAt(0).toUpperCase();
            } else if (input.id === 'profile-email') {
                localStorage.setItem('userEmail', input.value);
            } else if (input.id === 'profile-phone') {
                localStorage.setItem('userTelefone', input.value);
            } else if (input.id === 'profile-rm') {
                localStorage.setItem('userRM', input.value);
            }
        });
    });
}

function loadUserProfile() {
    const fullName = localStorage.getItem('userName') || '';
    const parts = fullName.split(' ');
    const nome = parts[0] || '';
    const sobrenome = parts.slice(1).join(' ') || '';
    const email = localStorage.getItem('userEmail') || '';
    const tel = localStorage.getItem('userTelefone') || '';
    const rm = localStorage.getItem('userRM') || '';

    const setField = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    setField('profile-name', nome);
    setField('profile-lastname', sobrenome);
    setField('profile-email', email);
    setField('profile-phone', tel);
    setField('profile-rm', rm);
}

document.addEventListener('DOMContentLoaded', () => {
    setupInteractions();
    loadUserProfile();
});
