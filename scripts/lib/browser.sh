# Shared helpers for the headless-browser scripts in scripts/. Source it from a script in scripts/:
#   . "$(dirname "$0")/lib/browser.sh"
#
# lg_root      prints the repository root (the parent of scripts/).
# lg_browser   prints the path of a headless Chromium: $LG_BROWSER if set, else the first of the usual
#              macOS app binaries, Linux command names and Playwright or Puppeteer caches. Exit 2 when none.
# lg_work      prints the scratch directory <root>/.renders (gitignored) and creates it. Nothing is ever
#              written inside topics/ or assets/: page copies go under .renders/ next to an assets symlink,
#              so their relative ../../../assets/ links keep resolving.
# lg_seed SRC DST LANG THEME [sed -e ...]
#              copies a page with the saved language and theme seeded before assets/theme.js runs (the pages
#              read the localStorage keys lg-lang and lg-theme), applying any extra sed expressions after it.
# lg_slug REL  turns topics/<topic>/<page>/index.html into <topic>-<page> for output file names.
# lg_link_assets WORK ROOT
#              makes WORK/assets point at ROOT/assets (replacing a stale link).

lg_root() { cd "$(dirname "$0")/.." && pwd; }

lg_browser() {
  if [ -n "${LG_BROWSER:-}" ]; then
    if [ -x "$LG_BROWSER" ]; then printf '%s\n' "$LG_BROWSER"; return 0; fi
    echo "LG_BROWSER is set but not executable: $LG_BROWSER" >&2; return 2
  fi
  for p in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
    "$HOME/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
    if [ -x "$p" ]; then printf '%s\n' "$p"; return 0; fi
  done
  for c in google-chrome google-chrome-stable chromium chromium-browser chrome microsoft-edge; do
    if command -v "$c" >/dev/null 2>&1; then command -v "$c"; return 0; fi
  done
  for g in "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux/chrome \
           "$HOME"/.cache/ms-playwright/chromium-*/chrome-mac*/Chromium.app/Contents/MacOS/Chromium \
           "$HOME"/.cache/puppeteer/chrome/*/chrome-linux64/chrome; do
    if [ -x "$g" ]; then printf '%s\n' "$g"; return 0; fi
  done
  echo "No headless Chromium found. Install Google Chrome or chromium (Debian/Ubuntu: apt-get install chromium;" >&2
  echo "or: npx playwright install chromium), or set LG_BROWSER=/path/to/chrome." >&2
  return 2
}

lg_work() { d="$(lg_root)/.renders"; mkdir -p "$d"; printf '%s\n' "$d"; }

lg_seed() {
  _src=$1; _dst=$2; _lang=$3; _theme=$4; shift 4
  sed -e "s#<script src=\"\([./]*\)assets/theme.js\"></script>#<script>try{localStorage.setItem('lg-lang','$_lang');localStorage.setItem('lg-theme','$_theme')}catch(e){}</script><script src=\"\1assets/theme.js\"></script>#" "$@" "$_src" > "$_dst"
}

lg_slug() { printf '%s\n' "$1" | sed -e 's#^topics/##' -e 's#/index\.html$##' -e 's#^index\.html$#hub#' -e 's#/#-#g'; }

lg_link_assets() { rm -f "$1/assets"; ln -s "$2/assets" "$1/assets"; }
