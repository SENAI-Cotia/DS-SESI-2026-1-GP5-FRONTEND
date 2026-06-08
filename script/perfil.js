
function checkLogin() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showLoginRequired();
        return false;
    }
    return true;
}

function showLoginRequired() {
    const outerWrapper = document.querySelector('.main-wrapperr') || document.querySelector('.main-wrapper');
    if (!outerWrapper) return;

    outerWrapper.innerHTML = `
        <div class="login-required-container">
            <div class="login-required-box">
                <i class="fa-solid fa-lock" style="font-size:48px; color:#d43768; margin-bottom:16px;"></i>
                <h2>Acesso Restrito</h2>
                <p>Você precisa estar conectado para acessar seu perfil.</p>
                <div class="login-required-actions">
                    <a href="login.html" class="btn-login-req">Fazer Login</a>
                    <a href="cadastro.html" class="btn-cadastro-req">Cadastro</a>
                </div>
            </div>
        </div>
        <style>
            .login-required-container {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: calc(100vh - 80px);
                width: 100%;
                padding: 20px;
                box-sizing: border-box;
            }
            .login-required-box {
                background: rgba(255,255,255,0.92);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                padding: 48px 40px;
                max-width: 440px;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 12px;
            }
            .login-required-box h2 {
                font-size: 24px;
                color: #222;
                margin: 0;
            }
            .login-required-box p {
                font-size: 16px;
                color: #666;
                margin: 0;
            }
            .login-required-actions {
                display: flex;
                gap: 16px;
                margin-top: 12px;
                flex-wrap: wrap;
                justify-content: center;
            }
            .btn-login-req {
                padding: 12px 32px;
                background-color: #d43768;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 700;
                font-size: 15px;
                transition: opacity .2s;
            }
            .btn-login-req:hover { opacity: .85; }
            .btn-cadastro-req {
                padding: 12px 32px;
                background-color: #555;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 700;
                font-size: 15px;
                transition: opacity .2s;
            }
            .btn-cadastro-req:hover { opacity: .85; }
        </style>
    `;
}

async function saveUserProfile(userId, profile) {
    const fullName = `${profile.nome} ${profile.sobrenome}`.trim();
    const payload = {
        name: fullName,
        email: profile.email,
        telNumero: profile.telefone,
        curso: localStorage.getItem('userCurso') || '',
        rm: profile.rm ? Number(profile.rm) : null,
        curso: profile.curso || '',
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
    localStorage.setItem('userCurso', profile.curso || '');
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
    const curso = profile.curso || '';



    const setField = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    setField('profile-curso', curso);
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
    const curso = document.getElementById("profile-curso").value;

    return { nome, sobrenome, email, telefone, rm, curso };
}

function setupInteractions() {
    const userId = localStorage.getItem('userId');

    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }

    document.querySelectorAll('.edit-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const field = icon.parentElement.querySelector('input, select');
            if (!field) return;

            field.disabled = false;
            field.focus();

            if (field.tagName === 'INPUT') {
                field.setSelectionRange(field.value.length, field.value.length);
            }
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

    document.querySelectorAll('.field select').forEach(select => {
        select.addEventListener('change', () => {
            select.disabled = true;

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

    const curso = localStorage.getItem('userCurso') || '';

    const setField = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    setField('profile-name', nome);
    setField('profile-lastname', sobrenome);
    setField('profile-email', email);
    setField('profile-phone', tel);
    setField('profile-rm', rm);
    setField('profile-curso', curso);
}

document.addEventListener('DOMContentLoaded', async () => {
    if (checkLogin()) {
        setupInteractions();
        await loadUserProfile();
    }
});
