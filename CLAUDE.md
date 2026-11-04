# labdelight.co — agency website

Static site (hand-built HTML/CSS/JS). Words come from Sanity; design lives here.

## Where things live

| What | Where | Who edits |
|---|---|---|
| All page text, 3 languages | Sanity → **Homepage section** documents | Viv in Studio, or an agent via the Sanity MCP |
| Insight articles | Sanity → **Insight article** documents (one per language, same slug) | Viv or agent |
| Layout, styles, animation, video | `index.html`, `styles.css`, `script.js`, `assets/` | code only |
| Article figures (`{{figure:name}}`) | `content/insights/figures/` | code only |

- Sanity project `5f2xc0wb`, dataset `production` (public read, published docs only).
- Studio: https://labdelight.sanity.studio
- Locales: `en`, `zh-HK` (Traditional, Hong Kong vocabulary), `zh-CN` (Simplified, Mainland vocabulary). Written separately, never auto-converted.

## Build

```
npm run build        # pull from Sanity, then build-i18n + build-insights
npm run check:cms    # show what Sanity would change, write nothing
```

`scripts/pull-sanity.mjs` writes Sanity text into `i18n/*.json`, `index.html`
(English, changed blocks only) and `content/insights/**.md`. Safety rules:
unknown keys are skipped, empty CMS fields keep the repo text, and the build
stops if Sanity returns nothing.

**The files in `i18n/` and `content/insights/` are build inputs, overwritten
from Sanity on every deploy.** To change words, change them in Sanity. Editing
them in git only lasts until the next deploy.

## Adding new text to the page

1. Add the element to `index.html` with `data-i18n="section.some-key"`.
2. Add the key to all three `i18n/*.json` files.
3. Add a matching text block to that section's document in Sanity
   (`key` = `section.some-key`, plus `en`, `zhHK`, `zhCN`).

## Rules

- Do not publish to Sanity or change the live domain without Viv's approval.
- Do not edit `zh-CN/` or `zh-HK/` HTML by hand — they are generated.
- Text blocks with `<input>` (form labels) are edited in code, not Sanity.
- This repo is the agency site only. The Venture Builder is a different repo
  (`Lab-Delight-v3`) on `venture.labdelight.co`; never deploy one to the other's domain.
