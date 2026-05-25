// comunidade.js
// Exibe produtos de usuários do mesmo curso do usuário logado.
// Se não houver curso no localStorage (ex: em testes), mostra todos.

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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

function loadNavbarComunidade() {
    const userName = localStorage.getItem('userName') || 'Usuário';
    const userCurso = localStorage.getItem('userCurso') || '';
    const firstName = userName.split(' ')[0] || 'Usuário';

    const nameEl = document.getElementById('nav-user-name');
    const cursoEl = document.getElementById('nav-user-curso');
    const avatarEl = document.getElementById('nav-avatar');

    if (nameEl) nameEl.textContent = userName;
    if (cursoEl) cursoEl.textContent = userCurso;
    if (avatarEl) avatarEl.textContent = firstName.charAt(0).toUpperCase();

    // Título dinâmico da seção
    const cursoTitle = document.getElementById('curso-title');
    if (cursoTitle) {
        cursoTitle.textContent = userCurso
            ? `Produtos do curso: ${userCurso}`
            : 'Todos os produtos da comunidade';
    }
}

function renderProdutosComunidade(produtos) {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px;color:#666;">
                <p style="font-size:18px;">Nenhum produto encontrado para seu curso.</p>
                <p style="margin-top:8px;font-size:14px;">Que tal <a href="criarprod.html" style="color:#f43170;">publicar o primeiro</a>?</p>
            </div>`;
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
                <button onclick="window.location.href='produto.html?id=${produto.id}'">Ver mais</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function loadComunidade() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">Carregando produtos da comunidade...</p>';

    const userCurso = localStorage.getItem('userCurso') || '';

    try {
        const res = await fetch(`${API_BASE}/produtos`);
        if (!res.ok) throw new Error('Erro ao buscar produtos');
        const todos = await res.json();

        // Filtra pelo curso do usuário; se não houver curso (testes), mostra tudo
        const filtrados = userCurso
            ? todos.filter(p => {
                const cursoProduto = p.user?.curso || p.curso || '';
                return cursoProduto.toLowerCase() === userCurso.toLowerCase();
              })
            : todos;

        renderProdutosComunidade(filtrados);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">Não foi possível carregar os produtos. Verifique sua conexão.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadNavbarComunidade();
    loadComunidade();

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
