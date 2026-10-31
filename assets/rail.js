/* Learning Garden — sticky left rail on lesson pages (≥1440px; see style.css).
 *
 * Built from the page's own markup, nothing invented:
 *   form.quiz[data-quiz="<topic>/phase-<n>"]   required; gives topic + phase number
 *   .meta  "Phase N / T · …"                    total phase count, shown verbatim
 *   header.top a.crumb[href]                    topic link + name
 *   h1                                          this page's title (first text node)
 *   h2[id]                                      section list (ids assigned if missing)
 *   nav.pn a                                    prev/next phase links (file:// fallback)
 * Phase titles come from the topic page (../index.html) when served over http(s);
 * under file:// fetch is blocked, so plots show number + state only.
 * States use the same localStorage rule as progress.js (lg-quiz:<id> full marks = done).
 */
(function () {
  'use strict';
  const T = (k) => (window.LG ? window.LG.t(k) : k);
  function build() {
  const quiz = document.querySelector('form.quiz[data-quiz]');
  if (!quiz) return;
  const m = /^(.+)\/phase-(\d+)$/.exec(quiz.dataset.quiz || '');
  if (!m) return;
  const topic = m[1], here = Number(m[2]);
  const meta = document.querySelector('.meta');
  const mt = meta && /Phase\s+\d+\s*\/\s*(\d+)/.exec(meta.textContent);
  const total = mt ? Number(mt[1]) : 9;
  const crumb = document.querySelector('header.top a.crumb[href]');
  const h1 = document.querySelector('h1');
  const title = h1 ? (h1.childNodes[0] && h1.childNodes[0].textContent || h1.textContent).trim() : '';

  function done(id) {
    try {
      const v = JSON.parse(localStorage.getItem('lg-quiz:' + id) || 'null');
      return !!(v && v.total > 0 && v.ok === v.total);
    } catch (_) { return false; }
  }
  const states = [];
  let now = null;
  for (let i = 0; i < total; i++) {
    const d = done(topic + '/phase-' + i);
    states.push(d ? 'done' : 'open');
    if (!d && now === null) now = i;
  }
  const doneCount = states.filter(s => s === 'done').length;

  // prev/next links from the page's own nav, usable under file://
  const links = {};
  document.querySelectorAll('nav.pn a[href]').forEach(a => {
    const pm = /phase-(\d+)-/.exec(a.getAttribute('href'));
    if (pm) links[Number(pm[1])] = a.getAttribute('href');
  });

  const aside = document.createElement('aside');
  aside.className = 'rail';
  aside.setAttribute('aria-label', T('nav'));
  const panel = document.createElement('div');
  panel.className = 'rail-panel';
  aside.appendChild(panel);

  // Breadcrumb that the page header merges into once it scrolls away.
  const headerEl = document.querySelector('header.top');
  const brand = headerEl && headerEl.querySelector('.brand[href]');
  const themeBtn = headerEl && headerEl.querySelector('button.theme');
  const rc = document.createElement('div'); rc.className = 'rail-crumb';
  if (brand) { const b = document.createElement('a'); b.className = 'rail-brand'; b.href = brand.getAttribute('href'); b.textContent = brand.textContent.trim(); rc.appendChild(b); }
  if (crumb) { const t = document.createElement('a'); t.className = 'rail-topic'; t.href = crumb.getAttribute('href'); t.textContent = crumb.textContent.trim(); rc.appendChild(t); }
  panel.appendChild(rc);
  // Language and theme controls live at the foot of the rail (shown while the header is docked).
  const tools = document.createElement('div'); tools.className = 'rail-tools';
  const langBtn = headerEl && headerEl.querySelector('button.lang');
  if (langBtn) { const b = langBtn.cloneNode(true); b.classList.add('rail-lang'); tools.appendChild(b); }
  if (themeBtn) { const b = themeBtn.cloneNode(true); b.classList.add('rail-theme'); tools.appendChild(b); }
  if (meta) {
    const p = document.createElement('p'); p.className = 'rail-meta'; p.textContent = meta.textContent.trim();
    panel.appendChild(p);
  }
  const ol = document.createElement('ol');
  ol.className = 'rail-plots';
  const items = [];
  for (let i = 0; i < total; i++) {
    const li = document.createElement('li');
    if (states[i] === 'done') li.classList.add('done');
    if (i === now) li.classList.add('now');
    const a = document.createElement(links[i] || i === here ? 'a' : 'span');
    if (i === here) { a.setAttribute('aria-current', 'page'); if (a.tagName === 'A') a.href = '#'; }
    else if (links[i]) a.href = links[i];
    const dot = document.createElement('span'); dot.className = 'dot'; dot.setAttribute('aria-hidden', 'true');
    a.appendChild(dot);
    const label = document.createElement('span');
    label.textContent = 'Phase ' + i + (i === here && title ? ' · ' + title : '');
    a.appendChild(label);
    const st = states[i] === 'done' ? T('done') : i === now ? T('now') : T('ahead');
    a.setAttribute('aria-label', 'Phase ' + i + '，' + st);
    li.appendChild(a); ol.appendChild(li); items.push({ li, label, i });
  }
  panel.appendChild(ol);
  const count = document.createElement('p'); count.className = 'rail-count';
  count.textContent = T('done') + ' ' + doneCount + ' / ' + total;
  panel.appendChild(count);

  // sections
  const cur = window.LG ? window.LG.lang() : 'zh-CN';
  const h2s = Array.from(document.querySelectorAll('h2')).filter(h => { const l = h.closest('[lang]'); return !l || l === document.documentElement || l.getAttribute('lang') === cur; });
  if (h2s.length) {
    const nav = document.createElement('nav'); nav.setAttribute('aria-label', T('sections'));
    const toc = document.createElement('ol'); toc.className = 'rail-toc';
    const used = new Set();
    h2s.forEach((h, idx) => {
      if (!h.id) { let id = 's' + (idx + 1); while (used.has(id) || document.getElementById(id)) id += 'x'; h.id = id; }
      used.add(h.id);
      const li = document.createElement('li'); const a = document.createElement('a');
      a.href = '#' + h.id; a.textContent = h.textContent.split('：')[0].trim();
      if (/^(自测|Quiz|Self-check)/.test(a.textContent) && states[here] === 'done') a.textContent += ' · ' + T('done');
      li.appendChild(a); toc.appendChild(li);
    });
    nav.appendChild(toc); panel.appendChild(nav);
  }
  if (tools.childNodes.length) panel.appendChild(tools);
  if (false) {
    if ('IntersectionObserver' in window) {
      const map = new Map(h2s.map((h, i) => [h, toc.children[i].firstChild]));
      let current = null;
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) current = e.target;
        if (!current) return;
        for (const [h, a] of map) { if (h === current) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }
      }, { rootMargin: '-20% 0px -70% 0px' });
      h2s.forEach(h => io.observe(h));
    }
  }

  const header = headerEl;
  (header ? header.parentNode : document.body).insertBefore(aside, header ? header.nextSibling : document.body.firstChild);
  document.body.classList.add('lesson');

  // body.scrolled (header docked) is set by the shared sentinel in diagram.js.

  // phase titles from the topic page, only when served over http(s)
  if (/^https?:$/.test(location.protocol) && crumb) {
    fetch(crumb.getAttribute('href')).then(r => r.ok ? r.text() : '').then(html => {
      if (!html) return;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('.phases li[data-phase]').forEach(li => {
        const pm = /phase-(\d+)$/.exec(li.dataset.phase || '');
        const a = li.querySelector('.t a[href]');
        if (!pm || !a) return;
        const i = Number(pm[1]); const it = items[i]; if (!it) return;
        it.label.textContent = 'Phase ' + i + ' · ' + a.textContent.trim();
        const el = it.li.firstChild;
        if (i !== here && el.tagName !== 'A') {
          const link = document.createElement('a'); link.href = new URL(a.getAttribute('href'), new URL(crumb.getAttribute('href'), location.href)).href;
          while (el.firstChild) link.appendChild(el.firstChild);
          for (const at of el.attributes) link.setAttribute(at.name, at.value);
          it.li.replaceChild(link, el);
        }
      });
    }).catch(() => {});
  }
  }
  build();
  document.addEventListener('lg-lang', () => {
    document.querySelectorAll('aside.rail').forEach(el => el.remove());
    document.body.classList.remove('lesson');
    build();
  });
})();
