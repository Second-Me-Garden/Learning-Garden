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

  // Header: at rest it scrolls away with the page. Once half of it has scrolled off, it
  // becomes fixed and morphs from where it is into the centred pill; scrolling back past
  // the same line morphs it out again into the bar at that same spot. A few px of
  // hysteresis stops flicker at the line. A spacer keeps the layout height meanwhile.
  function headerDock() {
    const header = document.querySelector('header.top');
    if (!header || document.querySelector('.top-spacer')) return;
    let SHOW = 60, HIDE = 48; const OUT_MS = 380, GAP = 6;
    const spacer = document.createElement('div'); spacer.className = 'top-spacer'; spacer.setAttribute('aria-hidden', 'true');
    header.parentNode.insertBefore(spacer, header);
    let on = false, leaving = null;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function measure() {
      if (on) return;
      const h = header.offsetHeight, top = header.getBoundingClientRect().top + window.scrollY;
      document.documentElement.style.setProperty('--top-h', h + 'px');
      SHOW = top + h / 2 + GAP; HIDE = top + h / 2 - GAP;
    }
    function update() {
      const y = window.scrollY;
      if (!on && y > SHOW) {
        on = true; if (leaving) { clearTimeout(leaving); leaving = null; }
        document.body.classList.remove('leaving'); document.body.classList.add('scrolled');
      } else if (on && y < HIDE && !leaving) {
        if (reduce) { on = false; document.body.classList.remove('scrolled'); return; }
        document.body.classList.add('leaving');
        leaving = setTimeout(() => { leaving = null; on = false; document.body.classList.remove('scrolled', 'leaving'); }, OUT_MS);
      }
    }
    function onScroll() { update(); }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }
  function init() { document.querySelectorAll('.diagram').forEach(setup); headerDock(); }
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
