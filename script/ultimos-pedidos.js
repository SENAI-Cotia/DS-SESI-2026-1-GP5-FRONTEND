// ultimos-pedidos.js — interesses do usuário logado como comprador

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatarStatus(status) {
    const mapa = { pendente: 'Pendente', concluido: 'Concluído', cancelado: 'Cancelado' };
    return mapa[status] || status;
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Há ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Há ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `Há ${days} dia${days > 1 ? 's' : ''}`;
}

async function retirarInteresse(interesseId) {
    if (!confirm('Deseja retirar seu interesse neste produto?')) return;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        const res = await fetch(`${window.API_BASE}/produtos/interesses/${interesseId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: Number(userId) }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Erro ${res.status}`);
        }

        // Remove o card sem recarregar
        const card = document.querySelector(`.pedido-card[data-id="${interesseId}"]`);
        if (card) card.remove();

        // Se ficou vazio, mostra mensagem
        const container = document.getElementById('pedidos-container');
        if (container && container.querySelectorAll('.pedido-card').length === 0) {
            container.innerHTML = '<p class="msg-vazia">Você ainda não demonstrou interesse em nenhum produto.</p>';
        }
    } catch (err) {
        console.error(err);
        alert(`Erro ao retirar interesse: ${err.message}`);
    }
}

function renderPedidos(pedidos) {
    const container = document.getElementById('pedidos-container');
    container.innerHTML = '';

    if (!pedidos || pedidos.length === 0) {
        container.innerHTML = '<p class="msg-vazia">Você ainda não demonstrou interesse em nenhum produto.</p>';
        return;
    }

    pedidos.forEach(pedido => {
        const preco = Number(pedido.produto?.preco || 0).toFixed(2).replace('.', ',');
        const imagem = Array.isArray(pedido.produto?.imagem)
            ? pedido.produto.imagem[0]
            : (pedido.produto?.imagem || '../assets/img/etrooc.png');

        const locais = Array.isArray(pedido.localEscolhido) ? pedido.localEscolhido.join(', ') : (pedido.localEscolhido || '-');
        const horarios = Array.isArray(pedido.horarioEscolhido) ? pedido.horarioEscolhido.join(', ') : (pedido.horarioEscolhido || '-');

        const card = document.createElement('div');
        card.className = 'pedido-card';
        card.dataset.id = pedido.id;

        const isVendido = pedido.produto?.disponibilidade === false;

        card.innerHTML = `
            <div class="pedido-img">
                <img src="${escapeHtml(imagem)}" alt="${escapeHtml(pedido.produto?.name || 'Produto')}"
                     onerror="this.src='../assets/img/etrooc.png'">
            </div>
            <div class="pedido-info">
                <strong>${escapeHtml(pedido.produto?.name || 'Produto')}${isVendido ? ' <span style="font-size:11px;background:#e74c3c;color:#fff;padding:2px 8px;border-radius:10px;vertical-align:middle;">Vendido</span>' : ''}</strong>
                <span>R$ ${preco} · ${timeAgo(pedido.createdAt)}</span>
                <span>Vendedor: ${escapeHtml(pedido.vendedor?.name || '-')} · ${escapeHtml(pedido.vendedor?.email || '')}</span>
                <span>Local: ${escapeHtml(locais)}</span>
                <span>Horário: ${escapeHtml(horarios)}</span>
            </div>
            <div class="pedido-acoes">
                <span class="pedido-status ${pedido.status}">${formatarStatus(pedido.status)}</span>
                <button class="btn-retirar-interesse" onclick="retirarInteresse(${pedido.id})">
                    <i class="fa-solid fa-xmark"></i> Retirar interesse
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

async function loadUltimosPedidos() {
    const container = document.getElementById('pedidos-container');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-lock"></i>
                <p>Você precisa estar conectado para ver seus ultimos pedidos.</p>
                <a href="login.html" class="btn-novo-item">Fazer Login</a>
            </div>`;
        return;
    }

    container.innerHTML = '<p class="msg-vazia">Carregando pedidos...</p>';

    try {
        const res = await fetch(`${window.API_BASE}/produtos/interesses/comprador?userId=${userId}`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const pedidos = await res.json();
        renderPedidos(pedidos);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="msg-vazia">Não foi possível carregar os pedidos. Tente novamente.</p>';
    }
}

window.retirarInteresse = retirarInteresse;
document.addEventListener('DOMContentLoaded', loadUltimosPedidos);
