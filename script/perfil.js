
function checkLogin() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showLoginRequired();
        return false;
    }
    return true;
}

function showLoginRequired() {
    const mainWrapper = document.querySelector('.main-wrapper');
    if (!mainWrapper) return;
    
    mainWrapper.innerHTML = `
        <div class="login-required-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 20px;">
            <h2 style="font-size: 24px; margin-bottom: 20px;">Acesso Restrito</h2>
            <p style="font-size: 16px; margin-bottom: 30px; color: #666;">Você precisa estar conectado para acessar seu perfil.</p>
            <div style="display: flex; gap: 15px;">
                <a href="login.html" class="btn-login" style="padding: 12px 30px; background-color: #ff1493; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Fazer Login</a>
                <a href="cadastro.html" class="btn-cadastro" style="padding: 12px 30px; background-color: #666; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Cadastro</a>
            </div>
        </div>
    `;
}

async function saveUserProfile(userId, profile) {
    const fullName = `${profile.nome} ${profile.sobrenome}`.trim();
    const payload = {
        name: fullName,
        email: profile.email,
        telNumero: profile.telefone,
        curso: localStorage.getItem('userCurso') || '',
        rm: profile.rm ? Number(profile.rm) : null
    };

    persistProfileLocally(profile);

    try {
        const response = await fetch(`${window.API_BASE}/cadastro/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            updateNavbarAndSidebar(fullName);
            alert('Perfil atualizado com sucesso!');
            return true;
        }

        console.warn('Falha ao atualizar no backend:', data);
        updateNavbarAndSidebar(fullName);
        alert('Perfil atualizado localmente. O servidor não aceita essa rota no momento.');
        return false;
    } catch (err) {
        console.error('Erro ao salvar perfil:', err);
        updateNavbarAndSidebar(fullName);
        alert('Perfil atualizado localmente. Erro de conexão com o servidor.');
        return false;
    }
}

function persistProfileLocally(profile) {
    const fullName = `${profile.nome} ${profile.sobrenome}`.trim();
    localStorage.setItem('userName', fullName);
    localStorage.setItem('userEmail', profile.email || '');
    localStorage.setItem('userTelefone', profile.telefone || '');
    localStorage.setItem('userRM', profile.rm || '');
}

async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`${window.API_BASE}/cadastro/${userId}`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json().catch(() => null);
        return data && (data.user || data);
    } catch (error) {
        console.warn('Não foi possível buscar perfil no backend:', error);
        return null;
    }
}

function populateProfileFields(profile) {
    const fullName = profile.name || '';
    const parts = fullName.split(' ');
    const nome = parts[0] || '';
    const sobrenome = parts.slice(1).join(' ') || '';
    const email = profile.email || '';
    const tel = profile.telNumero || '';
    const rm = profile.rm != null ? String(profile.rm) : '';

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

function updateNavbarAndSidebar(fullName) {
    const navName = document.getElementById('nav-user-name');
    const sidebarFirst = document.getElementById('sidebar-firstname');
    const navAvatar = document.getElementById('nav-avatar');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const firstName = fullName.split(' ')[0] || 'Usuário';
    
    if (navName) navName.textContent = fullName;
    if (sidebarFirst) sidebarFirst.textContent = firstName;
    if (navAvatar) navAvatar.textContent = firstName.charAt(0).toUpperCase();
    if (sidebarAvatar) sidebarAvatar.textContent = firstName.charAt(0).toUpperCase();
}

function getProfileDataFromForm() {
    const nome = document.getElementById('profile-name')?.value || '';
    const sobrenome = document.getElementById('profile-lastname')?.value || '';
    const email = document.getElementById('profile-email')?.value || '';
    const telefone = document.getElementById('profile-phone')?.value || '';
    const rm = document.getElementById('profile-rm')?.value || '';

    return { nome, sobrenome, email, telefone, rm };
}

function setupInteractions() {
    const userId = localStorage.getItem('userId');
    
    document.querySelectorAll('.edit-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.parentElement.querySelector('input');
            if (!input) return;
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
            const profile = getProfileDataFromForm();
            saveUserProfile(userId, profile);
        });
    });

    const saveButton = document.getElementById('save-profile-btn');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const profile = getProfileDataFromForm();
            saveUserProfile(userId, profile);
        });
    }
}

async function loadUserProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        return;
    }

    const serverProfile = await fetchUserProfile(userId);
    if (serverProfile) {
        populateProfileFields(serverProfile);
        persistProfileLocally({
            nome: serverProfile.name?.split(' ')[0] || '',
            sobrenome: serverProfile.name?.split(' ').slice(1).join(' ') || '',
            email: serverProfile.email || '',
            telefone: serverProfile.telNumero || '',
            rm: serverProfile.rm != null ? String(serverProfile.rm) : ''
        });
        return;
    }

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

document.addEventListener('DOMContentLoaded', async () => {
    if (checkLogin()) {
        setupInteractions();
        await loadUserProfile();
    }
});
