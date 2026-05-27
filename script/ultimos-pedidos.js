
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('pedidos-container');
    if (container) {
        container.innerHTML = '<p class="msg-vazia">Você ainda não realizou nenhum pedido.</p>';
    }
});
