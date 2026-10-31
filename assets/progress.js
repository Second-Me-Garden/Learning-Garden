/* Learning Garden — progress on each topic's track.
 *
 * A phase counts as done when its checkpoint quiz was last answered with full
 * marks (quiz.js stores lg-quiz:<id> = {ok,total,at} in localStorage). Within
 * one topic, the first phase that is not done is "now". Only this browser
 * knows; nothing is sent anywhere.
 *
 * Markup, per topic:
 *   <div class="track" data-topic="…">  (or any element with data-topic; the
 *   topic page uses the phase list itself)
 *     [data-phase="<quiz id>"]            → class done / now
 *     <path class="grown" data-track>     → drawn from the first plot to "now"
 *     <circle class="plot" data-phase data-href data-title>
 *     <text data-phase-label="<id>">      → class now
 *     <p class="next" data-next>          → link to the "now" phase
 */
(function () {
  'use strict';
  function done(id) {
    try {
      const v = JSON.parse(localStorage.getItem('lg-quiz:' + id) || 'null');
      return !!(v && v.total > 0 && v.ok === v.total);
    } catch (_) { return false; }
  }
  function topic(root) {
    const phases = Array.from(root.querySelectorAll('[data-phase]'));
    const ids = Array.from(new Set(phases.map(el => el.dataset.phase)));
    let now = null;
    for (const id of ids) {
      if (done(id)) phases.filter(e => e.dataset.phase === id).forEach(el => el.classList.add('done'));
      else if (now === null) now = id;
    }
    if (now !== null) {
      phases.filter(e => e.dataset.phase === now).forEach(el => el.classList.add('now'));
      root.querySelectorAll('[data-phase-label="' + now + '"]').forEach(el => el.classList.add('now'));
    }

    const plots = Array.from(root.querySelectorAll('circle.plot[data-phase]'));
    const total = plots.length;
    const doneCount = plots.filter(p => p.classList.contains('done')).length;
    const grown = root.querySelector('[data-track]');
    if (grown && total) {
      const y = plots[0].getAttribute('cy');
      const x0 = Number(plots[0].getAttribute('cx'));
      const nowPlot = plots.find(p => p.classList.contains('now'));
      const xEnd = Number((nowPlot || plots[total - 1]).getAttribute('cx'));
      grown.setAttribute('d', 'M' + x0 + ' ' + y + ' L' + xEnd + ' ' + y);
      if (doneCount === 0) grown.setAttribute('opacity', '0');
    }
    for (const plot of plots) {
      const a = plot.closest('a');
      if (!a) continue;
      const st = plot.classList.contains('done') ? '自测全对' : plot.classList.contains('now') ? '正在学' : '还没到';
      a.setAttribute('aria-label', plot.dataset.title + '，' + st);
    }
    const next = root.querySelector('[data-next]');
    if (next && total) {
      const nowPlot = plots.find(p => p.classList.contains('now'));
      if (!nowPlot) {
        next.textContent = total + ' 个阶段自测全对。回头重做任一自测即可复习。';
      } else {
        const a = document.createElement('a');
        a.href = nowPlot.dataset.href;
        a.textContent = nowPlot.dataset.title;
        next.textContent = doneCount === 0 ? '从这里开始：' : '自测全对 ' + doneCount + ' / ' + total + '，继续：';
        next.appendChild(a);
      }
    }
  }
  function init() {
    const roots = document.querySelectorAll('[data-topic]');
    if (roots.length) roots.forEach(topic); else topic(document);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
