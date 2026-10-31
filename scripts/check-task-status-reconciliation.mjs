#!/usr/bin/env node
// Task-status reconciliation check. Installed by Shadow's project-bootstrap;
// the canonical copy lives in Shadow at
// docs/agent/templates/project-memory/scripts/check-task-status-reconciliation.mjs.
//
// A task's status is written in up to four places, and a close or defer is not
// finished until they agree:
//   1. the task record header, docs/agent/tasks/A-NNN.md: the `Status:` field
//      of the leading front-matter block; or, in legacy records, the first
//      `Status:` line (bulleted or bare) before the first `## ` heading or
//      inside a leading `## Summary` section, or the first line of a leading
//      `## Status` section. A `Status:` line further down the body, such as
//      one in an appended closure section, is NOT the header.
//   2. docs/agent/TASK_BOARD.md: the Status column of every row for the ID
//   3. docs/agent/TASK_INDEX.md: the Status column of every row for the ID
//   4. docs/agent/DASHBOARD.md: the Status column of every row for the ID,
//      when that file exists
// Tables are read by their header row, so a Status column need not be the
// second column. Only the status phrase is compared: markdown, a parenthesised
// or dashed qualifier, a trailing date, and any CJK note are dropped, and a
// phrase that starts with a known status word is that status. So
// "Done (implementation)" equals "Done", but "In Progress" does not equal
// "In Review" and "Deployed pending" does not equal "Deployed".
//
// Blocking (exit 1): the places that mention a task disagree; a record has no
// header status; a record has no TASK_INDEX row; a record that is not closed
// (Done, Deferred, Canceled, Superseded, Decided) has no TASK_BOARD row. A closed task
// may leave the board. Table rows with no task record are listed as a
// non-blocking note.
//
// Why: on 2026-09-22 the AllCPR PM office closed five tasks by updating
// TASK_INDEX and appending closure sections to the record bodies, but left the
// record headers and TASK_BOARD rows stale; on 2026-09-23 seven open AllCPR
// tasks turned out to have no board row at all, which a status comparison
// cannot see. Run this before reporting any close or defer as complete.
//
// Usage: node scripts/check-task-status-reconciliation.mjs [--root <path>]
// Exit codes: 0 consistent; 1 mismatches; 2 usage error, missing ledger, or
// nothing to check.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const USAGE = `Usage: node scripts/check-task-status-reconciliation.mjs [--root <path>]

Checks the ledger of the project this script is installed in (its parent
directory). --root checks the project at <path> instead.
`;

function fail(message, code = 2) {
  process.stderr.write(`check-task-status-reconciliation: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  let root = null;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--root") {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("-")) return { error: "--root requires a path argument" };
      root = value;
      i += 1;
    } else if (argv[i] === "-h" || argv[i] === "--help") {
      return { help: true };
    } else {
      return { error: `unknown argument: ${argv[i]}` };
    }
  }
  return { root };
}

const TASK_FILE = /^(A-\d+[a-z]?)\.md$/;
const TASK_ID = /^(?:tasks\/)?(A-\d+[a-z]?)(?:\.md)?$/;
const STATUS_LINE = /^[\t ]*(?:[-*+][\t ]+)?(?:\*\*|__)?Status(?:\*\*|__)?[\t ]*[:：][\t ]*(?:\*\*|__)?[\t ]*(.*)$/i;
const STATUS_HEADER = /^(status|state|状态)$/i;
// A phrase that starts with one of these words is that status, so "Done with
// documented limitation" is "done" and "Blocked on founder" is "blocked".
// Anything else is compared as the whole phrase ("Deployed pending").
const KNOWN_STATUSES = [
  "in progress", "in review", "backlog", "ready", "blocked", "review", "done", "deferred",
  "paused", "canceled", "cancelled", "superseded", "accepted", "decided", "complete", "completed",
].sort((a, b) => b.length - a.length);
// A record in one of these states may leave TASK_BOARD; any other must keep a row.
// A project whose ledger uses another terminal status adds it here in Shadow's
// canonical copy, with a test, and re-copies the file; do not fork it locally.
const CLOSED_STATUSES = new Set(["done", "deferred", "canceled", "superseded", "decided"]);
const SYNONYMS = new Map([
  ["complete", "done"],
  ["completed", "done"],
  ["cancelled", "canceled"],
  ["in review", "review"],
]);

