const emailInput = document.getElementById("email");
const cpfInput = document.getElementById("cpf");
const rmInput = document.getElementById("rm");
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

function loadCadastroStep1() {
    emailInput.value = getStorageValue('cadastro_email');
    cpfInput.value = getStorageValue('cadastro_cpf');
    rmInput.value = getStorageValue('cadastro_rm');
}

function saveCadastroStep1() {
    setStorageValue('cadastro_email', emailInput.value.trim());
    setStorageValue('cadastro_cpf', cpfInput.value.trim());
    setStorageValue('cadastro_rm', rmInput.value.trim());
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

function validarRM(rm) {
    rm = rm.replace(/\D/g, "");
    return rm.length >= 6 && rm.length <= 7;
}

function validarFormulario() {
    const email = emailInput.value.trim();
    const cpf = cpfInput.value.trim();
    const rm = rmInput.value.trim();
    if (!email || !cpf || !rm) {
        alert("Por favor, preencha todos os campos!");
        return false;
    }
    if (!validarEmail(email)) {
        alert("E-mail inválido! Digite um e-mail válido.");
        emailInput.focus();
        return false;
    }
    if (!validarCPF(cpf)) {
        alert("CPF inválido! Verifique o CPF digitado.");
        cpfInput.focus();
        return false;
    }
    if (!validarRM(rm)) {
        alert("RM inválido! Deve conter entre 6 e 7 dígitos.");
        rmInput.focus();
        return false;
    }
    return true;
}

if (avancarBtn) {
    avancarBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (validarFormulario()) {
            saveCadastroStep1();
            window.location.href = "cadastro2.html";
        }
    });
} else {
    console.warn('Botão Avançar não encontrado em cadastro.js');
}

if (voltarBtn) {
    voltarBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.history.back();
    });
} else {
    console.warn('Botão Voltar não encontrado em cadastro.js');
}

document.addEventListener('DOMContentLoaded', loadCadastroStep1);
