// acessibilidade.js

document.addEventListener('DOMContentLoaded', () => {

    // ── TAMANHO DO TEXTO ──────────────────────────────────────────
    const sizeMap = { small: '13px', medium: '16px', large: '20px' };
    const savedSize = localStorage.getItem('fontSize') || 'medium';
    document.documentElement.style.fontSize = sizeMap[savedSize];

    document.querySelectorAll('.btn-tamanho').forEach(btn => {
        if (btn.dataset.size === savedSize) btn.classList.add('active');
        else btn.classList.remove('active');

        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            localStorage.setItem('fontSize', size);
            document.documentElement.style.fontSize = sizeMap[size];
            document.querySelectorAll('.btn-tamanho').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ── MODO ESCURO ───────────────────────────────────────────────
    const toggleDark = document.getElementById('toggle-dark');
    const darkAtivo = localStorage.getItem('darkMode') === 'true';
    if (darkAtivo) {
        document.documentElement.classList.add('dark-mode');
        toggleDark.checked = true;
    }
    toggleDark.addEventListener('change', () => {
        const ativo = toggleDark.checked;
        localStorage.setItem('darkMode', ativo);
        document.documentElement.classList.toggle('dark-mode', ativo);
    });

});
