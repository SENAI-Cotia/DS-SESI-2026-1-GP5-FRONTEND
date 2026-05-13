document.addEventListener('DOMContentLoaded', () => {
    const columns = document.querySelectorAll('.column');
    const btnEntregue = document.querySelector('.btn-entregue');

    columns.forEach(column => {
        const tags = column.querySelectorAll('.tag:not(.center)');

        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                if (tag.classList.contains('active')) {
                    // Deselect
                    tag.classList.remove('active');
                    tag.classList.remove('pink');
                } else {
                    // Remove a classe 'active' e 'pink' de todas as tags da mesma coluna
                    tags.forEach(t => {
                        t.classList.remove('active');
                        t.classList.remove('pink');
                    });

                    // Adiciona a classe ativa na tag clicada
                    tag.classList.add('active');
                    tag.classList.add('pink');
                }

                // Verifica se ambas as colunas têm uma seleção para animar o botão
                checkSelection();
            });
        });
    });

    function checkSelection() {
        const activeTags = document.querySelectorAll('.tag.active');
        if (activeTags.length === 2) {
            btnEntregue.classList.add('ready');
            btnEntregue.style.boxShadow = "0 4px 15px rgba(214, 71, 107, 0.4)";
        } else {
            btnEntregue.classList.remove('ready');
            btnEntregue.style.boxShadow = "";
        }
    }

    // Ação do botão
    btnEntregue.addEventListener('click', () => {
        const selected = document.querySelectorAll('.tag.active');
        if (selected.length === 2) {
            const local = selected[0].innerText.replace(' ✎', '');
            const horario = selected[1].innerText.replace(' ✎', '');
            alert(`Entrega confirmada!\nLocal: ${local}\nHorário: ${horario}`);
        } else {
            alert("Por favor, selecione um Local e um Horário primeiro.");
        }
    });


});

function abrirImagem() {
    document.getElementById("modal").style.display = "block";
}

function fecharImagem() {
    document.getElementById("modal").style.display = "none";
}