# Learning Garden Brief

Last updated: 2026-11-09

## Purpose

A private learning repository for the Founder. Each **topic** (a skill or career goal) is broken into ordered **learning phases**; each phase is one static HTML page with Chinese explanations, English technical terms, a Linux-vs-XNU (or equivalent) comparison, at least one **animated diagram** (inline SVG + CSS/JS stepper), a hands-on lab, a checkpoint quiz and a reading list. No build step, no dependencies, opens from the local clone.

First topic: **Kernel Engineering — becoming a kernel engineer at Apple.** Fundamentals first, Linux as the teaching vehicle (richest public material), XNU/Darwin side by side, ending with an Apple-track phase (build XNU, portfolio project, interview loop).

Topics live as of 2026-11-09: Kernel Engineering (Phases 0–8), ROS 2 (0–7), Parallel Programming (0–7), GPU Programming with CUDA (0–7), LLM Inference Kernels / SGLang (0–8): 47 lesson pages plus lab-environment pages. Every lesson is bilingual (中文 / English switch), carries the three learning devices (先看问题 / 走一遍 / 要点回顾) and two or three animated diagrams. The site, the rules and the checks are described in `README.md` and `docs/authoring/PAGE_CONTRACT.md`.

## Current Priority

- Nothing in progress. The build-out (PRs #1–#8) and the quality series (PRs #9–#14) are merged; the Founder stopped the refinement series on 2026-11-06 (「stop it at some point」). New work starts only on the Founder's word.
- Candidates waiting on the Founder, see [[OPEN_QUESTIONS]]: the CUDA and SGLang cloud labs (a GPU account, spend); the OpenMP labs (`libomp`, declined 2026-11-02); a real-browser look at the Chinese labels.

## Users / Customers

- The Founder (single learner). Content language: Chinese prose, English terms; every prose element has an English twin behind the language switch.

## Non-Goals

- No server, accounts, comments, analytics or external fetches.
- No analytics or accounts on the public site; `docs/` and `scripts/` are never published.
- Not a general course platform; one learner, curated topics.

## Success Criteria

- Each phase page passes `node scripts/check-site.mjs` (links resolve, diagrams with paired captions, stepper present, the three learning devices, paired zh/en containers, no circled numbers).
- Founder can open `index.html`, reach every phase, play every animation in light and dark, at desktop and phone width.
- Phase content is accurate against primary sources (kernel source at the pinned tags, Arm ARM, Apple docs, the engines' pinned releases); every non-obvious claim links its source in 资料; every version pin is verified live before use (`docs/authoring/*_SYLLABUS.md`).
- Labs that cannot run on the Founder's Mac (CUDA, SGLang cloud labs; OpenMP without `libomp`) are marked 未运行 / not run, never given invented numbers.

## Product Requirements

- Current PRD class/status/version: Exempt — personal learning material, no product promise, no users beyond the Founder (R-PRD-1); expected behaviour defined by this brief and the Shadow plan of 2026-10-30.
- Project-local PRD index or current PRD: `docs/product/`
- Product implementation requires an Accepted Full PRD, accepted PRD-lite task section, or recorded exemption under the project `AGENTS.md` rule.

## Links

- GitHub: `Second-Me-Garden/Learning-Garden` (public since 2026-10-30; Pages: https://second-me-garden.github.io/Learning-Garden/ ; `main` is PR-only with the `site integrity` check required)
- Local clone: registered in the Shadow portfolio (`LEARNING-GARDEN`)
- [[DASHBOARD]]
- [[TASK_BOARD]]
- [[ROADMAP]]
- [[DECISIONS]]
