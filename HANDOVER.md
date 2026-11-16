# Handover

Status of the Lab Delight agency site as checked in this repository and against <https://www.labdelight.co> on 16 November 2026. Design is owned by someone else. This note is for a developer picking up the code.

Anything that could not be verified is marked **unknown, ask Viv**.

## What is in good shape

The site is a single marketing homepage plus an insights section, in three languages, with two extra English pages (privacy and the audit) and a 404.

No `TODO`, `FIXME`, or lorem-ipsum markers were found in the page markup. The homepage sections below all have real copy and working interaction in `script.js` (hero rotator, question explorer, scroll-linked sections, enquiry form, language menu). Chinese homepages are generated from that English page. The three published insights exist in all three languages.

The enquiry form and the audit both post to the same Formspree URL, hardcoded in `script.js` and `audit.html`. The privacy statement names Formspree, Vercel, and Google Fonts as the processors. The public contact address on the site is `hello@labdelight.co`.

## Pages

### Homepage — `/`, `/zh-HK`, `/zh-CN`

One long page. Header links: Perspective, How we help, Transformation, Insights, Start a conversation, and the language menu.

| Section | `id` | In the header |
|---|---|---|
| Hero (background video, rotating outcome line, pause control) | `top` | Brand link |
| Perspective | `perspective` | Perspective |
| Four lenses (business, people, workflow, technology) | `understanding` | |
| Before the build (eight-question explorer) | `before-build` | |
| How we help (four situation cards) | `how-we-help` | How we help |
| Prototype journey | `prototype` | |
| Transformation strategy | `strategy` | Transformation |
| Adoption | `adoption` | |
| Decision base | `decision-base` | |
| Enquiry form | `contact` | Start a conversation |

The four situation cards and the other diagrams in these sections are inline SVG in `index.html`, not image files. Offer labels, durations, and "you leave with" lines are ordinary translated strings in Sanity and `i18n/*.json`.

### Insights

Generated. Three articles, each in `en`, `zh-HK`, and `zh-CN`, plus an index and `rss.xml` per locale. Slugs:

- `digital-and-ai-transformation-are-not-the-same-job` (kicker Insight 01, date 2026-09-24)
- `when-building-is-free-discipline-is-the-only-cost-left` (Insight 02, 2026-09-24)
- `three-questions-before-you-implement-technology-or-ai` (Insight 03, 2026-10-07)

Insight 03 includes a `{{figure:three-questions}}` carousel. The figure HTML is in `content/insights/figures/` and in `figures/zh-HK/` and `figures/zh-CN/`. A missing locale figure fails the insight build. The cards use `assets/hero-poster.jpg` as a CSS background.

`dist/three-questions-carousel.pdf` is a LinkedIn-sized export of the English figure. It is in git and excluded from the Vercel upload by `.vercelignore`.

### Privacy — `/privacy`

English only. `build-insights.mjs` comments that a locale path such as `/zh-HK/privacy` 404s, so every footer links to `/privacy`. The page says it was last updated 8 October 2026. It states that the site sets no cookies and runs no analytics. An HTML comment above that section says to update it before enabling GA4 or any other tracking.

The canonical in `privacy.html` is `https://www.labdelight.co/privacy.html`. With `cleanUrls`, a request to `/privacy.html` on the live site returned `308` to `/privacy` (checked 16 November 2026). The homepage footer uses `/privacy.html`. Insight footers use `/privacy`.

### AI Preparation Audit — `/audit`

English only. A nine-statement self-check with an on-page result. Its CSS and script are inside `audit.html`, which says the shared stylesheet and `script.js` are left untouched. The result is shown even if the Formspree request fails. The page links to Insight 03 and to `/#contact`.

It is not in the homepage header and not in `sitemap.xml`. The privacy statement links to it. <https://www.labdelight.co/audit> returned `200` on 16 November 2026. Whether it is meant to stay unlisted: **unknown, ask Viv**.

### 404

`404.html`, English only, `noindex`. Missing URLs on the live host return this page.

## Locales

