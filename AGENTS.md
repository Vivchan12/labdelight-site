# AGENTS.md

Orientation for a coding agent in this repository. Read this file, [README.md](README.md), [HANDOVER.md](HANDOVER.md), and [CLAUDE.md](CLAUDE.md) before editing. `CLAUDE.md` is the short CMS note. If the two disagree, the code wins, and the disagreement should be fixed in the docs.

## What this is

Static agency site for labdelight.co. Hand-built HTML, CSS, and JavaScript. No framework and no npm dependencies. Node.js 20 or newer.

Page text lives in Sanity (project and dataset are the defaults in `scripts/pull-sanity.mjs`; Studio is <https://labdelight.sanity.studio>). This repo owns markup, styles, animation, video, and article figures.

Locales: `en`, `zh-HK` (Traditional, Hong Kong vocabulary), `zh-CN` (Simplified, Mainland vocabulary). Written separately. Never machine-converted.

The Venture Builder is a different repository, `Lab-Delight-v3`, on `venture.labdelight.co`. Deploy each site only to its own domain.

## Editing rules

- Design is owned by someone else. Leave the look, the copy, and the behaviour alone unless the task is specifically to change them.
- Publish nothing to Sanity, and change nothing about the live domain, without Viv's approval.
- Lasting wording changes go in Sanity, then `npm run build`. A git edit to `i18n/*.json` or `content/insights/**/*.md` is overwritten on the next build. The pull deletes an insight file that Sanity does not have.
- New homepage text needs a `data-i18n` key in `index.html` and the same key in all three `i18n/*.json` files before Sanity can fill it. Unknown Sanity keys are skipped.
- `zh-HK/`, `zh-CN/`, and `insights/` are generated. Edit the sources and rebuild.
- Form blocks that contain an `<input>` are edited in code. The pull skips them.
- `i18n/_translations.cjs` is not read by the build.
- Article figures (`{{figure:name}}`) are HTML in `content/insights/figures/`. Each locale that uses a figure needs its own file. The insight build fails if it is missing.
- Leave unpublished commercial details and internal programme information out of the site and out of documentation. If a fact might be internal, omit it.
- Do not invent deploy targets, environment values, owners, or history. Write "unknown, ask Viv" instead. This repo's git history starts on 4 November 2026.

## Commands

```bash
npm run serve        # python3 -m http.server 8899. Does not pull Sanity.
npm run check:cms    # print what Sanity would change. Writes nothing.
npm run build        # pull Sanity, then build-i18n, then build-insights. Writes files. Needs network.
```

`npm run build` is the Vercel build (`vercel.json`). As of 16 November 2026 it is not a zero-diff against the committed Chinese JSON: four strings differ by a non-breaking space. Details are in [HANDOVER.md](HANDOVER.md).

There is no test script and no GitHub Actions workflow.

## Deploy facts an agent should not guess past

Vercel hosts <https://www.labdelight.co> (`server: Vercel` on 16 November 2026). The apex redirects to `www`. The deployment that answered that day does not include commit `c482d62`. Why, and which Vercel project is connected: unknown, ask Viv.

`outputDirectory` is the repo root, so paths such as `/i18n/en.json` are publicly fetchable on the current production deploy.
