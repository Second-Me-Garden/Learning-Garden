# Agent Instructions

This project uses the Shadow project-memory template.

## Read First

- `docs/agent/PROJECT_BRIEF.md`
- `docs/agent/DASHBOARD.md`
- `docs/agent/TASK_BOARD.md`
- `docs/agent/TASK_INDEX.md`
- `docs/agent/MEMORY.md`
- `docs/agent/DECISIONS.md`
- `docs/agent/OPEN_QUESTIONS.md`
- `docs/agent/SOP.md`

## Operating Rules

- Keep project-specific memory in this repository.
- Keep company-level rules, reusable agent roles, and cross-project portfolio state in the Shadow system repository.
- Do not commit secrets, credentials, tokens, or private customer data.
- For GitHub operations, use this project's GitHub account or owner. Run `gh auth status` before `gh` commands and ask the founder if the correct account is ambiguous.
- When entering this Git repo for a new task, ask whether to run `git pull` before analysis, planning, or edits; do not pull without founder confirmation.
- Do not create or upload this project to GitHub without founder confirmation of account or organization, repository name, visibility, and timing.
- Do not stage, commit, or push project-memory files in this repo until the founder confirms whether they should be uploaded with the repo.
- When an action needs missing founder-provided information, approvals, account choices, paths, credential references, target IDs, or business parameters, pause and ask for the missing inputs explicitly before running the action.
- If founder instructions conflict with project memory, decisions, tasks, or observed repo state, ask for confirmation before changing the source of truth.
- If a better approach is available, present options with pros, cons, risks, and a recommendation before changing direction.
- Do not let multiple agents edit the same files at the same time.
- Before CTO delivery planning, PM task splitting/dispatch, or Staff implementation, classify the requirement as Full PRD, PRD-lite, or PRD-exempt. Full work needs an Accepted project-local PRD; Lite work needs an accepted PRD-lite section in the task record; Exempt work records the reason and existing behavior baseline. Bounded read-only Draft/Review advisory checks are allowed before acceptance but grant no delivery authority. CEO owns product requirements, while Founder approval is needed only for Founder-owned direction/taste/hard gates.
- An Accepted PRD is a product-definition baseline, not implementation, production, credential, Git, promotion, release, or external-service authority. Its semantic content and acceptance evidence are immutable; material requirement changes create a new Draft version and require affected plans, tasks, reviews, and QA evidence to be rechecked. Without a new version, only append-only change-log/addendum/reference-integrity entries and `Superseded`/`Archived` state transitions may be added.
- Keep PRD instances in this project. Do not duplicate the full document into Shadow; sync only compact status, decisions, blockers, and links.
- Use task IDs for meaningful work.
- A task's status lives in its record header (the front-matter `Status:` field; in legacy records, the `Status:` line above the first `##` section or under a leading `## Summary`, or the first line of a leading `## Status` section), its `docs/agent/TASK_BOARD.md` row, its `docs/agent/TASK_INDEX.md` row, and any `docs/agent/DASHBOARD.md` row. When closing, deferring, canceling, or reopening a task, update every one of them; a closure note appended to the record body does not change the header. Then run `node scripts/check-task-status-reconciliation.mjs` and do not report the close or defer as complete until it exits 0. Quote its final `Checked N task IDs ...` line in the report.
- Update `docs/agent/TASK_LOG.md` after meaningful project tasks.
- Update `docs/agent/DECISIONS.md` when a decision affects future work.
- Update `docs/agent/MEMORY.md` when a lesson or preference should change future behavior in this project.
- Sync only critical project core and reusable lessons back to Shadow; keep full task history and project-local details in this project.
- Do not leave reusable system-level learnings only in this project. If a lesson affects Shadow-wide agent behavior, SOPs, roles, skills, prompts, templates, VCC, security, GitHub/API/MCP/platform policy, or cross-project strategy, promote it to the appropriate Shadow system document too.

## Verification

Prefer the smallest relevant verification command for the change. If no command exists yet, document what could not be verified and why.

Ledger changes: `node scripts/check-task-status-reconciliation.mjs` (exit 0 means the record headers, `TASK_BOARD.md`, `TASK_INDEX.md`, and `DASHBOARD.md` agree). Its parser is maintained in Shadow (`docs/agent/templates/project-memory/scripts/`). If this project changes its task-record or table format, fix the parser there, not only here.
