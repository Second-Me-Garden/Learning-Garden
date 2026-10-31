/* Learning Garden — code blocks.
 *
 * Upgrades every <pre> on the page: a header with the language and an optional
 * file name, a copy button, line numbers for blocks of 4+ lines, and light
 * tinting of comments, strings, shell prompts and a few C/JS keywords.
 *
 * Markup: <pre data-lang="sh" data-file="touch64.c">…</pre>. Without data-lang
 * the language is guessed from the content. Tinting is done on text nodes
 * only; existing inline markup inside <pre> is left as is.
 */
(function () {
  'use strict';
  const KW_C = /\b(int|char|void|long|unsigned|static|const|struct|return|if|else|for|while|do|switch|case|break|continue|sizeof|typedef|enum|union|goto|extern|volatile|register|inline|include|define|ifdef|ifndef|endif|NULL)\b/g;
  const KW_JS = /\b(const|let|var|function|return|if|else|for|while|import|export|new|class|this|true|false|null|undefined|await|async)\b/g;

  function guess(text) {
    if (/^\s*(\$ |sudo |brew |git |make |qemu-|docker |cd |export |grep |ls |cat |curl |ps |log |sysctl |kmutil |vmmap |vm_stat|pagesize|llvm-|clang |gcc |cp |mkdir |printf |chmod |find |open |node |gh )/m.test(text)) return 'sh';
    if (/#include|int main\s*\(|printf\s*\(|->|\bstruct\b/.test(text)) return 'c';
    if (/\b(const|let|function)\b.*[=(]/.test(text)) return 'js';
    if (/^\s*(\[|\{)/.test(text) && /:\s*/.test(text)) return 'json';
    return '';
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function tint(text, lang) {
    // one pass: comments and strings first (they win), then prompts/keywords on the rest
    const out = [];
    let i = 0;
    const re = lang === 'c' || lang === 'js'
      ? /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/g
      : /(^[ \t]*#[^\n]*|[ \t]#[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/gm;
    let m;
    while ((m = re.exec(text))) {
      out.push(plain(text.slice(i, m.index), lang));
      const t = m[0];
      const cls = /^\s*(\/\/|\/\*|#)/.test(t) || (lang !== 'c' && lang !== 'js' && /#/.test(t.trimStart()[0] || '')) ? 'cm' : 'st';
      out.push('<span class="' + cls + '">' + esc(t) + '</span>');
      i = m.index + t.length;
    }
    out.push(plain(text.slice(i), lang));
    return out.join('');
  }
  function plain(s, lang) {
    let h = esc(s);
    if (lang === 'sh') h = h.replace(/^(\$ |# )/gm, '<span class="pr">$1</span>');
    if (lang === 'c') h = h.replace(KW_C, '<span class="kw">$1</span>').replace(/^(\s*#\s*\w+)/gm, '<span class="pp">$1</span>');
    if (lang === 'js') h = h.replace(KW_JS, '<span class="kw">$1</span>');
    return h;
  }
  function copyText(text, btn) {
    const done = () => { btn.textContent = '已复制'; btn.classList.add('ok'); setTimeout(() => { btn.textContent = '复制'; btn.classList.remove('ok'); }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallback(text, done));
    else fallback(text, done);
  }
  function fallback(text, done) {
    const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (_) {}
    document.body.removeChild(ta);
  }
  function upgrade(pre) {
    if (pre.closest('.code') || pre.closest('svg')) return;
    const raw = pre.textContent.replace(/\s+$/, '');
    const lang = pre.dataset.lang || guess(raw);
    const file = pre.dataset.file || '';
    const lines = raw.split('\n');
    const wrap = document.createElement('figure'); wrap.className = 'code' + (lines.length >= 4 ? ' numbered' : '');
    const head = document.createElement('div'); head.className = 'code-head';
    const label = document.createElement('span'); label.className = 'code-lang';
    label.textContent = file ? file : (lang === 'sh' ? 'shell' : lang || 'text');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'code-copy'; btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制这段代码');
    btn.addEventListener('click', () => copyText(raw, btn));
    head.appendChild(label); head.appendChild(btn);
    const body = document.createElement('pre'); body.className = 'code-body';
    for (const a of pre.attributes) if (a.name !== 'class') body.setAttribute(a.name, a.value);
    const codeEl = document.createElement('code');
    if (pre.querySelector('*')) codeEl.innerHTML = pre.innerHTML.replace(/\s+$/, '');   // keep authored markup untouched
    else codeEl.innerHTML = tint(raw, lang);
    body.appendChild(codeEl);
    if (lines.length >= 4) {
      const gutter = document.createElement('span'); gutter.className = 'code-lines'; gutter.setAttribute('aria-hidden', 'true');
      gutter.textContent = lines.map((_, i) => i + 1).join('\n');
      body.insertBefore(gutter, codeEl);
    }
    wrap.appendChild(head); wrap.appendChild(body);
    pre.replaceWith(wrap);
  }
  function init() { document.querySelectorAll('pre').forEach(upgrade); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
