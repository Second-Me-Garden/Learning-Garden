# Verification

How a change to this site is checked before it is merged. `node scripts/check-site.mjs` is the structural
check that CI runs; the rest reads the rendered pages, which CI does not do. All of it runs on any machine
with Node 18 or later and a headless Chromium: on macOS Google Chrome is found on its own; on Linux install
`chromium` (Debian/Ubuntu: `apt-get install chromium`, or `npx playwright install chromium`) and, when it is
not on the PATH, point `LG_BROWSER` at the binary. The scripts write only under `.renders/` (gitignored) and
never inside `topics/` or `assets/`.

## Before any pull request

1. `node scripts/check-site.mjs` prints `OK`: links resolve, every diagram has paired captions whose length
   matches its steps, every lesson has the three learning devices, zh-CN and en block counts agree, no
   circled-digit glyph anywhere.
2. `sh scripts/leak-scan.sh --against main <every changed lesson page>`: the visible Han count in English
   mode must not rise on any page (delta 0). Some Chinese is legitimate in English mode, so the comparison is
   against `main`, not against zero; the zh-CN control column must be large.
3. For every new or changed diagram: `sh scripts/render-diagram.sh <page> <0|1|2> all` and read every PNG
   (step 0 at 1440 px light and dark, each lit step at 390 px). Repeat with `zh-CN` when Chinese labels
   changed. What to look for:
   - at 390 px nothing lit sits inside the 32 px fade bands at the two edges (a lit step fits 330 viewBox
     units, see the contract's width budget);
   - no label overlaps a box or another label, no text runs past its box;
   - a lit box keeps its topic stroke (ochre, indigo, blue, orange, purple, plum, slate) and a quantity bar
     lights with its step (`.bar`); `.hl` only on picked grid cells;
   - the caption names exactly the parts that are lit, numbers in the caption match the drawing, and the
     English caption says what the Chinese one says.
4. After a stylesheet, header or hub change: `sh scripts/render-page.sh <page>` on one lesson per topic and
   the hub, light and dark and the 390 px phone layout, and read them.
5. After a change to `assets/rail.js`, `style.css` or the lesson header: `sh scripts/probe-rail.sh` must end
   with `mismatch=0` (about a minute for all lessons; pass page paths to narrow it).
6. Facts: every number on a page is traceable to the page's own lab output or a named primary source at the
   pinned version in the topic's syllabus; a version pin is fetched live (release page, tag list, registry)
   before it is written down; a claim that could not be checked is marked for the reviewer, never smoothed
   over.

## Where the pieces run

| Check | Script | Needs |
| --- | --- | --- |
| Structure, captions, devices, glyphs | `scripts/check-site.mjs` | Node (CI runs it) |
| Ledger consistency (docs/agent) | `scripts/check-task-status-reconciliation.mjs` | Node |
| English-mode leak scan, with baseline | `scripts/leak-scan.sh` | Node, Chromium, git |
| One diagram, one step or the review set | `scripts/render-diagram.sh` | Chromium |
| Whole page, light / dark / phone | `scripts/render-page.sh` | Chromium |
| Rail reading-band behaviour | `scripts/probe-rail.sh` + `scripts/lib/probe-rail.js` | Chromium |

Measured lab numbers are a different matter: the Metal twins, the `sample` profiles and the NEON and OpenMP
timings on the pages were measured on the Founder's Apple Silicon Mac and can only be re-measured there; the
CUDA and SGLang cloud labs need a GPU account and stay marked 未运行 / not run until one exists. A Linux
sandbox verifies pages; it does not produce lab numbers.

## Output names

`.renders/diagrams/<topic>-<page>-d<diagram>-<lang>-<theme>-s<step>-<width>.png`,
`.renders/pages/<topic>-<page>-<lang>-<theme>-1440.png` and `-phone390.png`, `.renders/rail-probe.txt`.
Delete `.renders/` whenever you like; everything in it is regenerated.
