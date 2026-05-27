// inicio.js

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

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

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Há ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Há ${hrs} hora${hrs > 1 ? 's' : ''}`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `Há ${days} dia${days > 1 ? 's' : ''}`;
    const weeks = Math.floor(days / 7);
    return `Há ${weeks} semana${weeks > 1 ? 's' : ''}`;
}

function renderProdutos(produtos) {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">Nenhum produto disponível no momento.</p>';
        return;
    }

    produtos.forEach(produto => {
        const imagem = produto.imagem || '../assets/img/etrooc.png';
        const preco = Number(produto.preco || 0).toFixed(2).replace('.', ',');
        const vendedor = produto.user?.name || produto.user?.name || 'Vendedor';
        const curso = produto.user?.curso || produto.curso || '';
        const tempo = timeAgo(produto.createdAt || produto.criadoEm);
        const subtitulo = [curso, tempo].filter(Boolean).join(' • ');

        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';
        card.onclick = () => window.location.href = `produto.html?id=${produto.id}`;
        card.innerHTML = `
            <div class="card-header">
                <h3>${escapeHtml(vendedor)}</h3>
                <p>${escapeHtml(subtitulo)}</p>
            </div>
            <div class="card-body">
                <p>${escapeHtml(produto.descricao || produto.name || '')}</p>
            </div>
            <div class="card-image">
                <img src="${escapeHtml(imagem)}" alt="${escapeHtml(produto.name || 'Produto')}" onerror="this.src='../assets/img/etrooc.png'">
            </div>
            <div class="card-footer">
                <span style="font-weight:bold;color:#f43170;margin-right:10px;">R$ ${preco}</span>
                <button onclick="event.stopPropagation(); window.location.href='produto.html?id=${produto.id}'">Ver mais</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function loadProdutos() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">Carregando produtos...</p>';

    try {
        const res = await fetch(`${window.API_BASE}/produtos`);
        if (!res.ok) throw new Error('Erro ao buscar produtos');
        const produtos = await res.json();
        renderProdutos(produtos);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">Não foi possível carregar os produtos. Verifique sua conexão.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadNavbarInicio();
    loadProdutos();

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
