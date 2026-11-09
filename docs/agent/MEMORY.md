# Learning Garden Memory

Last updated: 2026-11-09

Use this file for project-specific memory that should change future behavior inside this project.

## Project Preferences

| Date | Preference / Rule | Evidence | Applies To |
| --- | --- | --- | --- |
| 2026-10-30 | Keep project-specific tasks, decisions, logs, and lessons inside this project repo. | Shadow project-memory template. | All agents |
| 2026-10-30 | Ask whether to run `git pull` when entering this Git repo for a new task. | Shadow project-memory template. | All agents |
| 2026-10-30 | Ask before committing or uploading this project's agent memory files with the repo. | Shadow project-memory template. | Main Agent, Staff Engineer |
| 2026-10-30 | Sync only critical project core and reusable lessons back to Shadow. | Shadow project-memory template. | Main Agent, Archivist |
| 2026-10-30 | Promote reusable system-level lessons to Shadow system docs, not only this project memory. | Shadow project-memory template. | Main Agent, Archivist |
| 2026-10-30 | Use this project's GitHub account or owner for project-level `gh` operations; ask before creating or uploading a new GitHub repo. | Shadow project-memory template. | Main Agent, Staff Engineer |
| 2026-10-30 | Ask the founder for missing required action inputs before running dependent actions. | Shadow project-memory template. | All agents |
| 2026-10-30 | Ask for confirmation when founder instructions conflict with project memory, decisions, tasks, or observed repo state. | Shadow project-memory template. | All agents |
| 2026-10-31 | Never use circled numbers (the circled-digit glyphs U+2460 to U+2473) anywhere, in any language; write 1. 2. 3. or (a) (b). | Founder direction; `scripts/check-site.mjs` bans the glyphs site-wide since PR #9. | All agents |
| 2026-11-01 | Do not invent lab results. A lab that cannot run here (no GPU account, no `libomp`) is marked 未运行 / not run and the Metal twin is measured instead. | Topic pages and the README status column. | Writers, reviewers |
| 2026-11-02 | No software installs on the Founder's Mac and no cloud spend without the Founder's yes. | `libomp` declined 2026-11-02; ripgrep approved 2026-11-05. | All agents |
| 2026-11-04 | `main` is PR-only and a merge publishes to Pages: every change goes through a PR with CI green, and the Founder has merged each PR personally so far. | PRs #1–#14. | All agents |
| 2026-11-06 | The Founder stopped the refinement series after pass 3; a new pass, the cloud labs or any new topic starts only on the Founder's word. | 「stop it at some point」, 2026-11-06. | All agents |

## Lessons Learned

| Date | Lesson | Change Made | Follow-up |
| --- | --- | --- | --- |
| 2026-10-30 | Project memory was initialized from Shadow. | Added local project-memory docs. | Done: brief filled 2026-10-30, refreshed 2026-11-09. |
| 2026-11-01 | A search snippet naming a version is not the version: fetch the release page, the registry tag list or the GitHub tag before pinning (CUDA 13.4 Update 2 not 13.2; PMPP 5th edition; MSL 4.1; `do_file_open` renamed in Linux 7.0, not 7.4-rc1). | Every syllabus pin table carries its source page and date. | Re-check the pins whenever a topic is touched. |
| 2026-11-03 | Caption arrays are parsed as JSON: the zh and en arrays must have equal length, and no apostrophe may sit inside the attribute. | The checker enforces the counts; `PAGE_CONTRACT.md` states the rule. | — |
| 2026-11-04 | Unpaired prose leaks Chinese into English mode. An English-mode leak scan (seed the saved language to `en`, render headless, count visible CJK, compare with `main`) catches it before a PR. | Run before each PR that touches lessons. | — |
| 2026-11-05 | Phone width: a lit diagram step must fit 330 viewBox units because the scroller fades 32 px at each edge; render each step at 390 px inside an iframe host, since headless Chrome floors the window at 500 px. | Width budget in `PAGE_CONTRACT.md`. | — |
| 2026-11-06 | A third diagram (c) is only for a crux-central mechanism the prose alone carried, and never repeats (a) or (b); when the repeated part is incidental to the new mechanism, trim the new diagram and point at the older step. | Clauses in `PAGE_CONTRACT.md` (2026-11-04, 2026-11-06). | — |
| 2026-11-06 | The review chain that worked: a Designer reads per-step renders handed to it by exact path (its sandbox lists nothing); a facts Reviewer checks every number against the page's own outputs and primary sources and marks what it could not open; the coordinator fetches the pinned source file before any fix on a marked claim; after a fix list, search the page for the old figure, because it recurs. | Practice across PRs #12–#14 (Shadow A-579 to A-582). | — |

## Promote to Shadow When

Promote a lesson to the Shadow portfolio or Shadow system docs when it applies across multiple projects, changes company-level SOP, changes default agent behavior, affects roles, skills, prompts, templates, VCC, security, GitHub/API/MCP/platform policy, or should affect future project templates.
