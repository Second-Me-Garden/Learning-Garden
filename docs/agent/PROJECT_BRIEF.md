# Learning Garden Brief

Last updated: 2026-10-30

## Purpose

A private learning repository for the Founder. Each **topic** (a skill or career goal) is broken into ordered **learning phases**; each phase is one static HTML page with Chinese explanations, English technical terms, a Linux-vs-XNU (or equivalent) comparison, at least one **animated diagram** (inline SVG + CSS/JS stepper), a hands-on lab, a checkpoint quiz and a reading list. No build step, no dependencies, opens from the local clone.

First topic: **Kernel Engineering — becoming a kernel engineer at Apple.** Fundamentals first, Linux as the teaching vehicle (richest public material), XNU/Darwin side by side, ending with an Apple-track phase (build XNU, portfolio project, interview loop).

## Current Priority

- First delivery: hub + kernel topic index + Phases 0–2 complete, Phases 3–8 as structured skeletons (Shadow task record named in `DECISIONS.md`).
- Founder reviews Phase 0–2 style before the remaining phases are written.

## Users / Customers

- The Founder (single learner). Content language: Chinese prose, English terms.

## Non-Goals

- No server, accounts, comments, analytics or external fetches.
- No analytics or accounts on the public site; `docs/` and `scripts/` are never published.
- Not a general course platform; one learner, curated topics.

## Success Criteria

- Each phase page passes `node scripts/check-site.mjs` (links resolve, one `svg[data-diagram]` with captions, stepper present).
- Founder can open `index.html`, reach every phase, play every animation in light and dark.
- Phase content is accurate against primary sources (kernel source, Arm ARM, Apple docs); every non-obvious claim links its source in 资料.

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
