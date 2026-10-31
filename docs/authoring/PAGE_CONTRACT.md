# Page contract for Learning Garden topics

Every page is static HTML with inline SVG and CSS. No build step, no dependencies, no external scripts or inline event handlers (CI refuses them). Prose is Simplified Chinese with English technical terms, and every prose element has a full English twin. The checker `scripts/check-site.mjs` enforces the mechanical parts of this contract; the rest is reviewed.

## Files per topic

| File | Role |
| --- | --- |
| `topics/<id>/index.html` | Overview: lede, reader note, roadmap diagram, lab-setup callout, phase list, related topics. |
| `topics/<id>/lab-setup/index.html` | The lab environment page. The checker treats it as a lesson. |
| `topics/<id>/phase-N-<slug>/index.html` | One lesson per phase, N from 0. |
| `index.html` (hub) | One `article.topic-card[data-topic-id="<id>"]` per topic; the Primary edits this. |
| `assets/topics.js` | The topic map: set `status: "ready"` when the topic ships. |

Progress keys: the overview `section.setup[data-setup="<key>"]`, the phase list `li[data-phase="<key>/phase-N"]`, the hub track `data-topic="<key>"` and `circle.plot[data-phase="<key>/phase-N"]`, and each quiz `form.quiz[data-quiz="<key>/phase-N"]` all use the same short key (kernel topic: `kernel`; ROS 2: `ros2`).

## Head and header

Lesson pages sit three levels deep (`../../../assets/…`); the overview and lab-setup page two levels (`../../assets/…`). Copy this head exactly, adjusting depth and titles:

```html
<!doctype html>
<html lang="zh-CN" data-lang="zh-CN" translate="no">
<head>
<meta charset="utf-8">
<meta name="google" content="notranslate">
<link rel="icon" href="../../../assets/brand/favicon.svg" type="image/svg+xml">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Phase 1 · Nodes &amp; Topics · ROS 2</title>
<link rel="stylesheet" href="../../../assets/style.css">
<script src="../../../assets/theme.js"></script>
<script src="../../../assets/lang.js"></script>
</head>
<body>
<div class="wrap">
  <header class="top">
    <a class="brand" href="../../../index.html"><span class="mark" aria-hidden="true"><img src="../../../assets/brand/symbol.svg" alt=""></span><span class="wordmark">Learning Garden</span></a>
    <a class="crumb" href="../index.html">ROS 2</a>
    <span class="crumb current" aria-current="page">Phase 1 · Nodes &amp; Topics</span>
    <span class="spacer"></span>
    <button class="lang" type="button" title="Switch to English" aria-label="Switch to English">EN</button>
    <button class="theme" type="button" title="切换明暗" aria-label="切换明暗">◐</button>
  </header>
```

`theme.js` then `lang.js` must be the last two scripts in `<head>`, in that order. Scripts at the end of `<body>`: lessons load `diagram.js`, `quiz.js`, `rail.js` (defer), `code.js` (defer); the overview loads `diagram.js`, `progress.js`, `topics.js`, `related.js`.

## Lesson section order

The five Chinese headings 目标, 核心概念, 动画图解, 资料, 参考书目 must appear literally (the checker looks for them). The standard order, each heading as a paired `<h2 id="x" lang="zh-CN">…</h2><h2 id="x-en" lang="en">…</h2>`:

1. `p.meta` (Phase N / total · duration), `h1` with a `span.en` subtitle pair, `p.lede` pair.
2. 目标 / Goals: `div.goals` with an intro span pair and a `ul` of paired `li`.
3. 前置 / Prerequisites: `ul` of paired `li`.
4. 核心概念 / Core concepts: `h3` pairs numbered `1.` `2.` … ; paragraphs, lists, `div.note` pairs; each concept ends with a 延伸阅读 / Further reading pointer to a chapter of a book in the bibliography.
5. 对照表 / Comparison: `div.table-wrap > table.cmp`, header cells with `span` pairs; the two compared sides get coloured `th` classes (see Colours).
6. 动画图解 / Animated diagrams: two diagrams, `h3` pairs titled (a) and (b).
7. 动手实验 / Hands-on labs: `div.lab` with `h3` pairs Lab A and Lab B, `ol` steps, `pre` blocks, and a closing `div.note` pair naming the deliverables.
8. 自测 / Self-check: the quiz.
9. 资料 / Resources: `ul.res`, each `li` with links and a `span.lvl` pair (level and what it covers).
10. 参考书目 / Bibliography: `ol.books`, paired `li` with `span.lvl` chapter mapping.
11. `nav.pn` with the previous and next lesson links.

The lab-setup page keeps the same skeleton but replaces 前置 with 为什么要隔离 / Why isolate and has one diagram.

## Bilingual pairing

