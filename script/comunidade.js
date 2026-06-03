// comunidade.js


function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getUserInitial(nomeCompleto) {
    if (!nomeCompleto) return '?';

    const primeiroNome = nomeCompleto.trim().split(' ')[0];

    return primeiroNome.charAt(0).toUpperCase();
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

let todosProdutos = [];
let cursoFiltrado = ''; // '' = todos

function renderProdutos(produtos) {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px;color:#666;width:100%;">
                <p style="font-size:18px;">Nenhum produto encontrado para este curso.</p>
                <p style="margin-top:8px;font-size:14px;">Que tal <a href="criarprod.html" style="color:#f43170;">publicar o primeiro</a>?</p>
            </div>`;
        return;
    }

    produtos.forEach(produto => {
        const imagem = Array.isArray(produto.imagem) ? produto.imagem[0] : (produto.imagem || '../assets/img/etrooc.png');
        const preco = Number(produto.preco || 0).toFixed(2).replace('.', ',');
        const vendedor = produto.user?.name || 'Vendedor';
        const inicialVendedor = getUserInitial(vendedor);
        const curso = produto.user?.curso || '';
        const tempo = timeAgo(produto.createdAt);
        const subtitulo = [curso, tempo].filter(Boolean).join(' • ');

        const card = document.createElement('div');
        card.className = 'card';
        // Card inteiro clicável leva à página do produto
        card.style.cursor = 'pointer';
        card.onclick = () => window.location.href = `produto.html?id=${produto.id}`;

        card.innerHTML = `
            <div class="card-header">
                <div class="card-user">

                    <div class="card-avatar">
                        ${inicialVendedor}
                    </div>

                    <div class="card-user-info">
                        <h3>${escapeHtml(vendedor)}</h3>
                        <p>${escapeHtml(subtitulo)}</p>
                    </div>

                </div>
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

function aplicarFiltro() {
    const q = (document.getElementById('txtBusca')?.value || '').toLowerCase();
    let filtrados = cursoFiltrado
        ? todosProdutos.filter(p => (p.user?.curso || '').toLowerCase() === cursoFiltrado.toLowerCase())
        : todosProdutos;

    if (q) {
        filtrados = filtrados.filter(p =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.descricao || '').toLowerCase().includes(q) ||
            (p.user?.name || '').toLowerCase().includes(q)
        );
    }
    renderProdutos(filtrados);
}

function atualizarTitulo() {
    const cursoTitle = document.getElementById('curso-title');
    if (!cursoTitle) return;
    cursoTitle.textContent = cursoFiltrado
        ? `Produtos: ${cursoFiltrado}`
        : 'Todos os produtos da comunidade';
}

async function loadComunidade() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;width:100%;">Carregando produtos...</p>';

    try {
        const res = await fetch(`${window.API_BASE}/produtos`);
        if (!res.ok) throw new Error('Erro ao buscar produtos');
        todosProdutos = (await res.json()).filter(
            produto => produto.disponibilidade === true
        );

        // Pré-selecionar curso do usuário logado se existir
        const userCurso = localStorage.getItem('userCurso') || '';
        if (userCurso) {
            cursoFiltrado = userCurso;
            document.querySelectorAll('.curso-btn').forEach(btn => {
                btn.classList.toggle('ativo', btn.dataset.curso === userCurso);
            });
            atualizarTitulo();
        }

        aplicarFiltro();
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;width:100%;">Não foi possível carregar os produtos. Verifique sua conexão.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Navbar
    const userName = localStorage.getItem('userName') || 'Usuário';
    const userCurso = localStorage.getItem('userCurso') || '';
    const firstName = userName.split(' ')[0];
    const nameEl = document.getElementById('nav-user-name');
    const cursoEl = document.getElementById('nav-user-curso');
    const avatarEl = document.getElementById('nav-avatar');
    if (nameEl) nameEl.textContent = userName;
    if (cursoEl) cursoEl.textContent = userCurso;
    if (avatarEl) avatarEl.textContent = firstName.charAt(0).toUpperCase();

    // Sidebar: clique nos botões de curso
    document.querySelectorAll('.curso-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.curso-btn').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            cursoFiltrado = btn.dataset.curso;
            atualizarTitulo();
            aplicarFiltro();
        });
    });

    // Busca por texto
    const busca = document.getElementById('txtBusca');
    if (busca) busca.addEventListener('input', aplicarFiltro);

    loadComunidade();
});
