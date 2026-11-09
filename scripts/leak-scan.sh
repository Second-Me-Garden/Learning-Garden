#!/bin/sh
# English-mode leak scan. Every prose element on a lesson is paired zh-CN / en and the language switch
# hides one twin; an element that was written in only one language leaks Chinese into English mode. For
# each page this script seeds the saved language to "en", renders it headless, and counts the Han
# characters in the VISIBLE text (body.innerText), which excludes the hidden twins. A zh-CN control render
# must show a large count, proving the switch happened. Some Chinese is legitimate in English mode (the
# page's own Chinese title in the header, quoted Chinese terms), so the number that matters is the change
# against the branch you started from: run with --against main before a PR and every delta must be 0.
#
# Usage: sh scripts/leak-scan.sh [--against <git-ref>] <page>...
#   page  path relative to the repo root
# With --against, the same pages are scanned in a temporary detached worktree of that ref (its own assets),
# a table with the deltas is printed, and the exit status is 1 when any page has more visible Han in English
# mode than the baseline. Without it, the raw counts are printed. Work files go under .renders/leak/.
set -eu
. "$(dirname "$0")/lib/browser.sh"
against=""
if [ "${1:-}" = "--against" ]; then against=$2; shift 2; fi
[ $# -ge 1 ] || { sed -n '2,16p' "$0" >&2; exit 2; }
ROOT=$(lg_root); CH=$(lg_browser); WORK=$(lg_work)/leak; mkdir -p "$WORK"

count_han() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const m=s.match(/\p{Script=Han}/gu);console.log(m?m.length:0)})'; }

# scan <tree root> <work dir> <page rel> <lang>  -> prints "<han> <chars>"
scan() {
  troot=$1; twork=$2; rel=$3; lang=$4
  src="$troot/$rel"
  if [ ! -f "$src" ]; then printf 'missing 0\n'; return 0; fi
  dir="$twork/$(dirname "$rel")"; mkdir -p "$dir"; lg_link_assets "$twork" "$troot"
  copy="$dir/leak-$lang.html"
  lg_seed "$src" "$copy" "$lang" light -e "s#</body>#<script>setTimeout(function(){var t=document.body.innerText;var p=document.createElement('pre');p.id='lgtext';p.textContent='LGTEXT-BEGIN'+t+'LGTEXT-END';document.documentElement.appendChild(p);},800);</script></body>#"
  dom=$("$CH" --headless=new --disable-gpu --no-sandbox --virtual-time-budget=5000 --dump-dom "file://$copy" 2>/dev/null || true)
  text=$(printf '%s' "$dom" | awk '/LGTEXT-BEGIN/{f=1} f{print} /LGTEXT-END/{f=0}')
  han=$(printf '%s' "$text" | count_han)
  chars=$(printf '%s' "$text" | wc -m | tr -d ' ')
  printf '%s %s\n' "$han" "$chars"
}

if [ -z "$against" ]; then
  for rel in "$@"; do
    rel=${rel#"$ROOT"/}
    en=$(scan "$ROOT" "$WORK/branch" "$rel" en); zh=$(scan "$ROOT" "$WORK/branch" "$rel" zh-CN)
    printf '%-64s en: Han=%-6s chars=%-7s zh-CN control: Han=%s\n' "$rel" "${en% *}" "${en#* }" "${zh% *}"
  done
  exit 0
fi

base="$WORK/against-$(printf '%s' "$against" | tr -c 'A-Za-z0-9._-' '_')"
rm -rf "$base"
(cd "$ROOT" && git worktree prune && git worktree add --detach -q "$base" "$against")
trap '(cd "$ROOT" && git worktree remove --force "$base" >/dev/null 2>&1) || true' EXIT
bad=0
printf '%-64s %6s %6s %6s  %s\n' "page (English mode, visible Han characters)" "$against" "branch" "delta" "zh-CN control"
for rel in "$@"; do
  rel=${rel#"$ROOT"/}
  b=$(scan "$base" "$WORK/base" "$rel" en); b=${b% *}
  c=$(scan "$ROOT" "$WORK/branch" "$rel" en); c=${c% *}
  z=$(scan "$ROOT" "$WORK/branch" "$rel" zh-CN); z=${z% *}
  if [ "$b" = missing ]; then
    printf '%-64s %6s %6s %6s  %s\n' "$rel" "new" "$c" "-" "$z"
  else
    d=$((c - b)); flag=""; [ "$d" -gt 0 ] && { flag="  <-- more Han in English mode"; bad=$((bad + 1)); }
    printf '%-64s %6s %6s %6s  %s%s\n' "$rel" "$b" "$c" "$d" "$z" "$flag"
  fi
  [ "$z" != missing ] && [ "$z" -lt 200 ] && { echo "  warning: zh-CN control is small ($z) for $rel; did the switch run?" >&2; }
done
[ "$bad" -eq 0 ] && echo "leak scan: no page has more visible Han in English mode than $against" || echo "leak scan: $bad page(s) leak"
[ "$bad" -eq 0 ]
