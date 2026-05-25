// ajuda.js — accordion do FAQ
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-pergunta').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const aberto = item.classList.contains('aberto');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('aberto'));
            if (!aberto) item.classList.add('aberto');
        });
    });
});
