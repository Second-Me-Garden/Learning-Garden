#!/bin/sh
# Probe the lesson rail (assets/rail.js) headless at 1600 px wide (the rail exists from 1480 px up), in
# both languages. For every section heading the rail lists, scripts/lib/probe-rail.js checks: a rail click
# marks that section; a heading placed 20 % and 24 % down the window marks its section; at 26 % and 35 %
# the previous section stays marked; after a click, scrolling to the page end marks the last section unless
# the clicked heading is still on screen. Run it after any change to rail.js, style.css or the lesson header.
#
# Usage: sh scripts/probe-rail.sh [<page>...]      (default: every lesson and lab-setup page)
# Output: .renders/rail-probe.txt (one line per case) and a summary line; exit 1 when any case mismatches.
set -eu
. "$(dirname "$0")/lib/browser.sh"
ROOT=$(lg_root); CH=$(lg_browser); WORK=$(lg_work)/rail
rm -rf "$WORK"; mkdir -p "$WORK"; lg_link_assets "$WORK" "$ROOT"
cp "$ROOT/scripts/lib/probe-rail.js" "$WORK/probe.js"
OUTF="$(lg_work)/rail-probe.txt"; : > "$OUTF"
if [ $# -eq 0 ]; then
  set -- $(cd "$ROOT" && ls topics/*/phase-*/index.html topics/*/lab-setup/index.html 2>/dev/null)
fi
for rel in "$@"; do
  rel=${rel#"$ROOT"/}
  src="$ROOT/$rel"; dir="$WORK/$(dirname "$rel")"; mkdir -p "$dir"
  depth=$(printf '%s' "$rel" | awk -F/ '{print NF-1}')
  up=""; i=0; while [ "$i" -lt "$depth" ]; do up="../$up"; i=$((i+1)); done
  for lang in zh-CN en; do
    copy="$dir/probe-$lang.html"
    lg_seed "$src" "$copy" "$lang" light -e "s#</body>#<script src=\"${up}probe.js\"></script></body>#"
    dom=$("$CH" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --force-prefers-reduced-motion --window-size=1600,1000 --virtual-time-budget=30000 --dump-dom "file://$copy" 2>/dev/null || true)
    printf '%s' "$dom" | grep -o 'LGPROBE [^<]*' | sed "s#^#$rel $lang #" >> "$OUTF" || true
  done
done
ok=$(grep -c 'LGPROBE ok' "$OUTF" || true); mm=$(grep -c 'LGPROBE MISMATCH' "$OUTF" || true)
sk=$(grep -c 'LGPROBE skip' "$OUTF" || true); nr=$(grep -c 'LGPROBE no-rail' "$OUTF" || true)
printf 'rail probe: ok=%s mismatch=%s skip=%s no-rail=%s  (%s)\n' "$ok" "$mm" "$sk" "$nr" "$OUTF"
[ "$mm" -eq 0 ] && [ "$ok" -gt 0 ]
