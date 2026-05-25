const nomeInput = document.getElementById("nome");
const telefoneInput = document.getElementById("telefone");
const cursoSelect = document.getElementById("curso");
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

function loadCadastroStep2() {
    nomeInput.value = getStorageValue('cadastro_name');
    telefoneInput.value = getStorageValue('cadastro_telefone');
    cursoSelect.value = getStorageValue('cadastro_curso');
}

function saveCadastroStep2() {
    setStorageValue('cadastro_name', nomeInput.value.trim());
    setStorageValue('cadastro_telefone', telefoneInput.value.trim());
    setStorageValue('cadastro_curso', cursoSelect.value);
}

function validarNome(nome) {
    return nome.trim().length >= 3 && /^[a-záàâãéèêíïóôõöúçñ\s]+$/i.test(nome);
}

function validarTelefone(telefone) {
    const apenasNumeros = telefone.replace(/\D/g, "");
    return apenasNumeros.length === 10 || apenasNumeros.length === 11;
}

function validarFormulario() {
    const nome = nomeInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const curso = cursoSelect.value;
    if (!nome || !telefone || !curso) {
        alert("Por favor, preencha todos os campos!");
        return false;
    }
    if (!validarNome(nome)) {
        alert("Nome inválido! Digite um nome válido com pelo menos 3 caracteres.");
        nomeInput.focus();
        return false;
    }
    if (!validarTelefone(telefone)) {
        alert("Telefone inválido! Digite um telefone válido com 10 ou 11 dígitos.");
        telefoneInput.focus();
        return false;
    }
    if (!curso) {
        alert("Por favor, selecione um curso!");
        cursoSelect.focus();
        return false;
    }
    return true;
}

if (avancarBtn) {
    avancarBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (validarFormulario()) {
            saveCadastroStep2();
            window.location.href = "cadastro3.html";
        }
    });
} else {
    console.warn('Botão Avançar não encontrado em cadastro2.js');
}

if (voltarBtn) {
    voltarBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.history.back();
    });
} else {
    console.warn('Botão Voltar não encontrado em cadastro2.js');
}

document.addEventListener('DOMContentLoaded', loadCadastroStep2);
