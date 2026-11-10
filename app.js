/* 光影档案 — 交互 */
(() => {
  'use strict';

  /* ---------- 头部 ---------- */
  const head = document.getElementById('head');
  const solid = () => head.classList.toggle('is-solid', window.scrollY > 40);
  solid();
  window.addEventListener('scroll', solid, { passive: true });

  /* ---------- 定位：?to=<section-id> 直接定位，并解除固定头部便于截图 ---------- */
  const params = new URLSearchParams(location.search);
  const target = params.get('to');
  if (target) {
    document.documentElement.classList.add('no-fixed');
    const jump = () => {
      const el = document.getElementById(target);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 24);
    };
    if (document.readyState === 'complete') requestAnimationFrame(jump);
    else window.addEventListener('load', () => requestAnimationFrame(jump));
  }

  /* ---------- 视频：进入视口自动播放，点击切换 ---------- */
  const clips = Array.from(document.querySelectorAll('.clip'));

  clips.forEach((clip) => {
    const v = clip.querySelector('video');
    const box = clip.querySelector('.shot__box');
    if (!v || !box) return;

    box.addEventListener('click', () => {
      if (v.paused) {
        v.play().catch(() => {});
        clip.dataset.userPaused = '0';
      } else {
        v.pause();
        clip.dataset.userPaused = '1';
      }
    });
    v.addEventListener('play', () => clip.classList.add('is-playing'));
    v.addEventListener('pause', () => clip.classList.remove('is-playing'));
  });

  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target.querySelector('video');
        if (!v) return;
        if (e.isIntersecting && e.intersectionRatio > 0.3) {
          if (e.target.dataset.userPaused !== '1') v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: [0, 0.3, 0.7] });
    clips.forEach((c) => vio.observe(c));
  }

  /* ---------- 滚动渐显 ---------- */
  const revealables = Array.from(
    document.querySelectorAll('.chapter .shot, .chapter .section-tag, .chapter .caption-line, .about__photo')
  );

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealables.forEach((el) => el.classList.add('reveal'));
    const rio = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach((el) => rio.observe(el));
  }

  /* ---------- 灯箱 ---------- */
  const lb = document.getElementById('lb');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  const shots = Array.from(document.querySelectorAll('.chapter .shot:not(.clip)'))
    .map((fig) => {
      const img = fig.querySelector('img');
      if (!img) return null;
      const cap = fig.querySelector('figcaption');
      return { src: img.currentSrc || img.src, alt: img.alt, cap: cap ? cap.textContent.trim() : '' };
    })
    .filter(Boolean);

  let cursor = 0;
  let lastFocus = null;

  const paint = () => {
    const s = shots[cursor];
    if (!s) return;
    lbImg.src = s.src;
    lbImg.alt = s.alt;
    lbCap.textContent = s.cap;
  };

  const open = (i) => {
    cursor = i;
    lastFocus = document.activeElement;
    paint();
    lb.hidden = false;
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

  const step = (dir) => {
    cursor = (cursor + dir + shots.length) % shots.length;
    paint();
  };

  shots.forEach((_, i) => {
    const fig = document.querySelectorAll('.chapter .shot:not(.clip)')[i];
    const img = fig && fig.querySelector('img');
    if (!img) return;
    img.style.cursor = 'zoom-in';
    fig.addEventListener('click', () => open(i));
  });

  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target === lb) close();
    });
    lb.querySelector('.lb__close').addEventListener('click', close);
    lb.querySelector('.lb__nav--prev').addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    lb.querySelector('.lb__nav--next').addEventListener('click', (e) => { e.stopPropagation(); step(1); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }
})();
