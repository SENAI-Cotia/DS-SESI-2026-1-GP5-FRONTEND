const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmar-senha");
const mensagem = document.getElementById("mensagem-senha");
const regrasItens = document.querySelectorAll(".regras-senha li");
const avancarBtn = document.querySelector(".branco button");
const voltarBtn = document.querySelector(".voltar button");

function storageAvailable(type) {
    try {
        const storage = window[type];
        const testKey = '__storage_test__';
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

function getStorageValue(key) {
    if (storageAvailable('localStorage')) {
        const localValue = localStorage.getItem(key);
        if (localValue !== null && localValue !== '') return localValue;
    }
    if (storageAvailable('sessionStorage')) {
        const sessionValue = sessionStorage.getItem(key);
        return sessionValue !== null ? sessionValue : '';
    }
    return '';
}

function setStorageValue(key, value) {
    if (storageAvailable('localStorage')) {
        localStorage.setItem(key, value);
    }
    if (storageAvailable('sessionStorage')) {
        sessionStorage.setItem(key, value);
    }
}

// Backwards-compatible alias used elsewhere in the scripts
function getStoredValue(key) {
    return getStorageValue(key);
}

function loadCadastroStep3() {
    senha.value = '';
    confirmarSenha.value = '';
    mensagem.textContent = '';
    atualizarRegras();

    const cadastro = getCadastroData();
    const missing = getMissingCadastroFields(cadastro);
    if (missing.length > 0) {
        alert(`Dados incompletos para cadastro: ${missing.join(', ')}. Volte para as etapas anteriores para preencher.`);
    }
}

function atualizarRegras() {
    const valor = senha.value;
    const regras = [
        /.{8,}/.test(valor),
        /[A-Z]/.test(valor),
        /[0-9]/.test(valor),
        /[!@#$%^&*]/.test(valor)
    ];

    regrasItens.forEach((item, index) => {
        item.classList.toggle('valid', regras[index]);
        item.classList.toggle('invalid', !regras[index]);
    });

    if (valor.length > 0) {
        if (regras.every(Boolean)) {
            mensagem.style.color = "green";
            mensagem.textContent = "Senha válida!";
        } else {
            mensagem.style.color = "red";
            mensagem.textContent = "A senha não atende todas as regras.";
        }
    } else {
        mensagem.textContent = "";
    }

    if (confirmarSenha.value.length > 0) {
        if (confirmarSenha.value !== valor) {
            mensagem.style.color = "red";
            mensagem.textContent = "As senhas não coincidem.";
        } else if (regras.every(Boolean)) {
            mensagem.style.color = "green";
            mensagem.textContent = "Senhas coincidem e são válidas!";
        }
    }
}

function validarSenha() {
    atualizarRegras();
}

function validarFormulario() {
    const senhaValor = senha.value;
    const confirmarSenhaValor = confirmarSenha.value;
    const regras = [
        /.{8,}/.test(senhaValor),
        /[A-Z]/.test(senhaValor),
        /[0-9]/.test(senhaValor),
        /[!@#$%^&*]/.test(senhaValor)
    ];

    if (!senhaValor || !confirmarSenhaValor) {
        alert("Por favor, preencha todos os campos de senha!");
        return false;
    }
    if (!regras.every(Boolean)) {
        alert("A senha não atende todas as regras:\n- Mínimo 8 caracteres\n- Pelo menos uma maiúscula\n- Pelo menos um número\n- Pelo menos um caractere especial (!@#$%^&*)");
        return false;
    }
    if (senhaValor !== confirmarSenhaValor) {
        alert("As senhas não coincidem!");
        confirmarSenha.focus();
        return false;
    }
    return true;
}

function getCadastroData() {
    const email = getStoredValue('cadastro_email').trim();
    const cpf = getStoredValue('cadastro_cpf').trim();
    const rm = getStoredValue('cadastro_rm').trim();
    const name = getStoredValue('cadastro_name').trim();
    const curso = getStoredValue('cadastro_curso').trim();
    const telNumero = getStoredValue('cadastro_telefone').trim();
    return { email, cpf, rm, name, curso, telNumero };
}

function getMissingCadastroFields(cadastro) {
    const missing = [];
    if (!cadastro.email) missing.push('E-mail');
    if (!cadastro.rm) missing.push('RM');
    if (!cadastro.name) missing.push('Nome');
    if (!cadastro.curso) missing.push('Curso');
    if (!cadastro.telNumero) missing.push('Telefone');
    return missing;
}

async function enviarCadastro() {
    const cadastro = getCadastroData();
    const missing = getMissingCadastroFields(cadastro);
    if (missing.length > 0) {
        alert(`Para concluir o cadastro, volte e preencha todas as etapas. Campos faltantes: ${missing.join(', ')}.`);
        console.warn('Dados de cadastro faltando:', cadastro);
        return;
    }

    // Match Prisma User model: email, password, name, rm (Int), curso, funcao, telNumero
    const payload = {
        email: cadastro.email,
        password: senha.value,
        name: cadastro.name,
        rm: Number(cadastro.rm) || 0,
        curso: cadastro.curso,
        funcao: 'aluno',
        telNumero: cadastro.telNumero
    };

    try {
        const response = await fetch(`${window.API_BASE}/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        let data = null;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.warn('Response is not JSON:', parseError);
        }

        if (!response.ok) {
            const message = (data && (data.error || data.message)) || `Erro ao concluir cadastro (${response.status})`;
            return alert(message);
        }

        // Backend returns { message: '...', user: { ... } }
        const userObj = (data && data.user) ? data.user : data;
        localStorage.setItem('userId', String(userObj.id));
        localStorage.setItem('userEmail', userObj.email);
        localStorage.setItem('userName', userObj.name);
        if (userObj.curso) localStorage.setItem('userCurso', userObj.curso);
        if (userObj.telNumero) localStorage.setItem('userTel', userObj.telNumero);
        if (userObj.rm) localStorage.setItem('userRm', String(userObj.rm));
        [
            'cadastro_email',
            'cadastro_cpf',
            'cadastro_rm',
            'cadastro_name',
            'cadastro_telefone',
            'cadastro_curso'
        ].forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        window.location.href = 'cadastro4.html';
    } catch (error) {
        console.error('Erro de rede no cadastro:', error);
        alert(`Erro de rede ao concluir cadastro: ${error.message}. Verifique se o backend está rodando em ${window.API_BASE}.`);
    }
}

if (avancarBtn) {
    avancarBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (validarFormulario()) {
            enviarCadastro();
        }
    });
} else {
    console.warn('Botão Avançar não encontrado em cadastro3.js');
}

if (voltarBtn) {
    voltarBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.history.back();
    });
} else {
    console.warn('Botão Voltar não encontrado em cadastro3.js');
}

senha.addEventListener("input", validarSenha);
confirmarSenha.addEventListener("input", validarSenha);

document.addEventListener('DOMContentLoaded', loadCadastroStep3);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toggle-senha').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            // Swap icon path to show strikethrough eye when visible
            const path = btn.querySelector('path');
            const circle = btn.querySelector('circle');
            if (isHidden) {
                // eye-off: add slash line
                btn.setAttribute('title', 'Ocultar senha');
                if (path) path.setAttribute('d', 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24');
                if (circle) circle.style.display = 'none';
                // Add the diagonal slash
                let line = btn.querySelector('line');
                if (!line) {
                    const svg = btn.querySelector('svg');
                    line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', '1'); line.setAttribute('y1', '1');
                    line.setAttribute('x2', '23'); line.setAttribute('y2', '23');
                    svg.appendChild(line);
                }
            } else {
                btn.setAttribute('title', 'Mostrar senha');
                if (path) path.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z');
                if (circle) circle.style.display = '';
                const line = btn.querySelector('line');
                if (line) line.remove();
            }
        });
    });
});