// Shared SVG icons
const TRASH_SVG = `<svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 2V16C15 16.5 14.5 17 14 17H9H4C3.5 17 3 16.5 3 16V2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 2H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 1H11M7 6V13M11 6V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

let produtoOriginal = null;
let uploadedImages = [];
let currentMainIndex = 0;
let locais = [];
let horarios = [];
const MAX_IMAGES = 3;
const MAX_ITEMS = 6;

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ——— Segurança: valida propriedade antes de renderizar qualquer UI ———
async function carregarEValidar() {
    const container = document.getElementById('edit-container');
    const id = new URLSearchParams(window.location.search).get('id');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        container.innerHTML = `<div class="acesso-negado">
            <h2>Acesso negado</h2>
            <p>Você precisa estar logado para editar produtos.</p>
            <a href="login.html" style="color:#d43768;font-weight:600;">Fazer Login</a>
        </div>`;
        return;
    }

    if (!id || isNaN(Number(id))) {
        container.innerHTML = `<div class="acesso-negado"><h2>Produto inválido</h2><p>ID não encontrado.</p></div>`;
        return;
    }

    try {
        const res = await fetch(`${window.API_BASE}/produtos/${id}`);
        if (!res.ok) throw new Error('Produto não encontrado');
        const produto = await res.json();

        // VALIDAÇÃO DE PROPRIEDADE — frontend
        if (Number(produto.userId) !== Number(userId)) {
            container.innerHTML = `<div class="acesso-negado">
                <h2>Acesso negado</h2>
                <p>Você não tem permissão para editar este produto.</p>
                <a href="itens-a-venda.html" style="color:#d43768;font-weight:600;">Voltar para Itens à Venda</a>
            </div>`;
            return;
        }

        produtoOriginal = produto;
        renderForm(produto);
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="acesso-negado"><h2>Erro</h2><p>${escapeHtml(err.message)}</p></div>`;
    }
}

function renderForm(produto) {
    const container = document.getElementById('edit-container');

    // Prepara imagens existentes
    uploadedImages = Array.isArray(produto.imagem) ? [...produto.imagem] : (produto.imagem ? [produto.imagem] : []);
    locais = Array.isArray(produto.local) ? [...produto.local] : [];
    horarios = Array.isArray(produto.horario) ? [...produto.horario] : [];

    container.innerHTML = `
        <div>
            <div class="image-upload" id="uploadArea">
                ${uploadedImages.length > 0
                    ? `<img src="${escapeHtml(uploadedImages[0])}" style="width:100%;height:100%;object-fit:contain;padding:15px;">`
                    : `<div class="upload-icon">↑</div><span>ADICIONAR IMAGEM</span>`}
            </div>
            <input type="file" id="fileInput" accept="image/*" style="display:none;" multiple>
            <div class="thumbnail-container" id="thumb-container"></div>
        </div>

        <div class="form-section">
            <h1 class="form-header">EDITAR PRODUTO</h1>

            <!-- Status do produto -->
            <div class="status-bar">
                <label>Status:</label>
                <span class="status-badge ${produto.disponibilidade ? 'disponivel' : 'vendido'}" id="status-badge">
                    ${produto.disponibilidade ? 'Disponível' : 'Vendido'}
                </span>
                <button type="button" class="btn-status ${produto.disponibilidade ? 'btn-marcar-vendido' : 'btn-reativar'}"
                    id="btn-toggle-status" onclick="toggleStatus()">
                    ${produto.disponibilidade ? 'Marcar como Vendido' : 'Reativar Anúncio'}
                </button>
            </div>

            <div class="input-group">
                <label>NOME</label>
                <input type="text" id="nome" value="${escapeHtml(produto.name || '')}">
            </div>

            <div class="input-group">
                <label>PREÇO (R$)</label>
                <input type="text" id="preco" value="${Number(produto.preco || 0).toFixed(2).replace('.', ',')}">
            </div>

            <div class="input-group">
                <label>DESCRIÇÃO</label>
                <textarea class="description" id="descricao">${escapeHtml(produto.descricao || '')}</textarea>
            </div>

            <div class="condicao-row">
                <div class="condicao-wrapper">
                    <div class="condicao-header">
                        <label class="condicao-label">Condição do produto</label>
                        <span class="condicao-ajuda">1 = muito usado · 10 = novo</span>
                    </div>
                    <div class="condicao-slider-box">
                        <input type="range" id="condicao" min="1" max="10" value="${produto.condicao || 5}">
                        <span id="condicaoValor">${produto.condicao || 5}</span>
                    </div>
                </div>
            </div>

            <div class="two-columns">
                <div class="list-box">
                    <h3>Locais de troca disponíveis</h3>
                    <div id="locais-list"></div>
                    <button type="button" class="add-btn" id="add-local-btn"><strong>+</strong> Adicionar local</button>
                </div>
                <div class="list-box">
                    <h3>Horários de troca disponíveis</h3>
                    <div id="horarios-list"></div>
                    <button type="button" class="add-btn" id="add-horario-btn"><strong>+</strong> Adicionar horário</button>
                </div>
            </div>

            <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
                <button class="publicar-btn" style="background:#888;" onclick="window.location.href='itens-a-venda.html'">
                    CANCELAR
                </button>
                <button class="publicar-btn" id="salvar-btn" onclick="salvar()">SALVAR ALTERAÇÕES</button>
            </div>
        </div>
    `;

    // Bind events after rendering
    setupUpload();
    setupSlider();
    setupLocais();
    setupHorarios();
    renderThumbnails();
    renderLocais();
    renderHorarios();
}

function setupUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) { handleImage(e.target.files[0]); e.target.value = ''; }
    });
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = '#e91e63'; });
    uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = '#ddd'; });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault(); uploadArea.style.borderColor = '#ddd';
        if (e.dataTransfer.files.length > 0) handleImage(e.dataTransfer.files[0]);
    });
}

function handleImage(file) {
    if (!file.type.startsWith('image/')) { alert('Arquivo inválido'); return; }
    if (uploadedImages.length >= MAX_IMAGES) { alert(`Máximo de ${MAX_IMAGES} imagens`); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { uploadedImages.push(ev.target.result); renderMainImage(); renderThumbnails(); };
    reader.readAsDataURL(file);
}

function renderMainImage() {
    const uploadArea = document.getElementById('uploadArea');
    if (!uploadArea) return;
    uploadArea.innerHTML = '';
    if (uploadedImages.length === 0) {
        uploadArea.innerHTML = `<div class="upload-icon">↑</div><span>ADICIONAR IMAGEM</span>`;
        return;
    }
    const img = document.createElement('img');
    img.src = uploadedImages[currentMainIndex];
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:15px;';
    uploadArea.appendChild(img);
}

function renderThumbnails() {
    const container = document.getElementById('thumb-container');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < MAX_IMAGES; i++) {
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';

        if (uploadedImages[i]) {
            thumb.style.position = 'relative';

            const img = document.createElement('img');
            img.src = uploadedImages[i];
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            thumb.appendChild(img);

            // Botão excluir
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '×';
            removeBtn.className = 'thumb-remove';
            removeBtn.style.cssText = `
                position:absolute;
                top:4px;
                right:4px;
                width:22px;
                height:22px;
                border:none;
                border-radius:50%;
                background:#d43768;
                color:#fff;
                cursor:pointer;
                opacity:0;
                transition:.2s;
                z-index:2;
            `;

            removeBtn.onclick = (e) => {
                e.stopPropagation();

                uploadedImages.splice(i, 1);

                if (currentMainIndex >= uploadedImages.length) {
                    currentMainIndex = Math.max(0, uploadedImages.length - 1);
                }

                renderMainImage();
                renderThumbnails();
            };

            thumb.appendChild(removeBtn);

            thumb.addEventListener('mouseenter', () => {
                removeBtn.style.opacity = '1';
            });

            thumb.addEventListener('mouseleave', () => {
                removeBtn.style.opacity = '0';
            });

            thumb.onclick = () => {
                currentMainIndex = i;
                renderMainImage();
            };
        } else {
            thumb.innerHTML = `<span>+</span>`;
            thumb.onclick = () => document.getElementById('fileInput')?.click();
        }

        container.appendChild(thumb);
    }
}

function setupSlider() {
    const slider = document.getElementById('condicao');
    const val = document.getElementById('condicaoValor');
    if (slider && val) {
        slider.addEventListener('input', () => { val.textContent = slider.value; });
    }
}

function setupLocais() {
    const btn = document.getElementById('add-local-btn');
    if (btn) btn.addEventListener('click', () => {
        if (locais.length >= MAX_ITEMS) { alert('Máximo de locais atingido'); return; }
        const novo = prompt('Digite o local');
        if (!novo?.trim()) return;
        if (locais.includes(novo.trim())) { alert('Local já adicionado'); return; }
        locais.push(novo.trim());
        renderLocais();
    });
}

