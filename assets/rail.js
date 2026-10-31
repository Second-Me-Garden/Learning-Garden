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
  aside.setAttribute('aria-label', '本页导航');
  const panel = document.createElement('div');
  panel.className = 'rail-panel';
  aside.appendChild(panel);

  if (crumb) {
    const t = document.createElement('a');
    t.className = 'rail-topic'; t.href = crumb.getAttribute('href'); t.textContent = crumb.textContent.trim();
    panel.appendChild(t);
  }
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
    const st = states[i] === 'done' ? '自测全对' : i === now ? '正在学' : '还没到';
    a.setAttribute('aria-label', 'Phase ' + i + '，' + st);
    li.appendChild(a); ol.appendChild(li); items.push({ li, label, i });
  }
  panel.appendChild(ol);
  const count = document.createElement('p'); count.className = 'rail-count';
  count.textContent = '自测全对 ' + doneCount + ' / ' + total;
  panel.appendChild(count);

  // sections
  const h2s = Array.from(document.querySelectorAll('h2'));
  if (h2s.length) {
    const nav = document.createElement('nav'); nav.setAttribute('aria-label', '本页章节');
    const toc = document.createElement('ol'); toc.className = 'rail-toc';
    const used = new Set();
    h2s.forEach((h, idx) => {
      if (!h.id) { let id = 's' + (idx + 1); while (used.has(id) || document.getElementById(id)) id += 'x'; h.id = id; }
      used.add(h.id);
      const li = document.createElement('li'); const a = document.createElement('a');
      a.href = '#' + h.id; a.textContent = h.textContent.split('：')[0].trim();
      if (/^自测/.test(a.textContent) && states[here] === 'done') a.textContent += ' · 自测全对';
      li.appendChild(a); toc.appendChild(li);
    });
    nav.appendChild(toc); panel.appendChild(nav);
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

  const header = document.querySelector('header.top');
  (header ? header.parentNode : document.body).insertBefore(aside, header ? header.nextSibling : document.body.firstChild);
  document.body.classList.add('lesson');

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
})();
