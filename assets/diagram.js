/* Learning Garden — shared diagram stepper.
 *
 * A diagram is a `.diagram` element containing one <svg data-diagram> whose
 * animated parts carry `data-step="N"` (an element may list several steps:
 * data-step="1 2"). Captions live in `data-captions` on the <svg> as a JSON
 * array, index = step. Step 0 shows the whole picture; steps 1..N highlight
 * the parts for that step and dim the rest.
 *
 * Controls (play / pause / step / reset) are injected automatically.
 * Keyboard: ← → to step, space to play/pause, when the diagram has focus.
 */
(function () {
  'use strict';

  function setup(frame) {
    const svg = frame.querySelector('svg[data-diagram]');
    if (!svg) return;
    const L = () => (window.LG ? window.LG.lang() : 'zh-CN');
    const T = (k) => (window.LG ? window.LG.t(k) : ({ play: '▶ 播放', pause: '❚❚ 暂停', prev: '← 上一步', next: '下一步 →', reset: '↺ 重置' })[k]);
    let captions = [];
    function loadCaptions() {
      try { captions = JSON.parse((L() === 'en' && svg.dataset.captionsEn) ? svg.dataset.captionsEn : (svg.dataset.captions || '[]')); } catch (_) { captions = []; }
    }
    loadCaptions();
    const parts = Array.from(svg.querySelectorAll('[data-step]'));
    const max = parts.reduce((m, el) => Math.max(m, ...el.dataset.step.split(/\s+/).map(Number)), 0);
    const interval = Number(svg.dataset.interval || 1600);
    let step = 0, timer = null;

    const caption = document.createElement('div');
    caption.className = 'caption';
    const controls = document.createElement('div');
    controls.className = 'controls';
    const mk = (label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', fn); controls.appendChild(b); return b; };
    const playBtn = mk(T('play'), toggle);
    const prevBtn = mk(T('prev'), () => go(step - 1, true));
    const nextBtn = mk(T('next'), () => go(step + 1, true));
    const resetBtn = mk(T('reset'), () => go(0, true));
    document.addEventListener('lg-lang', () => { loadCaptions(); prevBtn.textContent = T('prev'); nextBtn.textContent = T('next'); resetBtn.textContent = T('reset'); playBtn.textContent = timer ? T('pause') : T('play'); render(); });
    const counter = document.createElement('span');
    counter.className = 'step';
    controls.appendChild(counter);
    frame.appendChild(caption);
    frame.appendChild(controls);
    frame.tabIndex = 0;
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { go(step + 1, true); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { go(step - 1, true); e.preventDefault(); }
      else if (e.key === ' ') { toggle(); e.preventDefault(); }
    });

    function render() {
      for (const el of parts) {
        const steps = el.dataset.step.split(/\s+/).map(Number);
        el.classList.remove('on', 'off');
        if (step === 0) continue;
        el.classList.add(steps.includes(step) ? 'on' : 'off');
      }
      caption.textContent = captions[step] || (step === 0 ? (captions[0] || '') : '');
      counter.textContent = step + ' / ' + max;
    }
    function go(n, manual) {
      if (manual) pause();
      step = ((n % (max + 1)) + (max + 1)) % (max + 1);
      render();
    }
    function play() {
      if (timer) return;
      playBtn.textContent = T('pause');
      timer = setInterval(() => { if (step >= max) { pause(); return; } go(step + 1, false); }, interval);
      if (step >= max) go(0, false);
    }
    function pause() {
      if (timer) clearInterval(timer);
      timer = null;
      playBtn.textContent = T('play');
    }
    function toggle() { timer ? pause() : play(); }
    render();
  }

  // Header: once its original spot scrolls out of view, body.scrolled is set and
  // the header shrinks into a centred pill (or docks into the rail on wide lesson pages).
  function headerSentinel() {
    const header = document.querySelector('header.top');
    if (!header || !('IntersectionObserver' in window) || document.querySelector('.top-sentinel')) return;
    const sentinel = document.createElement('div'); sentinel.className = 'top-sentinel'; sentinel.setAttribute('aria-hidden', 'true');
    header.parentNode.insertBefore(sentinel, header);
    new IntersectionObserver((entries) => {
      document.body.classList.toggle('scrolled', !entries[0].isIntersecting);
    }, { rootMargin: '-1px 0px 0px 0px', threshold: 0 }).observe(sentinel);
  }
  function init() { document.querySelectorAll('.diagram').forEach(setup); headerSentinel(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  // Theme toggle (optional button.theme in the header). Persists per browser.
  const KEY = 'lg-theme';
  // Saved theme is applied before first paint by assets/theme.js (loaded in <head>).
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button.theme');
    if (!b) return;
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch (_) {}
  });
})();
