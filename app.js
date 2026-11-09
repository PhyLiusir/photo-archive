(() => {
  const works = Array.from(document.querySelectorAll('.work'));
  const dialog = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const noEl = document.getElementById('lightbox-no');
  let current = 0;

  function render(index) {
    current = (index + works.length) % works.length;
    const work = works[current];
    const source = work.querySelector('img');
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    titleEl.textContent = work.dataset.title || '';
    noEl.textContent = work.dataset.no || '';
  }

  function open(index) {
    render(index);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function close() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    img.removeAttribute('src');
  }

  works.forEach((work, index) => {
    work.addEventListener('click', () => open(index));
    work.setAttribute('aria-label', `查看大图：${work.dataset.title || ''}`);
  });

  dialog.querySelector('[data-close]').addEventListener('click', close);
  dialog.querySelector('[data-prev]').addEventListener('click', () => render(current - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => render(current + 1));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft') render(current - 1);
    else if (event.key === 'ArrowRight') render(current + 1);
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => observer.observe(el));
  }
})();
