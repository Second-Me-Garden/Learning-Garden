# Learning Garden Decisions

Last updated: 2026-11-09

## 2026-10-30: Static site, public repo, PR-only main

Decision:

- Hand-written HTML, CSS, SVG and JS with no build step and no dependencies; the repo is public with GitHub Pages; `main` accepts pull requests only, with the `site integrity` CI check required; a merge publishes.

Reason:

- Pages need a public repo on the free plan; PR-only main keeps the published site equal to what CI checked.

## 2026-10-31: Every prose element is bilingual

Decision:

- Chinese prose with English technical terms, and an English twin for every prose element behind the language switch (`lang="zh-CN"` / `lang="en"` pairs; diagram captions in two arrays of equal length).

Reason:

- One learner reads in Chinese; the English twin keeps the terms and lets the pages be read either way.

## 2026-11-03: One page contract and one syllabus per topic

Decision:

- Every lesson follows `docs/authoring/PAGE_CONTRACT.md`; every topic has a syllabus under `docs/authoring/` with its version pins, each pin verified live with its source and date.
- A lab that cannot run on the Founder's Mac (CUDA and SGLang cloud labs without a GPU account; OpenMP without `libomp`) is marked 未运行 / not run, with a measured Metal twin where one exists; numbers are never invented.

Reason:

- Four topics were written in parallel by several writers; the contract and the checker keep them one site. Invented lab output would teach the wrong thing.

## 2026-11-03: No circled numbers anywhere

Decision:

- Never a circled-digit glyph (U+2460 to U+2473) in any text, caption, label or quiz; write 1. 2. 3. or (a) (b). The checker bans the glyphs site-wide (PR #9).

Reason:

- The Founder's direction; the glyphs overlap and render unevenly.

## 2026-11-04: The lesson rail follows the reading band

Decision:

- The rail marks as current the last section heading at or above 25 % of the window height; a rail click keeps its heading while it is inside that band; the last section is current at the page bottom.

Reason:

- The Founder's reading habit: the section being read is the one whose title has just passed the top quarter, not the one touching the top edge.

## 2026-11-04: Three learning devices in every lesson

Decision:

- Every lesson carries 先看问题 / The problem first before concept 1, at least one 走一遍 / Worked example inside the concept that carries the mechanism, and 要点回顾 / Key takeaways with 常见误解 / Common misconceptions before 对照表. The checker enforces the set.

Reason:

- Taken from the course and book patterns the Researcher confirmed (OSTEP crux boxes, CS:APP practice problems, chapter summaries); they make a mechanism page easier to learn.

## 2026-11-05: The kernel topic is pinned

Decision:

- Linux `v7.3.1` on the kernel.org stable tree (read through the `gregkh/linux` mirror; torvalds/linux carries only mainline tags) and XNU `xnu-12377.121.6`; every claim and every source link verified at those tags (`docs/authoring/KERNEL_SYLLABUS.md`).

Reason:

- Pages written against `master` drift; a version-dated claim must come from bisecting tags (the `do_file_open` rename shipped in 7.0, not 7.4-rc1 as first noted).

## 2026-11-06: The refinement series stops after pass 3

Decision:

- Nothing further starts after PR #14 without the Founder's word.

Reason:

- Founder: 「stop it at some point」.
