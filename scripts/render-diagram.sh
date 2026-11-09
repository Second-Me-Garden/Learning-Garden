#!/bin/sh
# Render one animated diagram of a lesson at a given step, the way a Designer reviews it: the diagram and its
# heading alone on the page, transitions off, the language and theme seeded, at desktop width (1440 px) or
# as a true 390 px phone layout (headless Chrome floors its window at 500 px, so the page is framed inside a
# 390 px iframe host).
#
# Usage: sh scripts/render-diagram.sh <page> <diagram> <step|all> [lang] [theme] [width]
#   page     path relative to the repo root, e.g. topics/gpu-cuda/phase-4-profiling-and-optimization/index.html
#   diagram  0-based index among the page's diagrams: (a) = 0, (b) = 1, (c) = 2
#   step     a step number (0 = the full picture), or "all" for the review set: step 0 at 1440 px light and
#            dark, then every step 1..N at 390 px light (N = captions length - 1)
#   lang     en (default) or zh-CN;  theme  light (default) or dark;  width  1440 (default) or 390
# Output: .renders/diagrams/<topic>-<page>-d<diagram>-<lang>-<theme>-s<step>-<width>.png, one path per line.
# Read every PNG: nothing inside the 32 px fade bands at 390 px, no overlapping labels, lit boxes keeping
# their topic stroke, the caption matching the lit parts (docs/authoring/VERIFICATION.md).
set -eu
. "$(dirname "$0")/lib/browser.sh"
[ $# -ge 3 ] || { sed -n '2,16p' "$0" >&2; exit 2; }
ROOT=$(lg_root); CH=$(lg_browser); WORK=$(lg_work)
rel=${1#"$ROOT"/}; idx=$2; step=$3; lang=${4:-en}; theme=${5:-light}; width=${6:-1440}
src="$ROOT/$rel"; [ -f "$src" ] || { echo "no such page: $rel" >&2; exit 2; }
slug=$(lg_slug "$rel")
OUT="$WORK/diagrams"; mkdir -p "$OUT"
dir="$WORK/work/$(dirname "$rel")"; mkdir -p "$dir"; lg_link_assets "$WORK/work" "$ROOT"

render() { # render <step> <lang> <theme> <width>
  s=$1; l=$2; t=$3; w=$4
  copy="$dir/diagram-$slug-d$idx-$l-$t-s$s.html"
  inj="<style>.diagram [data-step]{transition:none !important}</style><script>window.addEventListener('load',function(){setTimeout(function(){var d=document.querySelectorAll('.diagram')[$idx];if(!d){document.body.textContent='no diagram $idx';return;}var h=d.previousElementSibling.previousElementSibling;var b=document.createElement('div');b.style.padding='12px';b.appendChild(h.cloneNode(true));b.appendChild(h.nextElementSibling.cloneNode(true));b.appendChild(d);Array.from(document.body.children).forEach(function(c){c.style.display='none'});document.body.prepend(b);var n=d.querySelectorAll('.controls button')[2];for(var i=0;i<$s;i++)n.click();},200)});</script>"
  lg_seed "$src" "$copy" "$l" "$t" -e "s#</body>#$inj</body>#"
  out="$OUT/$slug-d$idx-$l-$t-s$s-$w.png"
  if [ "$w" = 390 ]; then
    host="$dir/host-$slug-d$idx-$l-$t-s$s.html"
    printf '%s\n' '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#888"><iframe src="file://'"$copy"'" style="width:390px;height:900px;border:0;display:block"></iframe></body>' > "$host"
    "$CH" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --force-prefers-reduced-motion --virtual-time-budget=5000 --window-size=600,900 --screenshot="$out" "file://$host" >/dev/null 2>&1 || true
  else
    "$CH" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --force-prefers-reduced-motion --virtual-time-budget=5000 --window-size="$w",1000 --screenshot="$out" "file://$copy" >/dev/null 2>&1 || true
  fi
  [ -s "$out" ] || { echo "render failed: $out" >&2; exit 1; }
  printf '%s\n' "$out"
}

if [ "$step" = all ]; then
  n=$(node -e 'const fs=require("fs");const h=fs.readFileSync(process.argv[1],"utf8");const m=[...h.matchAll(/<svg[^>]*data-captions=\x27([^\x27]*)\x27/g)];const i=+process.argv[2];if(!m[i]){console.error("no diagram "+i+" on the page ("+m.length+" found)");process.exit(2)}console.log(JSON.parse(m[i][1]).length-1)' "$src" "$idx")
  render 0 "$lang" light 1440
  render 0 "$lang" dark 1440
  i=1; while [ "$i" -le "$n" ]; do render "$i" "$lang" light 390; i=$((i+1)); done
else
  render "$step" "$lang" "$theme" "$width"
fi
