// Página de confirmação de cadastro
const voltarBtn = document.querySelector(".voltar button");
const inicioBtn = document.querySelector(".branco button");

if (voltarBtn) {
    voltarBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.history.back();
    });
}

if (inicioBtn) {
    inicioBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = "inicio.html";
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName');
    if (userName) {
        const title = document.querySelector('.labelCad');
        if (title) title.textContent = 'Cadastro concluído, ' + userName + '!';
    }
});
