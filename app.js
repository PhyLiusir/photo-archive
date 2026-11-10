/* 光影档案 — 交互 */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 头部变色 ---------- */
  const head = document.getElementById('head');
  const onScroll = () => head.classList.toggle('is-solid', window.scrollY > 60);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 首屏视差 ---------- */
  const heroFig = document.getElementById('heroFig');
  const heroImg = heroFig ? heroFig.querySelector('img') : null;
  let ticking = false;

  const parallax = () => {
    if (!heroImg || reduce) return;
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroImg.style.transform = `translate3d(0, ${(y * 0.16).toFixed(2)}px, 0) scale(1.06)`;
    }
    ticking = false;
  };
  if (heroImg && !reduce) {
    heroImg.style.transform = 'scale(1.06)';
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
  }

  /* ---------- 渐显 / 揭开 ---------- */
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const clipEls = Array.from(document.querySelectorAll('.rv-i'));

  if ('IntersectionObserver' in window && !reduce) {
    const io1 = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
    revealEls.forEach((el) => io1.observe(el));

    const io2 = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    clipEls.forEach((el) => io2.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
    clipEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- 短片：进视口播放 ---------- */
  const clips = Array.from(document.querySelectorAll('.clipc'));

  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target.querySelector('video');
        if (!v) return;
        if (e.isIntersecting && e.intersectionRatio > 0.25) {
          if (e.target.dataset.paused !== '1') v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: [0, 0.25, 0.6] });
    clips.forEach((c) => vio.observe(c));
  }

  clips.forEach((c) => {
    const v = c.querySelector('video');
    if (!v) return;
    c.addEventListener('click', () => {
      if (v.paused) { v.play().catch(() => {}); c.dataset.paused = '0'; }
      else { v.pause(); c.dataset.paused = '1'; }
    });
  });

  /* ---------- 灯箱 ---------- */
  const lb = document.getElementById('lb');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');

  const figures = Array.from(document.querySelectorAll('.plate, .about__photo'))
    .filter((fig) => !fig.querySelector('video'))
    .map((fig) => {
      const img = fig.querySelector('img');
      if (!img) return null;
      const cap = fig.querySelector('figcaption');
      const alt = img.alt || '';
      return { el: fig, src: img.getAttribute('src'), alt, cap: cap ? cap.textContent.replace(/\s+/g, ' ').trim() : alt };
    })
    .filter(Boolean);

  let cursor = 0;
  let lastFocus = null;

  const paint = () => {
    const s = figures[cursor];
    if (!s) return;
    lbImg.src = s.src;
    lbImg.alt = s.alt;
    lbCap.textContent = s.cap;
  };
  const open = (i) => {
    cursor = i; lastFocus = document.activeElement;
    paint(); lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb__close').focus();
  };
  const close = () => {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { lb.hidden = true; }, 260);
    if (lastFocus) lastFocus.focus();
  };
  const step = (d) => { cursor = (cursor + d + figures.length) % figures.length; paint(); };

  figures.forEach((f, i) => {
    const img = f.el.querySelector('img');
    if (img) img.style.cursor = 'zoom-in';
    f.el.addEventListener('click', (ev) => {
      if (f.el.classList.contains('clipc')) return;
      const v = f.el.querySelector('video');
      if (v && ev.target === v) return;
      open(i);
    });
  });

  lb.querySelector('.lb__close').addEventListener('click', close);
  lb.querySelector('.lb__nav--prev').addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
  lb.querySelector('.lb__nav--next').addEventListener('click', (e) => { e.stopPropagation(); step(1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- 定位：?to=<id>，同时解除固定头部 ---------- */
  const target = new URLSearchParams(location.search).get('to');
  if (target) {
    document.documentElement.classList.add('no-fixed');
    const jump = () => {
      const el = document.getElementById(target);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 20);
    };
    if (document.readyState === 'complete') requestAnimationFrame(jump);
    else window.addEventListener('load', () => requestAnimationFrame(jump));
  }
})();
