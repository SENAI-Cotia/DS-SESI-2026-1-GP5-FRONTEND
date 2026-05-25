const API_BASE = 'http://10.92.199.12:3000';

async function fetchProducts(categoria) {
    try {
        const url = categoria ? `${API_BASE}/produtos?categoria=${encodeURIComponent(categoria)}` : `${API_BASE}/produtos`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Falha ao buscar produtos');
        const produtos = await res.json();
        renderProducts(produtos);
    } catch (err) {
        console.error(err);
    }
}

function renderProducts(produtos) {
    const container = document.querySelector('.cards-container');
    if (!container) return;
    container.innerHTML = '';

    produtos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';

        const sellerName = p.user?.name || 'Usuário';
        const sellerCurso = p.user?.curso || '';
        const descricao = p.descricao || '';
        const imagem = p.imagem || '/assets/img/default.png';

        card.innerHTML = `
            <div class="card-header">
                <h3>${escapeHtml(sellerName)}</h3>
                <p>${escapeHtml(sellerCurso)} • Há 1 dia</p>
            </div>
            <div class="card-body">
                <p>${escapeHtml(descricao)}</p>
            </div>
            <div class="card-image">
                <img src="${imagem}" alt="${escapeHtml(p.name || '')}">
            </div>
            <div class="card-footer">
                <button onclick="location.href='produto.html?id=${p.id}'">Ver mais</button>
            </div>
        `;

        container.appendChild(card);
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    // load user info into header
    loadUserHeader();
    setWelcomeText();

    const busca = document.getElementById('txtBusca');
    if (busca) {
        busca.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.card').forEach(card => {
                const txt = card.innerText.toLowerCase();
                card.style.display = txt.includes(q) ? '' : 'none';
            });
        });
    }
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

async function loadUserHeader() {
    const nameEl = document.querySelector('.user-name');
    const cursoEl = document.querySelector('.user-curso');
    const avatarEl = document.querySelector('.user-info .avatar');

    if (!nameEl || !avatarEl) return;

    let userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Usuário';
    let userCurso = localStorage.getItem('userCurso') || '';
    const userId = localStorage.getItem('userId');

    if (userId && (!userName || userName === 'Usuário' || !userCurso)) {
        const apiUser = await fetchUserFromApi(userId);
        if (apiUser) {
            userName = apiUser.name || apiUser.user?.name || userName;
            userCurso = apiUser.curso || apiUser.user?.curso || userCurso;
            if (apiUser.email) localStorage.setItem('userEmail', apiUser.email);
            if (apiUser.name) localStorage.setItem('userName', apiUser.name);
        }
    }

    nameEl.textContent = userName;
    cursoEl.textContent = userCurso;
    avatarEl.textContent = userName.charAt(0).toUpperCase();
}

function setWelcomeText() {
    const welcomeEl = document.getElementById('welcomeText');
    const cursoEl = document.getElementById('welcomeCurso');
    if (!welcomeEl) return;
    const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Usuário';
    const userCurso = localStorage.getItem('userCurso') || localStorage.getItem('userCurso') || '';
    welcomeEl.textContent = `Bem-vindo, ${userName}`;
    if (cursoEl) cursoEl.textContent = userCurso;
}