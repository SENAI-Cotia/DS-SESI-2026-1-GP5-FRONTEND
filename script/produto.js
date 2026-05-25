// produto.js
// TODO: integrar com API para buscar detalhes do produto pelo id da URL
// const API_BASE = 'http://10.92.199.12:3000';
// Exemplo de chamada futura:
// const id = new URLSearchParams(window.location.search).get('id');
// const res = await fetch(`${API_BASE}/produtos/${id}`);
// const produto = await res.json();
// renderProduct(produto);
//
// Para enviar interesse futuramente:
// await fetch(`${API_BASE}/interesse`, { method: 'POST', body: JSON.stringify({ userId, produtoId, local, horario }) });

function toggleTag(tag, tags) {
    if (tag.classList.contains('active')) {
        tag.classList.remove('active');
        tag.classList.remove('pink');
    } else {
        tags.forEach(t => { t.classList.remove('active'); t.classList.remove('pink'); });
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
                // TODO: chamar API de interesse aqui
                alert('Interesse registrado! (integração com API em breve)');
            } else {
                alert('Por favor, selecione um Local e um Horário primeiro.');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', registrarEventos);