- Every prose element is a `lang="zh-CN"` element immediately followed by its `lang="en"` twin with the same tag and classes. Nothing visible is left without a language except code, SVG geometry and the `h1` product name.
- The checker requires at least 20 `lang="en"` attributes per lesson and |en − zh| ≤ max(6, 15 %). Pair everything and the counts match on their own.
- A list item that holds a `<pre>` wraps its two prose halves in `span` pairs before the `<pre>`; the `<pre>` is shared.
- Table cells pair inside the cell with `span` pairs.
- SVG labels: paired `<text lang="zh-CN">` and `<text lang="en">` at the same x and y. Keep labels short and at least 11 px in a 900-unit-wide viewBox; a diagram rendered in a 360 px column scales 2.5 ×, so anything smaller is unreadable.
- Never use circled numbers (①②③) anywhere, including captions. Write `1.` or `Step 1`.
- Never use a single quote or apostrophe inside caption text (captions live in single-quoted attributes). Use `’` only in prose, never in captions.

## Diagrams

```html
<div class="diagram">
  <svg data-diagram viewBox="0 0 900 420" data-interval="2200"
       data-captions='["Step 0 text: the whole picture", "Step 1 …", "Step 2 …"]'
       data-captions-en='["Step 0 …", "Step 1 …", "Step 2 …"]'>
    <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" style="fill: var(--ink-3)"/></marker></defs>
    <g data-step="1"><rect class="box ros" x="30" y="35" width="405" height="52"/><text x="42" y="56" class="mono">…</text></g>
    <path data-step="2" class="arrow" d="M…"/>
  </svg>
</div>
```

- Parts carry `data-step="N"` (several steps: `data-step="1 3"`). Captions length must equal max step + 1; the checker fails otherwise, and `data-captions-en` must have the same length.
- Available classes: `.box`, `.box.<colour>`, `.arrow`, `.arrow.flow` (animated dash), `.lane` (dashed divider), `text.mono`, `text.small`, `.pulse`. Coloured labels use `style="fill: var(--ros)"`.
- One `marker id="arr"` per SVG is fine; ids do not collide across SVGs because the stepper scopes by element.
- Step 0 describes the whole picture; each step caption explains one highlighted part in one to three sentences.

## Code blocks

`<pre data-lang="sh" data-file="run-sim.sh">…</pre>`. `data-lang` in sh, py, cpp, c, yaml, xml, cmake; `data-file` optional. HTML-escape `<`, `>` and `&`. Comments inside code may be Chinese. For `sh` blocks the copy button strips leading `$ ` prompts, so a prompt is allowed but not required.

## Quiz

```html
<form class="quiz" data-quiz="ros2/phase-1">
  <div class="q" data-answer="b">
    <p lang="zh-CN">1. 问题</p><p lang="en">1. Question</p>
    <label><input type="radio" name="q1" value="a"> <span lang="zh-CN">…</span><span lang="en">…</span></label>
    <label><input type="radio" name="q1" value="b"> <span lang="zh-CN">…</span><span lang="en">…</span></label>
    <label><input type="radio" name="q1" value="c"> <span lang="zh-CN">…</span><span lang="en">…</span></label>
    <div class="why" hidden><span lang="zh-CN">解释</span><span lang="en">Explanation</span></div>
  </div>
  … four questions …
  <button type="submit"><span lang="zh-CN">检查答案</span><span lang="en">Check answers</span></button>
  <div class="result"></div>
</form>
```

Four questions, three options each, every wrong option plausible, the explanation naming why the others are wrong.

## Colours

Global tokens in `assets/style.css`: `--accent` (sage green), `--linux` (ochre) and `--xnu` (indigo) for the kernel topic, `--ros` (blue) and `--gz` (orange) for ROS 2 and simulation. Use them as `th.ros`, `.box.ros`, `style="fill: var(--ros)"`. New topics add their own pair next to these, light and dark values both.

## Accuracy

- No invented APIs, commands, package names, file paths or numbers. If a path is only approximately known, write 大致路径 / approximate path next to it.
- Version facts are pinned to the distribution named in the topic syllabus and dated; anything that may change is marked as checked on a date.
- Bibliography entries are real books with author, title, edition, publisher and year, and the `span.lvl` names the chapters that match the page's concepts. Free online books get their URL.
- Resources are primary sources first: official docs, source files, design articles; then one or two secondary ones with a level label.

## Before returning a page

1. `node scripts/check-site.mjs` from the repo root must print `OK`.
2. Render at least one page with headless Chrome at 1440 × 1000 and read the PNG: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=1440,1000 --virtual-time-budget=4000 --screenshot=/tmp/lg-shots/<name>.png "file:///<abs path>/index.html"`.
3. Report: files written, the checker output, which pages were rendered, and every claim you were not sure of.