function stripMarkdown(value) {
  return String(value ?? "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_match, target, label) => label || target)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__/g, "")
    .trim();
}

// The comparable part of a status: "Done (implementation)", "**Done**",
// "Done 2026-09-22", and "Done，已上线" all reduce to "done".
export function statusKey(raw) {
  let value = stripMarkdown(raw).replace(/^[^\p{L}]+/u, "");
  value = value.split(/[(（[【—–;；,，:：。|/]|\s-\s|\s\d{4}-\d{1,2}-\d{1,2}|\p{Script=Han}/u)[0];
  value = value.replace(/\s+/g, " ").trim().toLowerCase();
  const known = KNOWN_STATUSES.find((status) => value === status || value.startsWith(`${status} `));
  if (known) value = known;
  return SYNONYMS.get(value) ?? value;
}

export function recordHeaderStatus(markdown) {
  const source = String(markdown ?? "").replace(/^﻿/, "");
  const frontMatter = source.match(/^---[\t ]*\r?\n([\s\S]*?)\r?\n---[\t ]*(?:\r?\n|$)/);
  if (frontMatter) {
    for (const line of frontMatter[1].split(/\r?\n/)) {
      const match = line.match(STATUS_LINE);
      if (match) return { status: match[1].trim(), source: "front matter" };
    }
  }
  const body = frontMatter ? source.slice(frontMatter[0].length) : source;
  let firstSection = null;
  for (const line of body.split(/\r?\n/)) {
    if (/^##[\t ]+/.test(line)) {
      if (firstSection !== null) break;
      firstSection = line.replace(/^##[\t ]+/, "").trim().toLowerCase();
      if (firstSection !== "summary" && firstSection !== "status") break;
      continue;
    }
    if (firstSection === "status") {
      if (line.trim()) return { status: line.replace(/^[\t ]*[-*+][\t ]+/, "").trim(), source: "Status section" };
      continue;
    }
    const match = line.match(STATUS_LINE);
    if (match) return { status: match[1].trim(), source: firstSection ? "Summary section" : "preamble" };
  }
  return null;
}

// Cells split on unescaped pipes; a pipe inside a [[target|alias]] link stays
// in its cell.
function splitRow(line) {
  return line
    .trim()
    .replace(/\[\[[^\]]*\]\]/g, (link) => link.replace(/\|/g, "\u0000"))
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.replace(/\u0000/g, "|").trim());
}

const SEPARATOR_ROW = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

// Map of task ID -> raw status cells, read from every table in the file whose
// header row has a Status column and whose first column holds the task ID.
export function tableStatuses(markdown) {
  const rows = new Map();
  const lines = String(markdown ?? "").split(/\r?\n/);
  let statusColumn = -1;
  let inTable = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!/^\s*\|/.test(line)) {
      inTable = false;
      statusColumn = -1;
      continue;
    }
    if (!inTable) {
      inTable = true;
      if (SEPARATOR_ROW.test(lines[i + 1] ?? "")) {
        statusColumn = splitRow(line).findIndex((cell) => STATUS_HEADER.test(stripMarkdown(cell)));
        i += 1;
        continue;
      }
    }
    if (statusColumn < 0) continue;
    const cells = splitRow(line);
    const id = stripMarkdown(cells[0]).match(TASK_ID)?.[1];
    if (!id || cells[statusColumn] === undefined) continue;
    if (!rows.has(id)) rows.set(id, []);
    rows.get(id).push(cells[statusColumn]);
  }
  return rows;
}

function compareIds(a, b) {
  const [, na, sa] = a.match(/^A-(\d+)([a-z]?)$/);
  const [, nb, sb] = b.match(/^A-(\d+)([a-z]?)$/);
  return Number(na) - Number(nb) || sa.localeCompare(sb);
}