| Locale | Homepage | Insights | Privacy | Audit | 404 |
|---|---|---|---|---|---|
| `en` | `index.html` | `insights/` | yes | yes | yes |
| `zh-HK` | generated | generated, three posts | English page | not translated | not translated |
| `zh-CN` | generated | generated, three posts | English page | not translated | not translated |

`i18n/README.md` says the Chinese in the repo was drafted by Claude and has not had a native-speaker review. Whether a review is still wanted: **unknown, ask Viv**.

`i18n/_translations.cjs` is an older side-by-side draft. No build script imports it, and its wording does not match the JSON files (for example the hero eyebrow). Editing it changes nothing on the site.

## Known issues

1. **Production is not the latest commit on `main`.** Commit `c482d62` (4 November 2026) adds the Sanity pull and `CLAUDE.md`, and changes `build-i18n.mjs` to strip an English `i18n-en` script before generating Chinese pages. On 16 November 2026 the live `build-i18n.mjs` still had the previous line (`let html = source`), and `/scripts/pull-sanity.mjs` and `/CLAUDE.md` returned the 404 page. The homepage `last-modified` header was 14 November 2026. Cause (project not connected to this repo, a failed build, a different production branch): **unknown, ask Viv**. The next deploy that does run `npm run build` from current `main` will start pulling Sanity, and will also apply item 2.

2. **The next build rewrites four Chinese strings.** `npm run check:cms` on 16 November 2026 reported a difference in `top.ai-transformation-design-strategy` and `top.leverage-ai-for` for both `zh-HK` and `zh-CN`. The repo has a non-breaking space (U+00A0) before "AI". Sanity has a normal space. English and the insight files matched. Whether the non-breaking space was deliberate, so the word stays with the characters before it: **unknown, ask Viv**.

3. **Source files are publicly reachable.** `outputDirectory` in `vercel.json` is the repo root. On 16 November 2026 these live URLs returned `200`: `/i18n/en.json`, `/content/insights/when-building-is-free-discipline-is-the-only-cost-left.md`, `/build-i18n.mjs`. `.vercelignore` does not exclude those paths. The content is the same copy as the HTML. There is still no need for the Markdown source and the full translation JSON to be downloadable.

4. **Language choice is stored and never read.** `script.js` writes `localStorage` key `ld-lang` when someone picks a language. Nothing in the repo reads that key, so a later visit does not switch language on its own.

5. **A few leftovers in `script.js`.** The scroll observer still looks for `#lensStage` and `#adoptionSystem`, which are not in `index.html`. The enquiry submit handler still bails out if the endpoint string starts with `REPLACE_`. The endpoint in the file does not, so that branch does not run.

6. **Sitemap dates for the non-insight pages are older than the privacy page.** `sitemap.xml` uses `2026-09-24` for `/`, `/zh-HK`, `/zh-CN`, and `/privacy`. The privacy page says it was last updated 8 October 2026. `build-insights.mjs` rewrites only the block between `<!-- insights -->` and `<!-- /insights -->`. `/audit` is absent.

7. **`lib/md.mjs` says the site has no `package.json`.** `package.json` exists. It lists scripts and `node >= 20`, and no dependencies. The insight renderer is still the small in-repo one, on purpose: the comment says a third-party parser would change the empty `installCommand` in `vercel.json`.

