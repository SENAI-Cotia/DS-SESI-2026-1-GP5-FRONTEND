const API_BASE = 'http://10.92.199.12:3000';

function setupInteractions() {
    // sidebar ativa
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

    // editar inputs
    document.querySelectorAll(".edit-icon").forEach(icon => {
        icon.addEventListener("click", () => {
            const input = icon.parentElement.querySelector("input");
            input.disabled = false;
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        });
    });

    // bloquear novamente e salvar quando houver alteração
    document.querySelectorAll(".field input").forEach(input => {
        input.addEventListener("keydown", (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            }
        });
        input.addEventListener("blur", async () => {
            const original = input.dataset.original || '';
            input.disabled = true;
            if (input.value !== original) {
                // construir payload baseado no campo
                const payload = {};
                if (input.id === 'profile-name' || input.id === 'profile-lastname') {
                    const nameInput = document.getElementById('profile-name');
                    const lastnameInput = document.getElementById('profile-lastname');
                    const fullName = `${nameInput.value || ''} ${lastnameInput.value || ''}`.trim();
                    payload.name = fullName;
                } else if (input.id === 'profile-email') {
                    payload.email = input.value;
                } else if (input.id === 'profile-phone') {
                    payload.telNumero = input.value;
                } else if (input.id === 'profile-rm') {
                    const num = Number(input.value);
                    payload.rm = isNaN(num) ? input.value : num;
                } else {
                    // campo não mapeado para backend; apenas atualiza local
                    input.dataset.original = input.value;
                    return;
                }

                const ok = await updateUserOnServer(payload);
                if (ok) {
                    // atualizar localStorage e UI
                    if (payload.name) {
                        localStorage.setItem('userName', payload.name);
                        const nameDisplay = document.getElementById('profile-name-display');
                        if (nameDisplay) nameDisplay.textContent = payload.name;
                        const firstName = payload.name.split(' ')[0] || '';
                        const sidebarFirst = document.getElementById('sidebar-firstname');
                        if (sidebarFirst) sidebarFirst.textContent = firstName;
                        const sidebarAvatar = document.getElementById('sidebar-avatar');
                        if (sidebarAvatar) sidebarAvatar.textContent = firstName ? firstName.charAt(0).toUpperCase() : 'U';
                        const avatar = document.getElementById('profile-avatar');
                        if (avatar) avatar.textContent = firstName ? firstName.charAt(0).toUpperCase() : 'U';
                    }
                    if (payload.email) localStorage.setItem('userEmail', payload.email);
                    if (payload.telNumero) localStorage.setItem('userTelefone', payload.telNumero);
                    if (payload.rm) localStorage.setItem('userRM', payload.rm);

                    input.dataset.original = input.value;
                } else {
                    alert('Não foi possível atualizar seus dados no servidor. Tente novamente mais tarde.');
                    input.value = original;
                }
            }
        });
    });
}

async function updateUserOnServer(payload) {
    const userId = getUserId();
    if (!userId) {
        console.warn('userId não encontrado.');
        return false;
    }
    const urls = [`${API_BASE}/usuarios/${userId}`, `${API_BASE}/users/${userId}`, `${API_BASE}/usuario/${userId}`];
    for (const url of urls) {
        try {
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) return true;
            console.warn('PUT falhou para', url, 'status', res.status);
        } catch (e) {
            console.warn('updateUserOnServer erro para', url, e);
        }
    }
    return false;
}

function getUserId() {
    return localStorage.getItem('userId');
}

function getUserEmail() {
    return localStorage.getItem('userEmail');
}

function getUserName() {
    return localStorage.getItem('userName');
}

function renderSoldProducts(produtos) {
    const container = document.getElementById('sold-products');
    if (!container) return;
    if (!produtos || produtos.length === 0) {
        container.innerHTML = '<p>Você não tem produtos vendidos registrados.</p>';
        return;
    }

    container.innerHTML = '';
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'sold-product-card';
        card.innerHTML = `
            <div class="sold-product-header">
                <strong>${produto.name || 'Produto'}</strong>
                <span>R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}</span>
            </div>
            <p>${produto.descricao || ''}</p>
        `;
        container.appendChild(card);
    });
}

async function loadSoldProducts() {
    const userId = getUserId();
    const container = document.getElementById('sold-products');
    if (!container) return;
    if (!userId) {
        container.innerHTML = '<p>Faça login para ver seus produtos vendidos.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/produtos/vendidos/${userId}`);
        if (!response.ok) {
            container.innerHTML = '<p>Não foi possível carregar os produtos vendidos.</p>';
            return;
        }
        const produtos = await response.json();
        renderSoldProducts(produtos);
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Erro de rede ao carregar produtos vendidos.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupInteractions();
    loadUserProfile();
    loadSoldProducts();
});

async function fetchUserFromApi(id) {
    const tryUrls = [`${API_BASE}/usuarios/${id}`, `${API_BASE}/users/${id}`, `${API_BASE}/usuario/${id}`];
    for (const url of tryUrls) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            return data;
        } catch (e) {
            // try next
        }
    }
    return null;
}

async function loadUserProfile() {
    const userId = getUserId();
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const phoneInput = document.getElementById('profile-phone');
    const rmInput = document.getElementById('profile-rm');
    const avatar = document.getElementById('profile-avatar');
    const nameDisplay = document.getElementById('profile-name-display');
    const cursoDisplay = document.getElementById('profile-curso-display');

    let name = localStorage.getItem('userName') || '';
    let email = localStorage.getItem('userEmail') || '';
    let curso = localStorage.getItem('userCurso') || '';
    let tel = localStorage.getItem('userTelefone') || localStorage.getItem('userTelNumero') || '';
    let rm = localStorage.getItem('userRM') || localStorage.getItem('userRm') || '';

    if (userId) {
        const apiUser = await fetchUserFromApi(userId);
        if (apiUser) {
            name = apiUser.name || name;
            email = apiUser.email || email;
            curso = apiUser.curso || curso;
            tel = apiUser.telNumero || tel || apiUser.telefone || apiUser.phone;
            rm = apiUser.rm || rm;
        }
    }

    if (nameInput) {
        nameInput.value = name || '';
        nameInput.dataset.original = nameInput.value || '';
    }
    if (emailInput) {
        emailInput.value = email || '';
        emailInput.dataset.original = emailInput.value || '';
    }
    if (phoneInput) {
        phoneInput.value = tel || '';
        phoneInput.dataset.original = phoneInput.value || '';
    }
    if (rmInput) {
        rmInput.value = rm || '';
        rmInput.dataset.original = rmInput.value || '';
    }
    if (avatar) avatar.textContent = (name && name.charAt(0)) ? name.charAt(0).toUpperCase() : 'U';
    if (nameDisplay) nameDisplay.textContent = name || 'Usuário';
    if (cursoDisplay) cursoDisplay.textContent = curso || '';
    // sidebar elements
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarFirst = document.getElementById('sidebar-firstname');
    const firstName = name ? name.split(' ')[0] : '';
    if (sidebarAvatar) sidebarAvatar.textContent = firstName ? firstName.charAt(0).toUpperCase() : 'U';
    if (sidebarFirst) sidebarFirst.textContent = firstName || 'Usuário';
}