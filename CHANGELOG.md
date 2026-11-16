# Changelog

This file is seeded from `git log` on `main`. The repository has two commits, both dated 4 November 2026. The first of them imported the site as it stood; work from before that import is not in this history. What the earlier "Story" versions were: unknown, ask Viv.

Commit subjects and bodies are quoted from git. Authors are whoever git recorded.

## 2026-11-04

### Connect site text and insights to Sanity CMS

`c482d62` — author recorded as Claude.

- `scripts/pull-sanity.mjs` pulls published Sanity content into `i18n/*.json`, `index.html` (English, changed blocks only), and `content/insights` at build time.
- `build-i18n.mjs` strips the English interactive-text payload from locale pages.
- `vercel.json` and `package.json`: the build runs the pull, then the existing generators. `package.json` requires Node 20 or newer.
- `CLAUDE.md` records where text lives and how agents should edit it.

The commit message says the round trip was checked and that pulling the migrated content changed zero bytes. A later check, on 16 November 2026, was not a zero-byte diff: four Chinese strings differ by a non-breaking space. See [HANDOVER.md](HANDOVER.md).

On 16 November 2026 the live site's `build-i18n.mjs` did not yet include this commit's edit. See [HANDOVER.md](HANDOVER.md).

### Baseline: current labdelight.co agency site (Story v8), copied as-is

`70ef338` — author recorded as Claude.

The whole site landed in one commit: homepage, Chinese pages, three insights in three languages, privacy, audit, 404, styles, script, assets, vendored Lenis, and the i18n and insight generators. `vercel.json` in that commit already set a Vercel build.

The README in that commit described the snapshot as "Lab Delight Website Story v8" and listed these updates, which are present in the current homepage:

- The hero outcome line is one text element, with a fade and a slight lift, instead of stacked phrases.
- The rotating phrase area keeps enough height for two lines.
- "Before the Build" is an interactive question explorer with eight questions.
- Choosing a question updates the large headline and shows a short explanation.
- Responsive layout and reduced-motion behaviour are kept.

That README told people to open `index.html` directly or to serve the folder with `python -m http.server 8899`. Root-absolute asset paths need the server. See [README.md](README.md).