function setupHorarios() {
    const btn = document.getElementById('add-horario-btn');
    if (btn) btn.addEventListener('click', () => {
        if (horarios.length >= MAX_ITEMS) { alert('Máximo de horários atingido'); return; }
        const novo = prompt('Digite o horário');
        if (!novo?.trim()) return;
        if (horarios.includes(novo.trim())) { alert('Horário já adicionado'); return; }
        horarios.push(novo.trim());
        renderHorarios();
    });
}

function renderLocais() {
    const c = document.getElementById('locais-list');
    if (!c) return;
    c.innerHTML = '';
    locais.forEach((local, i) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<span>${escapeHtml(local)}</span><button type="button" class="remove-btn delete-btn" title="Remover local">${TRASH_SVG}</button>`;
        div.querySelector('.remove-btn').onclick = () => { locais.splice(i, 1); renderLocais(); };
        c.appendChild(div);
    });
}

function renderHorarios() {
    const c = document.getElementById('horarios-list');
    if (!c) return;
    c.innerHTML = '';
    horarios.forEach((h, i) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<span>${escapeHtml(h)}</span><button type="button" class="remove-btn delete-btn" title="Remover horário">${TRASH_SVG}</button>`;
        div.querySelector('.remove-btn').onclick = () => { horarios.splice(i, 1); renderHorarios(); };
        c.appendChild(div);
    });
}

async function toggleStatus() {
    if (!produtoOriginal) return;
    const novaDisp = !produtoOriginal.disponibilidade;
    const userId = localStorage.getItem('userId');
    try {
        const res = await fetch(`${window.API_BASE}/produtos/${produtoOriginal.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ disponibilidade: novaDisp, userId: Number(userId) }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Erro ${res.status}`);
        }
        produtoOriginal.disponibilidade = novaDisp;
        const badge = document.getElementById('status-badge');
        const btn = document.getElementById('btn-toggle-status');
        if (badge) {
            badge.className = `status-badge ${novaDisp ? 'disponivel' : 'vendido'}`;
            badge.textContent = novaDisp ? 'Disponível' : 'Vendido';
        }
        if (btn) {
            btn.className = `btn-status ${novaDisp ? 'btn-marcar-vendido' : 'btn-reativar'}`;
            btn.textContent = novaDisp ? 'Marcar como Vendido' : 'Reativar Anúncio';
        }
        alert(novaDisp ? 'Produto reativado!' : 'Produto marcado como vendido!');
    } catch (err) {
        alert(`Erro: ${err.message}`);
    }
}

async function salvar() {
    if (!produtoOriginal) return;
    const userId = localStorage.getItem('userId');
    const nome = document.getElementById('nome')?.value.trim();
    const descricao = document.getElementById('descricao')?.value.trim();
    const precoStr = (document.getElementById('preco')?.value || '').replace(/\./g, '').replace(',', '.');
    const preco = parseFloat(precoStr);
    const condicao = parseInt(document.getElementById('condicao')?.value || '5', 10);

    if (!nome) { alert('Digite o nome'); return; }
    if (isNaN(preco) || preco <= 0) { alert('Digite um preço válido'); return; }
    if (uploadedImages.length === 0) { alert('Adicione pelo menos uma imagem'); return; }
    if (locais.length === 0) { alert('Adicione pelo menos um local'); return; }
    if (horarios.length === 0) { alert('Adicione pelo menos um horário'); return; }

    const btn = document.getElementById('salvar-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    try {
        const res = await fetch(`${window.API_BASE}/produtos/${produtoOriginal.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nome,
                preco,
                condicao,
                imagem: uploadedImages,
                descricao,
                local: locais,
                horario: horarios,
                userId: Number(userId), // backend valida propriedade
            }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);

        alert('Produto atualizado com sucesso!');
        window.location.href = 'itens-a-venda.html';
    } catch (err) {
        console.error(err);
        alert(`Erro ao salvar: ${err.message}`);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'SALVAR ALTERAÇÕES'; }
    }
}

window.toggleStatus = toggleStatus;
window.salvar = salvar;

// Bind preço mask after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    carregarEValidar();
    document.addEventListener('input', (e) => {
        if (e.target.id === 'preco') {
            let v = e.target.value.replace(/\D/g, '');
            if (!v) { e.target.value = ''; return; }
            v = v.padStart(3, '0');
            v = v.slice(0, -2) + ',' + v.slice(-2);
            v = v.replace(/^0+(\d)/, '$1');
            e.target.value = v;
        }
    });
});
