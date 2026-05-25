// ultimos-pedidos.js
// TODO: integrar com API quando fluxo de login estiver pronto
// const API_BASE = 'http://10.92.199.12:3000';
// Exemplo de chamada futura:
// const res = await fetch(`${API_BASE}/interesse/usuario/${userId}`);

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('pedidos-container');
    if (container) {
        container.innerHTML = '<p class="msg-vazia">Você ainda não realizou nenhum pedido.</p>';
    }
});
