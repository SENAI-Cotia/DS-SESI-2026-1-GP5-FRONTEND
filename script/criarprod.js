const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const thumbnails = document.querySelectorAll('.thumbnail');
const publicarBtn = document.getElementById('publicar-btn');

let uploadedImages = [];
let currentMainIndex = 0;
let locais = [];
let horarios = [];

const MAX_ITEMS = 6;
const MAX_IMAGES = 5;

// =========================
// LOGIN CHECK
// =========================
const TRASH_SVG = `<svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 2V16C15 16.5 14.5 17 14 17H9H4C3.5 17 3 16.5 3 16V2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 2H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 1H11M7 6V13M11 6V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function checkLoginCriar() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showLoginRequiredCriar();
        return false;
    }
    return true;
}

function showLoginRequiredCriar() {
    const container = document.querySelector('.container');
    if (!container) return;
    container.innerHTML = `
        <div class="login-required-container" style="grid-column:1/-1; display:flex; align-items:center; justify-content:center; min-height:calc(100vh - 80px); width:100%; padding:20px; box-sizing:border-box;">
            <div style="background:rgba(255,255,255,0.92); border-radius:20px; box-shadow:0 8px 32px rgba(0,0,0,0.15); padding:48px 40px; max-width:440px; width:100%; display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px;">
                <i class="fa-solid fa-lock" style="font-size:48px; color:#d43768; margin-bottom:8px;"></i>
                <h2 style="font-size:24px; color:#222; margin:0;">Acesso Restrito</h2>
                <p style="font-size:16px; color:#666; margin:0;">Você precisa estar conectado para criar um produto.</p>
                <div style="display:flex; gap:16px; margin-top:12px; flex-wrap:wrap; justify-content:center;">
                    <a href="login.html" style="padding:12px 32px; background-color:#d43768; color:white; text-decoration:none; border-radius:8px; font-weight:700; font-size:15px;">Fazer Login</a>
                    <a href="cadastro.html" style="padding:12px 32px; background-color:#555; color:white; text-decoration:none; border-radius:8px; font-weight:700; font-size:15px;">Cadastro</a>
                </div>
            </div>
        </div>
    `;
}

// =========================
// UTIL
// =========================
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// =========================
// UPLOAD
// =========================
if (uploadArea) uploadArea.addEventListener('click', () => fileInput.click());

if (fileInput) fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImage(e.target.files[0]);
        e.target.value = '';
    }
});

if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e91e63';
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ddd';
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        if (e.dataTransfer.files.length > 0) handleImage(e.dataTransfer.files[0]);
    });
}

function handleImage(file) {
    if (!file.type.startsWith('image/')) { alert('Arquivo inválido'); return; }
    if (uploadedImages.length >= MAX_IMAGES) { alert(`Máximo de ${MAX_IMAGES} imagens`); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
        uploadedImages.push(ev.target.result);
        renderAll();
    };
    reader.readAsDataURL(file);
}

function renderAll() { renderMainImage(); renderThumbnails(); }

function renderMainImage() {
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
    const container = document.querySelector('.thumbnail-container');
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

            // Botão excluir imagem
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '×';
            removeBtn.className = 'thumb-remove';
            removeBtn.title = 'Remover imagem';
            removeBtn.type = 'button';
            removeBtn.style.cssText = `
                position:absolute;top:4px;right:4px;width:22px;height:22px;
                border:none;border-radius:50%;background:#d43768;color:#fff;
                cursor:pointer;opacity:0;transition:.2s;z-index:2;font-size:14px;
                display:flex;align-items:center;justify-content:center;line-height:1;
            `;
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                uploadedImages.splice(i, 1);
                if (currentMainIndex >= uploadedImages.length) {
                    currentMainIndex = Math.max(0, uploadedImages.length - 1);
                }
                renderAll();
            };
            thumb.appendChild(removeBtn);
            thumb.addEventListener('mouseenter', () => { removeBtn.style.opacity = '1'; });
            thumb.addEventListener('mouseleave', () => { removeBtn.style.opacity = '0'; });
            thumb.onclick = (e) => { e.stopPropagation(); currentMainIndex = i; renderMainImage(); };
        } else {
            thumb.innerHTML = `<span>+</span>`;
            thumb.onclick = (e) => { e.stopPropagation(); fileInput?.click(); };
        }

        container.appendChild(thumb);
    }
}

// =========================
// LOCAIS
// =========================
function renderLocais() {
    const container = document.getElementById('locais-list');
    if (!container) return;
    container.innerHTML = '';
    locais.forEach((local, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<span>${escapeHtml(local)}</span><button type="button" class="remove-btn delete-btn" data-index="${index}" title="Remover local">${TRASH_SVG}</button>`;
        div.querySelector('.remove-btn').addEventListener('click', () => { locais.splice(index, 1); renderLocais(); });
        container.appendChild(div);
    });
}

