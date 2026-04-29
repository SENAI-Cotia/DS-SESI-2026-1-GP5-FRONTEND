const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmar-senha");
const mensagem = document.getElementById("mensagem-senha");

function validarSenha() {
    const valor = senha.value;

    // Regras de negócio
    const regras = [
        /.{8,}/.test(valor),          // mínimo 8 caracteres
        /[A-Z]/.test(valor),          // pelo menos uma maiúscula
        /[0-9]/.test(valor),          // pelo menos um número
        /[!@#$%^&*]/.test(valor)      // pelo menos um caractere especial
    ];

    // Verifica se todas as regras foram atendidas
    if (valor.length > 0) {
        if (regras.every(Boolean)) {
            mensagem.style.color = "green";
            mensagem.textContent = "Senha válida!";
        } else {
            mensagem.style.color = "red";
            mensagem.textContent = "A senha não atende todas as regras.";
        }
    } else {
        mensagem.textContent = ""; // limpa mensagem se campo vazio
    }

    // Verifica se confirmação coincide
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

senha.addEventListener("input", validarSenha);
confirmarSenha.addEventListener("input", validarSenha);