8. **The carousel PDF script is macOS-only.** `build-carousel-pdf.mjs` calls `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. It is not part of `npm run build`.

9. **No automated tests and no CI config** are in this repository. GitHub's issue list for `Vivchan12/labdelight-site` was empty on 16 November 2026.

## Open decisions

- Why production does not match `main`, and which Vercel project, team, and Git branch actually deploy the site. **Unknown, ask Viv.**
- Who holds the Vercel, Formspree, Sanity, and DNS logins. Studio URL in the repo: <https://labdelight.sanity.studio>. Write access and publishing need Viv's approval (`CLAUDE.md`). The other accounts: **unknown, ask Viv**.
- Whether `/audit` should be in the header and the sitemap.
- Whether the Chinese copy still needs a native-speaker review.
- Whether analytics will be turned on. The privacy page would need an update in the same change. The page currently says there is none.
- Whether a saved language should change the next visit.
- What "Website Story v8" in the previous README referred to. This repo's history starts with a baseline that was copied in as-is. Versions before that are not in git. **Unknown, ask Viv.**

## How to make a common change

### Edit copy that is already on the homepage or in an article

Change it in Sanity, then run `npm run build` (or let the deploy do that).

- Homepage and chrome strings are **Homepage section** documents. A block's `key` matches a `data-i18n` value such as `contact.where-could-ai-make-a`, with `en`, `zhHK`, and `zhCN` fields.
- Rotating hero lines and the question-explorer text live under `__js` in `i18n/*.json`. Form status lines live under `__msgs`. The pull writes those too, and injects an English `window.__I18N__` script into `index.html` only when that English set changed.
- Articles are **Insight article** documents, one per language, sharing `slug`.

`npm run check:cms` prints the diff and writes nothing.

A hand edit to `i18n/*.json` or `content/insights/**/*.md` is overwritten on the next build. An article file Sanity does not list is deleted.

Blocks whose inner HTML contains an `<input>` are skipped by the pull. Those labels (name, email, organisation, and their placeholders) are edited in `index.html` and in all three `i18n/*.json` files, including `__attrs` for placeholders and aria text. Then run `node build-i18n.mjs`.

### Add a sentence to the homepage

The pull will not invent a key.

1. Put the English sentence in `index.html` on an element with `data-i18n="section.some-key"`.
2. Add the same key to `i18n/en.json`, `i18n/zh-HK.json`, and `i18n/zh-CN.json`.
3. Add a text block with that key on the section document in Sanity.
4. Run `npm run build`. `build-i18n.mjs` exits non-zero if a Chinese value is missing, so the page does not ship the English sentence under a Chinese URL.

Attribute text (placeholders, some aria labels) uses `data-i18n-attr="placeholder:attr.placeholder.something"` and a matching entry in each file's `__attrs` object. See `i18n/README.md`.

### Add an insight

Create the Insight article in Sanity in each language that should list it. Same `slug` and `date` across languages. A locale with no document does not get the post. There is no fallback to English prose.

A figure is a line of its own in the Markdown body:

```
{{figure:name}}
```

The HTML for that name has to exist at `content/insights/figures/name.html`, and at `content/insights/figures/<locale>/name.html` for each translated post. Figures are code, not Sanity.

The Markdown renderer in `lib/md.mjs` covers headings, paragraphs, emphasis, links, lists, tables, blockquotes, and rules. It throws on anything else.

### Add a page that is not an article

There is no router. `privacy.html` and `audit.html` are the pattern: a hand-written file at the repo root. `cleanUrls` serves `privacy.html` at `/privacy`.

Also:

- Link it from wherever it should be found.
- Add a `<url>` to `sitemap.xml` above the `<!-- insights -->` marker if it should be indexed. The insight build will not add it for you.
- If the page loads `styles.css` or `script.js`, add its filename to the list in `build-i18n.mjs` (`audit.html`, `privacy.html`, `404.html`) so the `?v=` hash stays current.
- Translation is not automatic. A new page stays English until someone builds locale copies. The generated Chinese homepages are a different pipeline.

### Swap an image

Keep the filename and replace the file. Live image responses on 16 November 2026 used `cache-control: public, max-age=0, must-revalidate`.

| File | Used for |
|---|---|
| `assets/logo.png` | Header mark, favicon, apple touch icon |
| `assets/og-image.png` | Open Graph and Twitter image. `index.html` declares 1200×630. `build-insights.mjs` points every article at this URL |
| `assets/hero-poster.jpg` | Hero video poster, and the insight-carousel card background in `styles.css` |
| `assets/hero-transformation-loop.mp4` | Hero background video (`muted`, `loop`, `playsinline`) |

The situation-card drawings are inline SVG in `index.html`. Changing those is a markup edit, then `node build-i18n.mjs` so the Chinese pages pick up the same SVG.

`styles.css` and `script.js` are cache-busted with a short hash query. `build-i18n.mjs` and `build-insights.mjs` rewrite that hash. Image URLs are not hashed. Replacing the file at the same path is the way the templates already refer to them.
