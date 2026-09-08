(() => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const sync = () => {
    const open = nav.classList.contains('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  };
  if (toggle && nav) {
    new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        toggle.classList.remove('open'); nav.classList.remove('open');
        document.body.classList.remove('no-scroll'); toggle.focus();
      }
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        toggle.classList.remove('open'); nav.classList.remove('open');
        document.body.classList.remove('no-scroll');
      }
    });
    sync();
  }
  document.querySelectorAll('a[target="_blank"]').forEach(link => link.rel = 'noopener noreferrer');
  document.querySelectorAll('.product-card[onclick]').forEach(card => {
    card.tabIndex = 0; card.setAttribute('role', 'link');
    card.addEventListener('keydown', event => { if (event.key === 'Enter') card.click(); });
  });
})();
