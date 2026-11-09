#!/bin/sh
# Render a whole page for a design read: light and dark at 1440 px wide (full height), and a true 390 px
# phone layout in light (the page framed inside a 390 px iframe host, since headless Chrome floors its
# window at 500 px). Use it after a stylesheet or header change, on one page per topic plus the hub.
#
# Usage: sh scripts/render-page.sh <page> [lang]
#   page  path relative to the repo root (index.html for the hub);  lang  en (default) or zh-CN
# Output: .renders/pages/<slug>-<lang>-light-1440.png, -dark-1440.png and -phone390.png, one path per line.
set -eu
. "$(dirname "$0")/lib/browser.sh"
[ $# -ge 1 ] || { sed -n '2,9p' "$0" >&2; exit 2; }
ROOT=$(lg_root); CH=$(lg_browser); WORK=$(lg_work)
rel=${1#"$ROOT"/}; lang=${2:-en}
src="$ROOT/$rel"; [ -f "$src" ] || { echo "no such page: $rel" >&2; exit 2; }
slug=$(lg_slug "$rel")
OUT="$WORK/pages"; mkdir -p "$OUT"
dir="$WORK/work/$(dirname "$rel")"; mkdir -p "$dir"; lg_link_assets "$WORK/work" "$ROOT"
for theme in light dark; do
  copy="$dir/page-$slug-$lang-$theme.html"
  lg_seed "$src" "$copy" "$lang" "$theme"
  out="$OUT/$slug-$lang-$theme-1440.png"
  "$CH" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --virtual-time-budget=4000 --window-size=1440,8000 --screenshot="$out" "file://$copy" >/dev/null 2>&1 || true
  [ -s "$out" ] || { echo "render failed: $out" >&2; exit 1; }
  printf '%s\n' "$out"
done
host="$dir/host-page-$slug-$lang.html"
printf '%s\n' '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#888"><iframe src="file://'"$dir/page-$slug-$lang-light.html"'" style="width:390px;height:14000px;border:0;display:block"></iframe></body>' > "$host"
out="$OUT/$slug-$lang-phone390.png"
"$CH" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --virtual-time-budget=4000 --window-size=600,14000 --screenshot="$out" "file://$host" >/dev/null 2>&1 || true
[ -s "$out" ] || { echo "render failed: $out" >&2; exit 1; }
printf '%s\n' "$out"
