# Brand assets

Current baseline: **GOLD HIGHLIGHTS ONLY** final vectors (2026-10-31), from `tmp/learning-garden-final-vectors-2026-10-31/` (untracked). Copied byte-identical:

- `learning-garden-logo-transparent.svg` — complete logo (tree, thick ring, Fraunces lettering), no background; for dark or haloed surfaces
- `learning-garden-logo-navy.svg` — the same on the fixed navy `#203044`

Derived here for the site (never replacements for the two files above):

- `symbol.svg` — the transparent logo with the two lettering groups removed (tree + ring only)
- `favicon.svg` — the symbol over a radial navy halo (no hard disc) with a slightly heavier ring, for 16–32 px

Halo treatment (`.logo-halo` for the full logo and `.mark` for the header symbol, in `assets/style.css`): the transparent logo sits on a separate radial-gradient layer — strongest at the centre, fading to fully transparent with no visible edge, tinted from the brand navy toward the current surface so it follows the light/dark theme; the fade extends well beyond the ring so the outer lettering stays readable.

Identity text: **Learning Garden** · **Deep Roots. Fresh Ideas.** · logo font Fraunces (OFL, `fonts/`), used for the brand wordmark only. Canonical copy: `tmp/learning-garden-selected-a-2026-10-31/BRAND-COPY.md`.
