// produto.js — carrega produto da API pelo id da URL

console.log(window.API_BASE);

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function toggleTag(tag, tags) {
    if (tag.classList.contains('active')) {
        tag.classList.remove('active', 'pink');
    } else {
        tags.forEach(t => t.classList.remove('active', 'pink'));
        tag.classList.add('active', 'pink');
    }
    checkSelection();
}

function checkSelection() {
    const btnEntregue = document.querySelector('.btn-entregue');
    const activeTags = document.querySelectorAll('.tag.active');
    if (activeTags.length === 2) {
        btnEntregue.classList.add('ready');
        btnEntregue.style.boxShadow = '0 4px 15px rgba(214, 71, 107, 0.4)';
    } else {
        btnEntregue.classList.remove('ready');
        btnEntregue.style.boxShadow = '';
    }
}

function abrirImagem() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'block';
}
function fecharImagem() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
}
window.abrirImagem = abrirImagem;
window.fecharImagem = fecharImagem;

function registrarEventos() {
    document.querySelectorAll('.column').forEach(column => {
        const tags = column.querySelectorAll('.tag:not(.center)');
        tags.forEach(tag => tag.addEventListener('click', () => toggleTag(tag, tags)));
    });

    const btnEntregue = document.querySelector('.btn-entregue');
    if (btnEntregue) {
        btnEntregue.addEventListener('click', () => {
            const selected = document.querySelectorAll('.tag.active');
            if (selected.length === 2) {
                alert('Interesse registrado! (integração com API em breve)');
            } else {
                alert('Por favor, selecione um Local e um Horário primeiro.');
            }
        });
    }
}

async function loadProduto() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    try {
        const res = await fetch(`${window.API_BASE}/produtos/${id}`);
        if (!res.ok) throw new Error('Produto não encontrado');
        const p = await res.json();

        // Imagem principal
        const mainImg = document.getElementById('product-main-image');
        if (mainImg && p.imagem) {
            mainImg.src = p.imagem;
            mainImg.onerror = () => { mainImg.src = '../assets/img/etrooc.png'; };
        }

        // Thumbnail do modal
        const thumbImg = document.querySelector('#gallery-thumbnails .miniatura');
        const modalImg = document.getElementById('modal-image');
        if (thumbImg && p.imagem) thumbImg.src = p.imagem;
        if (modalImg && p.imagem) modalImg.src = p.imagem;

        // Informações do produto
        const titleEl = document.getElementById('product-title');
        const priceEl = document.getElementById('product-price');
        const descEl  = document.getElementById('product-description');
        if (titleEl) titleEl.textContent = p.name || 'Produto';
        if (priceEl) priceEl.textContent = `R$ ${Number(p.preco || 0).toFixed(2).replace('.', ',')}`;
        if (descEl)  descEl.textContent  = p.descricao || '';

        // Informações do vendedor
        const sellerName = document.getElementById('seller-name');
        const sellerDept = document.getElementById('seller-dept');
        if (sellerName && p.user) sellerName.textContent = p.user.name || 'Vendedor';
        if (sellerDept && p.user) sellerDept.textContent = p.user.curso || '';

        // Título da página
        document.title = `ETROOC — ${escapeHtml(p.name || 'Produto')}`;

    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProduto();
    registrarEventos();
});
