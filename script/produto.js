// produto.js — carrega produto da API pelo id da URL

let currentProdutoId = null;
let selectedLocal = null;
let selectedHorario = null;

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

function renderLocaisHorarios(locaisArray, horariosArray) {
    const locaisContainer = document.getElementById('locais-container');
    const horariosContainer = document.getElementById('horarios-container');

    // Lista de locais/horários sugeridos se o backend não retornar dados reais
    const locaisSugeridos = locaisArray && locaisArray.length > 0 ? locaisArray : ['Campus', 'Biblioteca', 'Sala de aula', 'Outro'];
    const horariosSugeridos = horariosArray && horariosArray.length > 0 ? horariosArray : ['Manhã', 'Tarde', 'Noite', 'Fim de semana'];

    if (locaisContainer) {
        locaisContainer.innerHTML = '';
        locaisSugeridos.forEach(local => {
            const tag = document.createElement('span');
            tag.className = 'tag local-tag';
            tag.textContent = escapeHtml(local);
            tag.style.cursor = 'pointer';
            tag.addEventListener('click', () => {
                document.querySelectorAll('.local-tag').forEach(t => t.classList.remove('active', 'pink'));
                tag.classList.add('active', 'pink');
                selectedLocal = local;
                checkSelection();
            });
            locaisContainer.appendChild(tag);
        });
    }

    if (horariosContainer) {
        horariosContainer.innerHTML = '';
        horariosSugeridos.forEach(horario => {
            const tag = document.createElement('span');
            tag.className = 'tag horario-tag';
            tag.textContent = escapeHtml(horario);
            tag.style.cursor = 'pointer';
            tag.addEventListener('click', () => {
                document.querySelectorAll('.horario-tag').forEach(t => t.classList.remove('active', 'pink'));
                tag.classList.add('active', 'pink');
                selectedHorario = horario;
                checkSelection();
            });
            horariosContainer.appendChild(tag);
        });
    }
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
    const hasLocalSelected = document.querySelector('.local-tag.active') !== null;
    const hasHorarioSelected = document.querySelector('.horario-tag.active') !== null;

    if (hasLocalSelected && hasHorarioSelected) {
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

async function enviarInteresse() {
    const userId = localStorage.getItem('userId');
    const produtoId = currentProdutoId;

    if (!userId) {
        alert('Faça login para demonstrar interesse');
        return;
    }

    if (!selectedLocal || !selectedHorario) {
        alert('Por favor, selecione um Local e um Horário primeiro.');
        return;
    }

    const payload = {
        userId: Number(userId),
        produtoId: Number(produtoId),
        local: [selectedLocal],
        horario: [selectedHorario]
    };

    const btnEntregue = document.querySelector('.btn-entregue');
    btnEntregue.disabled = true;
    btnEntregue.textContent = 'Enviando...';

    try {
        const res = await fetch(`${window.API_BASE}/produtos/interesse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.error || `Erro ${res.status}`);
        }

        alert('Interesse registrado com sucesso! O vendedor receberá sua notificação.');
        // Reset da seleção
        selectedLocal = null;
        selectedHorario = null;
        document.querySelectorAll('.tag').forEach(t => t.classList.remove('active', 'pink'));
        btnEntregue.textContent = 'DEMONSTRAR INTERESSE';
        checkSelection();
    } catch (err) {
        console.error(err);
        alert(`Erro ao registrar interesse: ${err.message}`);
    } finally {
        btnEntregue.disabled = false;
        btnEntregue.textContent = 'DEMONSTRAR INTERESSE';
    }
}

function registrarEventos() {
    const btnEntregue = document.querySelector('.btn-entregue');
    if (btnEntregue) {
        btnEntregue.addEventListener('click', enviarInteresse);
    }
}

async function loadProduto() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    currentProdutoId = id;

    try {
        const res = await fetch(`${window.API_BASE}/produtos/${id}`);
        if (!res.ok) throw new Error('Produto não encontrado');
        const p = await res.json();

        // Imagem principal
        const mainImg = document.getElementById('product-main-image');
        if (mainImg && p.imagem) {
            const imgSrc = Array.isArray(p.imagem) ? p.imagem[0] : p.imagem;
            mainImg.src = imgSrc;
            mainImg.onerror = () => { mainImg.src = '../assets/img/etrooc.png'; };
        }

        // Thumbnail do modal
        const gallery = document.getElementById('gallery-thumbnails');
        const modalImg = document.getElementById('modal-image');

        if (gallery && p.imagem) {

            const imagens = Array.isArray(p.imagem)
                ? p.imagem
                : [p.imagem];

            gallery.innerHTML = '';

            imagens.forEach((imgSrc, index) => {

                const thumb = document.createElement('img');

                thumb.src = imgSrc;
                thumb.className = 'miniatura';
                thumb.alt = `Thumb ${index + 1}`;

                thumb.addEventListener('click', () => {

                    if (mainImg) {
                        mainImg.src = imgSrc;
                    }

                    if (modalImg) {
                        modalImg.src = imgSrc;
                    }

                    abrirImagem();
                });

                gallery.appendChild(thumb);
            });
        }

        // Informações do produto
        const titleEl = document.getElementById('product-title');
        const priceEl = document.getElementById('product-price');
        const descEl = document.getElementById('product-description');
        if (titleEl) titleEl.textContent = p.name || 'Produto';
        if (priceEl) priceEl.textContent = `R$ ${Number(p.preco || 0).toFixed(2).replace('.', ',')}`;
        if (descEl) descEl.textContent = p.descricao || '';

        // Condição do produto
        const conditionEl = document.getElementById('product-condition');
        if (conditionEl) {
            conditionEl.textContent = `${p.condicao != null ? p.condicao : 'N/A'}/10`;
            if (p.condicao != null) {
                if (p.condicao >= 6) {
                    conditionEl.style.color = '#4CAF50';
                } else if (p.condicao >= 3) {
                    conditionEl.style.color = '#FF9800';
                } else {
                    conditionEl.style.color = '#F44336';
                }
            }
        }

        // Bloquear interesse em produto vendido
        if (p.disponibilidade === false) {
            const btnEntregue = document.querySelector('.btn-entregue');
            if (btnEntregue) {
                btnEntregue.disabled = true;
                btnEntregue.textContent = 'PRODUTO VENDIDO';
                btnEntregue.style.cssText += 'background:#aaa;cursor:not-allowed;opacity:0.7;';
            }
            // Exibir badge de vendido
            const titleEl = document.getElementById('product-title');
            if (titleEl) {
                const badge = document.createElement('span');
                badge.textContent = 'Vendido';
                badge.style.cssText = 'font-size:13px;background:#e74c3c;color:#fff;padding:3px 10px;border-radius:12px;margin-left:10px;vertical-align:middle;';
                titleEl.appendChild(badge);
            }
        }

        // Informações do vendedor
        const sellerName = document.getElementById('seller-name');
        const sellerDept = document.getElementById('seller-dept');
        const sellerAvatar = document.getElementById('sidebar-avatar-product-owner');

        if (p.user) {

            if (sellerName) {
                sellerName.textContent = p.user.name || 'Vendedor';
            }

            if (sellerDept) {
                sellerDept.textContent = p.user.curso || '';
            }

            if (sellerAvatar) {
                sellerAvatar.textContent = getUserInitial(p.user.name);
            }

        }

        // Renderizar locais e horários: tenta extrair do produto ou fazer fetch adicional
        let locaisArray = [];
        let horariosArray = [];

        // Se o backend retornar dados diretos (local/horario com strings JSON)
        if (p.local) {
            locaisArray = typeof p.local === 'string' ? JSON.parse(p.local) : p.local;
        }
        if (p.horario) {
            horariosArray = typeof p.horario === 'string' ? JSON.parse(p.horario) : p.horario;
        }

        // Se não tiver dados diretos, tenta buscar de forma alternativa (fallback)
        if (locaisArray.length === 0 || horariosArray.length === 0) {
            try {
                const allRes = await fetch(`${window.API_BASE}/produtos`);
                if (allRes.ok) {
                    const allProducts = await allRes.json();
                    const foundProd = allProducts.find(prod => prod.id === Number(id));
                    if (foundProd) {
                        if (foundProd.local && locaisArray.length === 0) {
                            locaisArray = typeof foundProd.local === 'string' ? JSON.parse(foundProd.local) : foundProd.local;
                        }
                        if (foundProd.horario && horariosArray.length === 0) {
                            horariosArray = typeof foundProd.horario === 'string' ? JSON.parse(foundProd.horario) : foundProd.horario;
                        }
                    }
                }
            } catch (altErr) {
                console.warn('Falha ao buscar dados alternativos de local/horario:', altErr);
            }
        }

        renderLocaisHorarios(locaisArray, horariosArray);

    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProduto();
    registrarEventos();
});
