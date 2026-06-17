// interesses-recebidos.js — interesses nos produtos do usuário logado (visão do vendedor)

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

function getInitial(name) {
    return (name || '?').trim().charAt(0).toUpperCase();
}

function renderInteresses(interesses) {
    const container = document.getElementById('interesses-container');
    if (!container) return; // Evita erros se a navbar rodar isso em uma página sem o container
    
    container.innerHTML = '';
    const sino = document.getElementById('sino-notificacao');

    if (!interesses || interesses.length === 0) {
        container.innerHTML = '<p class="msg-vazia">Nenhum interesse recebido ainda.</p>';
        return;
    } else {
        // muda src do sino para vermelho se houver interesses
        if (sino) sino.src = '../assets/icons/sino-ativo.svg';
    }

    interesses.forEach(item => {
        const preco = Number(item.produto?.preco || 0).toFixed(2).replace('.', ',');
        const locais = Array.isArray(item.localEscolhido) ? item.localEscolhido.join(', ') : (item.localEscolhido || '-');
        const horarios = Array.isArray(item.horarioEscolhido) ? item.horarioEscolhido.join(', ') : (item.horarioEscolhido || '-');

        const card = document.createElement('div');
        card.className = 'interesse-card';
        card.innerHTML = `
            <div class="interesse-avatar">${escapeHtml(getInitial(item.comprador?.name))}</div>
            <div class="interesse-info">
                <strong>${escapeHtml(item.comprador?.name || 'Comprador')}</strong>
                <span><i class="fa-solid fa-graduation-cap" style="color:#d43768;margin-right:4px;"></i>${escapeHtml(item.comprador?.curso || '-')}</span>
                <span><i class="fa-solid fa-envelope" style="color:#888;margin-right:4px;"></i>${escapeHtml(item.comprador?.email || '-')}</span>
                <span><i class="fa-solid fa-phone" style="color:#888;margin-right:4px;"></i>${escapeHtml(item.comprador?.telNumero || '-')}</span>
                <span><i class="fa-solid fa-location-dot" style="color:#888;margin-right:4px;"></i>Local: ${escapeHtml(locais)}</span>
                <span><i class="fa-solid fa-clock" style="color:#888;margin-right:4px;"></i>Horário: ${escapeHtml(horarios)}</span>
                <span class="interesse-produto">
                    <i class="fa-solid fa-tag"></i> ${escapeHtml(item.produto?.name || 'Produto')} — R$ ${preco}
                </span>
            </div>
            <div class="interesse-meta">
                <span class="badge-status">${escapeHtml(item.status || 'pendente')}</span>
                <span class="interesse-detalhe">${timeAgo(item.createdAt)}</span>
                <a href="editarprod.html?id=${item.produto?.id}" style="font-size:13px;color:#d43768;font-weight:600;">Ver produto</a>
            </div>
        `;
        container.appendChild(card);
    });
}

export async function buscarInteresses(userId) {
    try {
        const res = await fetch(`${window.API_BASE}/produtos/interesses/vendedor?userId=${userId}`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);

        const interesses = await res.json();

        // Executa a renderização normal da página de interesses (se o usuário estiver nela)
        if (typeof renderInteresses === 'function') {
            renderInteresses(interesses);
        }

        // RETORNA os dados para a navbar conseguir ler
        return interesses;

    } catch (err) {
        console.error(err);
        const container = document.getElementById('interesses-container');
        if (container) {
            container.innerHTML = '<p class="msg-vazia">Não foi possível carregar os interesses. Tente novamente.</p>';
        }
        return []; // Retorna uma lista vazia em caso de erro para não quebrar o código
    }
}

async function loadInteressesRecebidos() {
    const container = document.getElementById('interesses-container');
    const userId = localStorage.getItem('userId');

    // Se não estiver na página que tem o container de interesses, não faz nada
    if (!container) return;

    if (!userId) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-lock"></i>
                <p>Você precisa estar conectado para ver seus interesses recebidos.</p>
                <a href="login.html" class="btn-novo-item">Fazer Login</a>
            </div>`;
        return;
    }

    // Chama a função que agora está no escopo global do arquivo
    await buscarInteresses(userId);
}

document.addEventListener('DOMContentLoaded', loadInteressesRecebidos);
