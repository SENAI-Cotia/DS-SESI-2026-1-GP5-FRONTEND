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

async function loadItensAVenda() {
    const container = document.getElementById('itens-container');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        container.innerHTML = '<p class="msg-vazia">Faça login para ver seus itens à venda.</p>';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/produtos/vendidos/${userId}`);
        if (!res.ok) throw new Error('Erro ao buscar itens');
        const produtos = await res.json();
        renderItens(produtos);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="msg-vazia">Não foi possível carregar seus itens. Tente novamente mais tarde.</p>';
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

        const imagem = produto.imagem || '../assets/img/default.png';
        const preco = Number(produto.preco || 0).toFixed(2).replace('.', ',');

        card.innerHTML = `
            <div class="item-img">
                <img src="${escapeHtml(imagem)}" alt="${escapeHtml(produto.name || 'Produto')}">
            </div>
            <div class="item-info">
                <strong class="item-name">${escapeHtml(produto.name || 'Produto')}</strong>
                <p class="item-desc">${escapeHtml(produto.descricao || '')}</p>
                <span class="item-price">R$ ${preco}</span>
            </div>
            <div class="item-actions">
                <a href="produto.html?id=${produto.id}" class="btn-ver">Ver</a>
            </div>
        `;

        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadItensAVenda);
