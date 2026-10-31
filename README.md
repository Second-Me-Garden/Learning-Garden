# Learning Garden

分阶段的学习路径 + 动画图解。每个 **topic** 是一项技能或职业目标，拆成有序的 **phase**；每个 phase 是一页静态 HTML：中文讲解、英文术语、Linux ↔ XNU 对照、至少一张可逐步播放的 SVG 动画、动手实验、自测题和资料清单。

无构建、无依赖。线上：https://second-me-garden.github.io/Learning-Garden/ ；本地直接打开：

```
open index.html
```

`main` 只接受 PR，且 CI（`site integrity`）必须通过才能合并；Pages 由 `.github/workflows/pages.yml` 在检查通过后部署，只发布 `index.html`、`assets/`、`topics/`。

## Topics

| Topic | Goal | Status |
|---|---|---|
| [Kernel Engineering](topics/kernel-engineering/index.html) | 成为 Apple 的 kernel engineer：从内核基础（以 Linux 为教学载体）到 XNU/Darwin 与 Apple 面试 | Phases 0–8 complete |

## Layout

```
index.html                    topic hub
assets/style.css              tokens, light/dark, layout
assets/diagram.js             diagram stepper (play / step / reset, ← → space)
assets/quiz.js                checkpoint quiz (localStorage only)
topics/<topic>/index.html     phase map + roadmap diagram
topics/<topic>/phase-N-*/     one page per phase
scripts/check-site.mjs        link + diagram integrity check (node, no deps)
docs/agent/                   Shadow project memory
```

## Writing a phase

Follow `docs/authoring/PAGE_CONTRACT.md` (page skeleton, bilingual pairing, diagrams, code, quiz, bibliography, checks) and the topic's syllabus under `docs/authoring/`. Copy `topics/kernel-engineering/phase-1-boot-and-processes/index.html` as the exemplar. Sections in order: 目标 → 前置 → 核心概念 → 对照表 → 动画图解 → 动手实验 → 自测 → 资料 → 参考书目。

An animated diagram is an inline `<svg data-diagram data-captions='[...]'>` whose parts carry `data-step="N"`; `assets/diagram.js` adds the controls. Step 0 is the full picture; steps 1..N highlight that step's parts and dim the rest. Use `class="pulse"` or `class="flow"` on a part for continuous motion.

Check before committing:

```
node scripts/check-site.mjs
```
