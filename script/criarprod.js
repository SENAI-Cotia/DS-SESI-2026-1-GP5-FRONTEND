// ==================== ELEMENTOS ====================
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const thumbnails = document.querySelectorAll('.thumbnail');

// Arrays com apenas 1 item inicial
let uploadedImages = [];
let currentMainIndex = 0;
let locais = ["Pátio 1"];           
let horarios = ["7h15"];          

const MAX_ITEMS = 6;


uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => e.target.files.length > 0 && handleImage(e.target.files[0]));

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#e91e63';
});
uploadArea.addEventListener('dragleave', () => uploadArea.style.borderColor = '#ddd');
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    if (e.dataTransfer.files.length > 0) handleImage(e.dataTransfer.files[0]);
});

function handleImage(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            uploadedImages.unshift(ev.target.result);
            currentMainIndex = 0;
            renderAll();
        };
        reader.readAsDataURL(file);
    }
}

function renderAll() {
    renderMainImage();
    renderThumbnails();
}


function renderMainImage() {
    uploadArea.innerHTML = '';
    if (uploadedImages.length === 0) {
        uploadArea.innerHTML = `
            <div class="upload-icon">↑</div>
            <span>ADICIONAR IMAGEM</span>
        `;
        return;
    }
    const img = document.createElement('img');
    img.src = uploadedImages[currentMainIndex];
    uploadArea.appendChild(img);
}

function renderThumbnails() {
    thumbnails.forEach((thumb, index) => {
        thumb.innerHTML = '';
        thumb.style.cursor = 'pointer';

        if (uploadedImages[index]) {
            const img = document.createElement('img');
            img.src = uploadedImages[index];
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            thumb.appendChild(img);

            thumb.onclick = () => {
                currentMainIndex = index;
                renderMainImage();
            };

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-thumb-btn';
            delBtn.innerHTML = '×';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                deleteImage(index);
            };
            thumb.appendChild(delBtn);
        } else {
            thumb.innerHTML = `<span>+</span>`;
            thumb.onclick = () => fileInput.click();
        }
    });
}

function deleteImage(index) {
    if (confirm("Excluir esta imagem?")) {
        uploadedImages.splice(index, 1);
        if (index < currentMainIndex) currentMainIndex--;
        if (currentMainIndex >= uploadedImages.length) currentMainIndex = 0;
        renderAll();
    }
}



function renderLocais() {
    const container = document.getElementById('locais-list');
    container.innerHTML = '';
    
    locais.forEach((local, index) => {
        const item = createListItem(local, index, 'local');
        container.appendChild(item);
    });
}

function renderHorarios() {
    const container = document.getElementById('horarios-list');
    container.innerHTML = '';
    
    horarios.forEach((horario, index) => {
        const item = createListItem(horario, index, 'horario');
        container.appendChild(item);
    });
}

function createListItem(text, index, type) {
    const div = document.createElement('div');
    div.className = 'list-item';
    
    div.innerHTML = `
        <span class="editable">${text}</span>
        <div class="actions">
            <button class="edit-btn" title="Editar"><img src="/assets/icons/edit-pen.svg" alt="Editar"></button>
            <button class="delete-btn" title="Excluir"><img src="/assets/icons/trash.svg" alt="Excluir"></button>
        </div>
    `;

    div.querySelector('.edit-btn').addEventListener('click', () => editItem(div, index, type));
    
    div.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm(`Excluir este ${type === 'local' ? 'local' : 'horário'}?`)) {
            if (type === 'local') {
                locais.splice(index, 1);
                renderLocais();
            } else {
                horarios.splice(index, 1);
                renderHorarios();
            }
        }
    });

    return div;
}

function editItem(itemElement, index, type) {
    const span = itemElement.querySelector('.editable');
    const oldText = span.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldText;
    input.className = 'edit-input';

    itemElement.replaceChild(input, span);
    input.focus();

    function save() {
        const newText = input.value.trim();
        if (newText) {
            if (type === 'local') locais[index] = newText;
            else horarios[index] = newText;
        }
        if (type === 'local') renderLocais();
        else renderHorarios();
    }

    input.addEventListener('blur', save);
    input.addEventListener('keypress', (e) => e.key === 'Enter' && save());
}


document.getElementById('add-local-btn').addEventListener('click', () => {
    if (locais.length >= MAX_ITEMS) {
        alert(`Você já atingiu o máximo de ${MAX_ITEMS} locais.`);
        return;
    }
    const novo = prompt("Digite o nome do novo local:");
    if (novo && novo.trim()) {
        locais.push(novo.trim());
        renderLocais();
    }
});

document.getElementById('add-horario-btn').addEventListener('click', () => {
    if (horarios.length >= MAX_ITEMS) {
        alert(`Você já atingiu o máximo de ${MAX_ITEMS} horários.`);
        return;
    }
    const novo = prompt("Digite o novo horário (ex: 13h45):");
    if (novo && novo.trim()) {
        horarios.push(novo.trim());
        renderHorarios();
    }
});

function publicar() {
    const nome = document.getElementById('nome').value.trim();
    if (!nome) return alert("Por favor, preencha o nome do produto!");
    if (uploadedImages.length === 0) return alert("Adicione pelo menos uma imagem!");

    alert(`✅ Produto "${nome}" publicado com sucesso!\n\nLocais: ${locais.length}/6\nHorários: ${horarios.length}/6`);
}

document.getElementById('preco').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, -2) + ',' + value.slice(-2);
    e.target.value = value;
});


renderLocais();
renderHorarios();