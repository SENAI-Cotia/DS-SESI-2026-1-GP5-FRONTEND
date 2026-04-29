// sidebar ativa
document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
        item.classList.add("active");
    });
});

// editar inputs
document.querySelectorAll(".edit-icon").forEach(icon => {
    icon.addEventListener("click", () => {
        const input = icon.parentElement.querySelector("input");
        input.disabled = false;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    });
});

// bloquear novamente
document.querySelectorAll(".field input").forEach(input => {
    input.addEventListener("blur", () => {
        input.disabled = true;
    });
});