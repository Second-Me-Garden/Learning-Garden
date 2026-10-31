/* Learning Garden — inline checkpoint quiz.
 *
 * Markup:
 *   <form class="quiz" data-quiz="kernel/phase-0">
 *     <div class="q" data-answer="b">
 *       <p>Question?</p>
 *       <label><input type="radio" name="q1" value="a"> A</label>
 *       <label><input type="radio" name="q1" value="b"> B</label>
 *       <div class="why" hidden>Explanation shown after checking.</div>
 *     </div>
 *     <button type="submit">检查答案</button>
 *     <div class="result"></div>
 *   </form>
 *
 * Scores are kept in localStorage only (per browser), key lg-quiz:<id>.
 */
(function () {
  'use strict';
  function setup(form) {
    const id = form.dataset.quiz || location.pathname;
    const result = form.querySelector('.result') || form.appendChild(Object.assign(document.createElement('div'), { className: 'result' }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const qs = Array.from(form.querySelectorAll('.q'));
      let ok = 0;
      for (const q of qs) {
        const picked = q.querySelector('input:checked');
        const why = q.querySelector('.why');
        const right = picked && picked.value === q.dataset.answer;
        if (right) ok++;
        q.classList.toggle('ok', !!right);
        q.classList.toggle('bad', !right);
        if (why) why.hidden = false;
      }
      const T = (k) => (window.LG ? window.LG.t(k) : k);
      result.textContent = `${ok} / ${qs.length} ${T('correct')}` + (ok === qs.length ? ' — ' + T('pass') : ' — ' + T('retry'));
      result.className = 'result ' + (ok === qs.length ? 'ok' : 'bad');
      try { localStorage.setItem('lg-quiz:' + id, JSON.stringify({ ok, total: qs.length, at: Date.now() })); } catch (_) {}
    });
    try {
      const prev = JSON.parse(localStorage.getItem('lg-quiz:' + id) || 'null');
      if (prev) result.textContent = `${window.LG ? window.LG.t('last') : '上次'}：${prev.ok} / ${prev.total}`;
    } catch (_) {}
  }
  function init() { document.querySelectorAll('form.quiz').forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
