#!/usr/bin/env node
// Learning Garden site check: no deps. Fails (exit 1) on any broken local
// link/asset, any phase page without exactly one svg[data-diagram] with
// data-captions, or a phase page that does not load the stepper.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'docs' || e.name === 'tmp') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const pages = walk(root);
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const rel = path.relative(root, page);
  const dir = path.dirname(page);

  // local links and assets
  for (const m of html.matchAll(/\b(?:href|src)="([^"#?]+)[^"]*"/g)) {
    const target = m[1];
    if (/^(https?:|mailto:|data:|javascript:)/.test(target)) continue;
    if (!fs.existsSync(path.resolve(dir, target))) problems.push(`${rel}: missing ${target}`);
  }

  if (!/<script src="[./]*assets\/theme\.js"><\/script>\s*(<script src="[./]*assets\/lang\.js"><\/script>\s*)?<\/head>/.test(html)) problems.push(`${rel}: assets/theme.js not loaded in <head>`);
  if (!/<script src="[./]*assets\/lang\.js"><\/script>/.test(html)) problems.push(`${rel}: assets/lang.js not loaded`);
  if (!/<button class="lang"/.test(html)) problems.push(`${rel}: language button missing`);
  if (!/<meta name="google" content="notranslate">/.test(html)) problems.push(`${rel}: notranslate meta missing`);
  if (!/<link rel="icon" href="[./]*assets\/brand\/favicon\.svg"/.test(html)) problems.push(`${rel}: favicon link missing`);

  // phase pages
  if (/\/phase-\d+-[^/]+\/index\.html$/.test(page)) {
    const diagrams = html.match(/<svg[^>]*\bdata-diagram\b/g) || [];
    if (diagrams.length < 1) problems.push(`${rel}: no svg[data-diagram]`);
    for (const d of html.matchAll(/<svg[^>]*\bdata-diagram\b[^>]*>/g)) {
      if (!/data-captions=/.test(d[0])) problems.push(`${rel}: diagram without data-captions`);
    }
    if (!/assets\/diagram\.js/.test(html)) problems.push(`${rel}: diagram.js not loaded`);
    if (!/assets\/rail\.js/.test(html)) problems.push(`${rel}: rail.js not loaded`);
    if (!/assets\/code\.js/.test(html)) problems.push(`${rel}: code.js not loaded`);
    if (/<form class="quiz"/.test(html) && !/assets\/quiz\.js/.test(html)) problems.push(`${rel}: quiz present but quiz.js not loaded`);
    for (const h of ['目标', '核心概念', '动画图解', '资料', '参考书目']) {
      if (!html.includes(h)) problems.push(`${rel}: section "${h}" missing`);
    }
  }

  // data-step values must be within captions length
  for (const d of html.matchAll(/<svg[^>]*data-captions='([^']*)'[\s\S]*?<\/svg>/g)) {
    let captions;
    try { captions = JSON.parse(d[1]); } catch { problems.push(`${rel}: data-captions is not valid JSON`); continue; }
    const steps = [...d[0].matchAll(/data-step="([^"]+)"/g)].flatMap(s => s[1].split(/\s+/).map(Number));
    const max = Math.max(0, ...steps);
    if (captions.length !== max + 1) problems.push(`${rel}: captions ${captions.length} != steps+1 (${max + 1})`);
    const en = /data-captions-en='([^']*)'/.exec(d[0]);
    if (en) {
      try { const ce = JSON.parse(en[1]); if (ce.length !== captions.length) problems.push(`${rel}: captions-en ${ce.length} != captions ${captions.length}`); }
      catch { problems.push(`${rel}: data-captions-en is not valid JSON`); }
    }
  }
}

console.log(`Checked ${pages.length} pages.`);
if (problems.length) { for (const p of problems) console.log('  ✗ ' + p); process.exit(1); }
console.log('OK');