export function reconcile(root) {
  const agent = path.join(root, "docs", "agent");
  const taskDir = path.join(agent, "tasks");
  for (const required of [taskDir, path.join(agent, "TASK_BOARD.md"), path.join(agent, "TASK_INDEX.md")]) {
    if (!fs.existsSync(required)) {
      return { fatal: `missing ${path.relative(root, required)} under ${root}; is this a Shadow-ledger project root?` };
    }
  }

  const records = new Map();
  for (const file of fs.readdirSync(taskDir)) {
    const id = file.match(TASK_FILE)?.[1];
    if (id) records.set(id, recordHeaderStatus(fs.readFileSync(path.join(taskDir, file), "utf8")));
  }
  const tables = [["TASK_BOARD", "TASK_BOARD.md"], ["TASK_INDEX", "TASK_INDEX.md"], ["DASHBOARD", "DASHBOARD.md"]]
    .filter(([, file]) => fs.existsSync(path.join(agent, file)))
    .map(([name, file]) => [name, tableStatuses(fs.readFileSync(path.join(agent, file), "utf8"))]);
  const index = tables.find(([name]) => name === "TASK_INDEX")[1];
  const board = tables.find(([name]) => name === "TASK_BOARD")[1];

  const ids = new Set(records.keys());
  for (const [, rows] of tables) for (const id of rows.keys()) ids.add(id);
  const sortedIds = [...ids].sort(compareIds);

  const problems = [];
  const withoutRecord = [];
  for (const id of sortedIds) {
    const seen = [];
    if (records.has(id)) {
      const header = records.get(id);
      if (!header || !statusKey(header.status)) {
        problems.push(`${id}: task record docs/agent/tasks/${id}.md has no header Status (front matter, preamble, or leading ## Summary / ## Status)`);
      } else {
        seen.push(["record", header.status]);
      }
      if (!index.has(id)) problems.push(`${id}: task record exists but TASK_INDEX has no row for it`);
      if (header && !CLOSED_STATUSES.has(statusKey(header.status)) && !board.has(id)) {
        problems.push(`${id}: task record is open (${JSON.stringify(stripMarkdown(header.status).slice(0, 40))}) but TASK_BOARD has no row for it`);
      }
    } else {
      withoutRecord.push(id);
    }
    for (const [name, rows] of tables) {
      for (const raw of rows.get(id) ?? []) seen.push([name, raw]);
    }
    if (new Set(seen.map(([, raw]) => statusKey(raw))).size > 1) {
      const detail = seen.map(([name, raw]) => `${name}=${JSON.stringify(stripMarkdown(raw).slice(0, 60))}`).join(" | ");
      problems.push(`${id}: status disagrees: ${detail}`);
    }
  }
  return { ids: sortedIds, recordCount: records.size, problems, withoutRecord, tablesRead: tables.map(([name]) => name) };
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    process.stdout.write(USAGE);
    return;
  }
  if (parsed.error) fail(`${parsed.error}\n\n${USAGE}`);

  const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const root = parsed.root ? path.resolve(parsed.root) : scriptRoot;
  console.log(`Validated root: ${root} (source=${parsed.root ? "--root" : "script location"})`);
  const gitPath = path.join(root, ".git");
  if (fs.existsSync(gitPath) && fs.statSync(gitPath).isFile()) {
    console.log("Note: this root is a linked git worktree; its ledger may lag the main checkout.");
  }

  const result = reconcile(root);
  if (result.fatal) fail(result.fatal);
  if (result.ids.length === 0) fail("no task IDs found in the task records or tables; nothing was checked");

  for (const problem of result.problems) console.log(problem);
  if (result.withoutRecord.length) {
    console.log(
      `Note (non-blocking): ${result.withoutRecord.length} ID(s) appear in tables but have no task record: ${result.withoutRecord.join(", ")}`,
    );
  }
  console.log(
    `Checked ${result.ids.length} task IDs (${result.recordCount} records; ${result.tablesRead.join(", ")}): ${result.problems.length} problem(s).`,
  );
  process.exit(result.problems.length === 0 ? 0 : 1);
}

function isEntryPoint() {
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (process.argv[1] && isEntryPoint()) {
  main();
}
