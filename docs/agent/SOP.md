# Learning Garden SOP

Last updated: 2026-10-30

## SOP-001: Start Project Work

1. Read `AGENTS.md`.
2. Open [[DASHBOARD]], [[PROJECT_BRIEF]], [[TASK_BOARD]], and [[MEMORY]].
3. Check [[OPEN_QUESTIONS]] before implementation.
4. Create or update a task row for meaningful work.
5. For product-bearing work, classify Full/Lite/Exempt under the project `AGENTS.md`; record the required Accepted project-local PRD, PRD-lite, or exemption before CTO delivery planning, PM task splitting/dispatch, or Staff implementation. Bounded read-only Draft/Review advisory checks are allowed before acceptance but grant no delivery authority.
6. Keep details in task records and daily logs when traceability matters.

Done when:

- The task has an owner, next step, and verification plan.
- Product work has a current requirement baseline without implying implementation or release authority.

## SOP-002: Promote Lessons to Shadow

Use when a lesson from this project should affect other projects.

1. Record the project-specific lesson in [[MEMORY]].
2. Summarize the cross-project version in the Shadow repository under `docs/portfolio/CROSS_PROJECT_LESSONS.md`.
3. Update Shadow templates only if the lesson should apply to future projects by default.

Done when:

- The local project keeps its own evidence.
- Shadow stores only the reusable lesson.

## SOP-003: Close or Defer a Task

Use whenever a task changes to a closed status (`Done`, `Deferred`, `Canceled`, `Superseded`, `Decided`) or back to an open one.

1. Set the new status in the task record header: the front-matter `Status:` field; in legacy records, the `Status:` line above the first `##` section or under a leading `## Summary`, or the first line of a leading `## Status` section. A closure section appended to the body does not count.
2. Update the task's row in [[TASK_BOARD]]. A closed task may leave the board; an open one must keep its row.
3. Update the task's row in [[TASK_INDEX]].
4. Update the task's row in [[DASHBOARD]] if it has one.
5. Run `node scripts/check-task-status-reconciliation.mjs` from the project root.

Done when:

- The check exits 0.
- The close or defer report quotes the check's final `Checked N task IDs ...` line.
