/* Learning Garden — related topics, rendered from assets/topics.js.
 *
 * Markup:
 *   <section class="related" data-related="<topic id>" data-root="../../"></section>
 *     → a heading and one entry per related topic (title, why), in the active language.
 *   <article class="topic-card" data-topic-id="<id>"> … <p class="card-related" data-root=""></p>
 *     → a one-line "Related: A · B" inside a hub card.
 * Relations are symmetric: {a, b} renders on both a's and b's pages.
 * Planned topics render as text with a "planned" tag; ready topics link.
 */
(function () {
  'use strict';
  const T = {
    'zh-CN': { heading: '相关 topic', planned: '规划中', cardLabel: '相关：' },
    en: { heading: 'Related topics', planned: 'planned', cardLabel: 'Related: ' }
  };
  function lang() { return (window.LG && window.LG.lang()) || 'zh-CN'; }
  function t(k) { return (T[lang()] || T['zh-CN'])[k]; }
  function pick(obj) { return obj ? (obj[lang()] || obj['zh-CN'] || '') : ''; }
  function related(id) {
    const map = window.LG_TOPICS; if (!map) return [];
    const byId = Object.fromEntries(map.topics.map(x => [x.id, x]));
    const out = [];
    for (const r of map.relations) {
      const other = r.a === id ? r.b : r.b === id ? r.a : null;
      if (other && byId[other]) out.push({ topic: byId[other], why: pick(r.why) });
    }
    return out;
  }
  function titleEl(topic, root) {
    if (topic.status === 'ready') {
      const a = document.createElement('a'); a.href = root + topic.path; a.textContent = pick(topic.title); return a;
    }
    const s = document.createElement('span'); s.className = 'planned';
    s.textContent = pick(topic.title);
    const tag = document.createElement('small'); tag.textContent = ' · ' + t('planned'); s.appendChild(tag);
    return s;
  }
  function renderSection(sec) {
    const items = related(sec.dataset.related); const root = sec.dataset.root || '';
    sec.textContent = '';
    if (!items.length) { sec.hidden = true; return; }
    sec.hidden = false;
    const h = document.createElement('h2'); h.textContent = t('heading'); sec.appendChild(h);
    const ul = document.createElement('ul'); ul.className = 'related-list';
    for (const it of items) {
      const li = document.createElement('li');
      const head = document.createElement('div'); head.className = 'rel-title'; head.appendChild(titleEl(it.topic, root)); li.appendChild(head);
      const why = document.createElement('p'); why.className = 'rel-why'; why.textContent = it.why; li.appendChild(why);
      ul.appendChild(li);
    }
    sec.appendChild(ul);
  }
  function renderCard(p) {
    const card = p.closest('[data-topic-id]'); if (!card) return;
    const items = related(card.dataset.topicId); const root = p.dataset.root || '';
    p.textContent = '';
    if (!items.length) { p.hidden = true; return; }
    p.hidden = false;
    p.appendChild(document.createTextNode(t('cardLabel')));
    items.forEach((it, i) => { if (i) p.appendChild(document.createTextNode(' · ')); p.appendChild(titleEl(it.topic, root)); });
  }
  function init() {
    document.querySelectorAll('section.related[data-related]').forEach(renderSection);
    document.querySelectorAll('.card-related').forEach(renderCard);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('lg-lang', init);
})();
