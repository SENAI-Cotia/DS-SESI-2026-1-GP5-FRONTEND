// ===============================
// EDITAR CAMPOS (CLIQUE NO LÁPIS)
// ===============================
const editIcons = document.querySelectorAll(".edit-icon");

editIcons.forEach(icon => {
    icon.addEventListener("click", () => {

        const field = icon.parentElement;
        const input = field.querySelector("input");

        // Se estiver bloqueado -> libera edição
        if (input.disabled) {
            input.disabled = false;
            input.focus();
            icon.classList.replace("fa-pen", "fa-check");
        }
        // Se já estiver editando -> salva e trava
        else {
            input.disabled = true;
            icon.classList.replace("fa-check", "fa-pen");
        }
    });
});


// ===================================
// TROCAR FOTO DO AVATAR (LETRA "M")
// ===================================
const avatar = document.getElementById("avatar");

// cria input invisível para selecionar imagem
const seletorImagem = document.createElement("input");
seletorImagem.type = "file";
seletorImagem.accept = "image/*";
seletorImagem.style.display = "none";
document.body.appendChild(seletorImagem);

// clicar no avatar abre o seletor
avatar.addEventListener("click", () => {
    seletorImagem.click();
});

// quando escolher imagem
seletorImagem.addEventListener("change", () => {

    const arquivo = seletorImagem.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = function(e) {

        // remove a letra M
        avatar.innerHTML = "";

        // cria a imagem
        const img = document.createElement("img");
        img.src = e.target.result;

        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.borderRadius = "50%";

        avatar.appendChild(img);

        // recoloca o ícone de editar no canto
        const lapis = document.createElement("i");
        lapis.className = "fa-solid fa-pen edit-pen-avatar";
        avatar.appendChild(lapis);
    };

    leitor.readAsDataURL(arquivo);
});