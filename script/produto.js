const API_BASE = 'http://10.92.199.12:3000';
let currentProduct = null;

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function fetchProductDetails() {
    const id = getQueryParam('id');
    if (!id) return console.warn('Nenhum id de produto fornecido.');

    try {
        const res = await fetch(`${API_BASE}/produtos`);
        if (!res.ok) throw new Error('Erro ao buscar produtos');
        const produtos = await res.json();
        const product = produtos.find(item => String(item.id) === String(id));
        if (!product) return console.warn('Produto não encontrado.');
        currentProduct = product;
        renderProduct(product);
    } catch (error) {
        console.error(error);
    }
}

function renderProduct(produto) {
    const mainImage = document.getElementById('product-main-image');
    const modalImage = document.getElementById('modal-image');
    const sellerName = document.getElementById('seller-name');
    const sellerTime = document.getElementById('seller-time');
    const sellerDept = document.getElementById('seller-dept');
    const title = document.getElementById('product-title');
    const price = document.getElementById('product-price');
    const description = document.getElementById('product-description');

    const imageSrc = produto.imagem || '/assets/img/default.png';
    const seller = produto.user || {};

    if (mainImage) mainImage.src = imageSrc;
    if (modalImage) modalImage.src = imageSrc;
    if (sellerName) sellerName.textContent = seller.name || 'Usuário';
    if (sellerTime) sellerTime.textContent = 'Há alguns instantes';
    if (sellerDept) sellerDept.textContent = seller.curso || 'Curso';
    if (title) title.textContent = produto.name || 'Produto';
    if (price) price.textContent = `R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}`;
    if (description) description.textContent = produto.descricao || 'Sem descrição disponível.';
}

function toggleTag(tag, tags) {
    if (tag.classList.contains('active')) {
        tag.classList.remove('active');
        tag.classList.remove('pink');
    } else {
        tags.forEach(t => {
            t.classList.remove('active');
            t.classList.remove('pink');
        });
        tag.classList.add('active');
        tag.classList.add('pink');
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

async function enviarInteresse(local, horario) {
    if (!currentProduct) return alert('Produto não carregado ainda.');

    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = prompt('Informe seu userId para enviar interesse:');
        if (!userId) return alert('Operação cancelada.');
        localStorage.setItem('userId', userId);
    }

    try {
        const payload = {
            userId: Number(userId),
            produtoId: Number(currentProduct.id),
            local,
            horario
        };

        const res = await fetch(`${API_BASE}/interesse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            return alert('Falha ao enviar interesse: ' + (data.error || res.statusText));
        }
        alert(data.message || 'Interesse enviado com sucesso!');
    } catch (error) {
        console.error(error);
        alert('Erro de rede ao enviar interesse.');
    }
}

function registrarEventos() {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        const tags = column.querySelectorAll('.tag:not(.center)');
        tags.forEach(tag => {
            tag.addEventListener('click', () => toggleTag(tag, tags));
        });
    });

    const btnEntregue = document.querySelector('.btn-entregue');
    if (btnEntregue) {
        btnEntregue.addEventListener('click', () => {
            const selected = document.querySelectorAll('.tag.active');
            if (selected.length === 2) {
                const local = selected[0].innerText.trim();
                const horario = selected[1].innerText.trim();
                enviarInteresse(local, horario);
            } else {
                alert('Por favor, selecione um Local e um Horário primeiro.');
            }
        });
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

document.addEventListener('DOMContentLoaded', () => {
    registrarEventos();
    fetchProductDetails();
});