const addLocalBtn = document.getElementById('add-local-btn');
if (addLocalBtn) addLocalBtn.addEventListener('click', () => {
    if (locais.length >= MAX_ITEMS) { alert('Máximo de locais atingido'); return; }
    const novo = prompt('Digite o local');
    if (!novo) return;
    const valor = novo.trim();
    if (!valor) return;
    if (locais.includes(valor)) { alert('Local já adicionado'); return; }
    locais.push(valor);
    renderLocais();
});

// =========================
// HORÁRIOS
// =========================
function renderHorarios() {
    const container = document.getElementById('horarios-list');
    if (!container) return;
    container.innerHTML = '';
    horarios.forEach((horario, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<span>${escapeHtml(horario)}</span><button type="button" class="remove-btn delete-btn" data-index="${index}" title="Remover horário">${TRASH_SVG}</button>`;
        div.querySelector('.remove-btn').addEventListener('click', () => { horarios.splice(index, 1); renderHorarios(); });
        container.appendChild(div);
    });
}

const addHorarioBtn = document.getElementById('add-horario-btn');
if (addHorarioBtn) addHorarioBtn.addEventListener('click', () => {
    if (horarios.length >= MAX_ITEMS) { alert('Máximo de horários atingido'); return; }
    const novo = prompt('Digite o horário');
    if (!novo) return;
    const valor = novo.trim();
    if (!valor) return;
    if (horarios.includes(valor)) { alert('Horário já adicionado'); return; }
    horarios.push(valor);
    renderHorarios();
});

// =========================
// PUBLICAR
// =========================
async function publicar() {
    const nomeEl = document.getElementById('nome');
    const descricaoEl = document.getElementById('descricao');
    const precoEl = document.getElementById('preco');
    const condicaoEl = document.getElementById('condicao');

    const nome = nomeEl?.value.trim() || '';
    const descricao = descricaoEl?.value.trim() || '';
    const precoStr = (precoEl?.value || '').replace(/\./g, '').replace(',', '.');
    const preco = parseFloat(precoStr);

    if (!nome) { alert('Digite o nome'); return; }
    if (uploadedImages.length === 0) { alert('Adicione uma imagem'); return; }
    if (isNaN(preco) || preco <= 0) { alert('Digite um preço válido'); return; }

    const userId = localStorage.getItem('userId');
    if (!userId) { alert('Usuário não autenticado. Faça login primeiro.'); window.location.href = 'login.html'; return; }

    const condicao = parseInt(condicaoEl?.value || '5', 10);
    if (!Number.isInteger(condicao) || condicao < 1 || condicao > 10) {
        alert('Informe uma condição entre 1 e 10.');
        condicaoEl?.focus();
        return;
    }

    if (locais.length === 0) { alert('Adicione pelo menos um local de troca'); return; }
    if (horarios.length === 0) { alert('Adicione pelo menos um horário de troca'); return; }

    const payload = {
        name: nome,
        preco,
        condicao: condicao,
        imagem: uploadedImages.slice(0, MAX_IMAGES),
        descricao,
        disponibilidade: true,
        userId: Number(userId),
        local: locais,
        horario: horarios,
    };

    if (publicarBtn) {
        publicarBtn.disabled = true;
        publicarBtn.dataset.originalText = publicarBtn.textContent;
        publicarBtn.textContent = 'Publicando...';
    }

    try {
        const response = await fetch(`${window.API_BASE}/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || data.message || `Erro HTTP ${response.status}`);
        }

        alert('Produto publicado com sucesso!');
        window.location.href = 'itens-a-venda.html';
    } catch (error) {
        console.error('Erro ao publicar produto:', error);
        alert(`Erro ao publicar: ${error.message}`);
    } finally {
        if (publicarBtn) {
            publicarBtn.disabled = false;
            publicarBtn.textContent = publicarBtn.dataset.originalText || 'PUBLICAR';
        }
    }
}

if (publicarBtn) publicarBtn.addEventListener('click', publicar);
window.publicar = publicar;

// =========================
// PREÇO — máscara
// =========================
const precoInput = document.getElementById('preco');
if (precoInput) precoInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length === 0) { e.target.value = ''; return; }
    value = value.padStart(3, '0');
    value = value.slice(0, -2) + ',' + value.slice(-2);
    value = value.replace(/^0+(\d)/, '$1');
    e.target.value = value;
});

// =========================
// SLIDER condição
// =========================
const condicaoSlider = document.getElementById('condicao');
const condicaoValor = document.getElementById('condicaoValor');
if (condicaoSlider && condicaoValor) {
    condicaoValor.textContent = condicaoSlider.value;
    condicaoSlider.addEventListener('input', () => {
        condicaoValor.textContent = condicaoSlider.value;
    });
}

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
    if (!checkLoginCriar()) return;
    renderLocais();
    renderHorarios();
    renderAll();
});