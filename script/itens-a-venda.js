// itens-a-venda.js — Produtos do usuário logado
// API_BASE vem de navbar.js
function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
        const res = await fetch(`${window.API_BASE}/produtos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao excluir');
        // Remove o card da tela sem recarregar
        const card = document.querySelector(`.item-card[data-id="${id}"]`);
        if (card) card.remove();
    } catch (err) {
        console.error(err);
        alert('Não foi possível excluir o produto. Tente novamente.');
    }
}

async function marcarComoVendido(id) {
    if (!confirm('Marcar este produto como vendido? Ele não aparecerá mais no site.')) return;
    try {
        const res = await fetch(`${window.API_BASE}/produtos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ disponibilidade: false })
        });
        if (!res.ok) throw new Error('Erro ao marcar como vendido');
        // Remove o card da tela sem recarregar
        const card = document.querySelector(`.item-card[data-id="${id}"]`);
        if (card) card.remove();
        alert('Produto marcado como vendido!');
    } catch (err) {
        console.error(err);
        alert('Não foi possível marcar como vendido. Tente novamente.');
    }
}

async function loadItensAVenda() {
    const container = document.getElementById('itens-container');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-lock"></i>
                <p>Você precisa estar conectado para ver seus itens à venda.</p>
                <a href="login.html" class="btn-novo-item">Fazer Login</a>
            </div>
        `;
        return;
    }

    try {
        const res = await fetch(`${window.API_BASE}/produtos`);
        if (!res.ok) throw new Error('Erro ao buscar itens');
        const produtos = await res.json();
        
        // Filtrar apenas os produtos do usuário logado
        const meusProdutos = produtos.filter(p => Number(p.userId) === Number(userId));
        renderItens(meusProdutos);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="msg-vazia">Não foi possível carregar os itens. Tente novamente mais tarde.</p>';
    }
}

function renderItens(produtos) {
    const container = document.getElementById('itens-container');
    container.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-bag-shopping"></i>
                <p>Você ainda não tem itens à venda.</p>
                <a href="criarprod.html" class="btn-novo-item">Publicar primeiro item</a>
            </div>
        `;
        return;
    }

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.id = produto.id;

        const imagem = Array.isArray(produto.imagem) ? produto.imagem[0] : (produto.imagem || '../assets/img/etrooc.png');
        const preco = Number(produto.preco || 0).toFixed(2).replace('.', ',');
        const statusVendido = produto.disponibilidade ? '' : ' (Vendido)';

        card.innerHTML = `
            <div class="item-img">
                <img src="${escapeHtml(imagem)}" alt="${escapeHtml(produto.name || 'Produto')}" onerror="this.src='../assets/img/etrooc.png'">
            </div>
            <div class="item-info">
                <strong class="item-name">${escapeHtml(produto.name || 'Produto')}${statusVendido}</strong>
                <p class="item-desc">${escapeHtml(produto.descricao || '')}</p>
                <span class="item-price">R$ ${preco}</span>
            </div>
            <div class="item-actions">
                <a href="editarprod.html?id=${produto.id}" class="btn-editar">
                    <img src="../assets/icons/edit-pen.svg" alt="Editar"> Editar
                </a>
                <button class="btn-vendido" onclick="marcarComoVendido(${produto.id})" ${!produto.disponibilidade ? 'disabled' : ''}>
                    <i class="fa-solid fa-check"></i> Marcar como Vendido
                </button>
                <button class="btn-excluir" onclick="excluirProduto(${produto.id})">
                    <img src="../assets/icons/trash.svg" alt="Excluir"> Excluir
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

window.excluirProduto = excluirProduto;
window.marcarComoVendido = marcarComoVendido;
document.addEventListener('DOMContentLoaded', loadItensAVenda);