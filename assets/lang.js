/* Learning Garden — language (zh-CN / en). Load in <head>, before first paint.
 *
 * Pages carry both languages: any element with lang="zh-CN" or lang="en" is
 * shown only when it matches <html data-lang>. Scripts read LG.lang() and
 * LG.t(key); they listen for the "lg-lang" event to re-render.
 */
(function () {
  var KEY = 'lg-lang';
  var T = {
    'zh-CN': {
      play: '▶ 播放', pause: '❚❚ 暂停', prev: '← 上一步', next: '下一步 →', reset: '↺ 重置',
      check: '检查答案', correct: '正确', pass: '可以进入下一阶段', retry: '回看标出的概念再试一次', last: '上次',
      done: '自测全对', now: '正在学', ahead: '还没到', start: '从这里开始：', cont: '，继续：', allDone: ' 个阶段自测全对。回头重做任一自测即可复习。',
      copy: '复制', copied: '已复制', copyLabel: '复制这段代码', shell: 'shell',
      nav: '本页导航', sections: '本页章节', theme: '切换明暗', langBtn: 'EN', langLabel: 'Switch to English'
    },
    en: {
      play: '▶ Play', pause: '❚❚ Pause', prev: '← Back', next: 'Next →', reset: '↺ Reset',
      check: 'Check answers', correct: 'correct', pass: 'ready for the next phase', retry: 'revisit the marked concepts and try again', last: 'Last time',
      done: 'Quiz passed', now: 'In progress', ahead: 'Not yet', start: 'Start here: ', cont: ', continue: ', allDone: ' phases passed. Redo any quiz to review.',
      copy: 'Copy', copied: 'Copied', copyLabel: 'Copy this code', shell: 'shell',
      nav: 'Page navigation', sections: 'Sections', theme: 'Toggle theme', langBtn: '中文', langLabel: '切换到中文'
    }
  };
  function lang() { return document.documentElement.dataset.lang === 'en' ? 'en' : 'zh-CN'; }
  function apply(l) {
    document.documentElement.dataset.lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll('button.lang').forEach(function (b) {
      b.innerHTML = '<span class="opt' + (l === 'zh-CN' ? ' on' : '') + '">中文</span><span class="sep">/</span><span class="opt' + (l === 'en' ? ' on' : '') + '">EN</span>';
      b.title = T[l].langLabel; b.setAttribute('aria-label', T[l].langLabel);
    });
    document.querySelectorAll('button.theme').forEach(function (b) { b.title = T[l].theme; b.setAttribute('aria-label', T[l].theme); });
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) {}
  document.documentElement.dataset.lang = saved === 'en' ? 'en' : 'zh-CN';
  document.documentElement.lang = document.documentElement.dataset.lang;
  window.LG = {
    lang: lang,
    t: function (key) { return (T[lang()] || T['zh-CN'])[key] || key; },
    set: function (l) {
      apply(l);
      try { localStorage.setItem(KEY, l); } catch (_) {}
      document.dispatchEvent(new CustomEvent('lg-lang', { detail: l }));
    }
  };
  document.addEventListener('DOMContentLoaded', function () { apply(lang()); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button.lang');
    if (!b) return;
    window.LG.set(lang() === 'en' ? 'zh-CN' : 'en');
  });
})();
