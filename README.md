# Lab Delight — agency website

The public site for [Lab Delight](https://www.labdelight.co/), a studio that helps organisations decide where digital and AI can make a lasting difference. This repository is that site only. The Venture Builder is a different repository (`Lab-Delight-v3`) on `venture.labdelight.co`. Deploy each one only to its own domain.

Words are edited in [Sanity](https://labdelight.sanity.studio). Layout, styles, animation, and video are edited in this repo. Publishing to Sanity, and any change to the live domain, needs Viv's approval.

If you are picking the project up, read [HANDOVER.md](HANDOVER.md) next. Agents should also read [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md).

## Tech stack

Hand-built static HTML, CSS, and JavaScript. There is no framework and no npm dependency.

| Piece | Where it lives |
|---|---|
| English homepage markup | `index.html` |
| Styles and interaction | `styles.css`, `script.js` |
| Chinese homepages | Generated into `zh-HK/` and `zh-CN/` by `build-i18n.mjs` |
| Insight articles | Markdown in `content/insights/`, generated into `insights/` and the locale folders by `build-insights.mjs` |
| Page text | Sanity project and dataset named in `scripts/pull-sanity.mjs`. Pulled into `i18n/*.json`, the English blocks in `index.html`, and `content/insights/**/*.md` |
| Enquiry form and the audit form | [Formspree](https://formspree.io). The URL is hardcoded in `script.js` and `audit.html`. It is not an environment variable |
| Smooth scroll | Vendored [Lenis 1.3.26](vendor/README.md) (MIT), served from this origin |
| Type | Poppins from Google Fonts, loaded in the page `<head>` |
| Hosting | Vercel. See [Deploy](#deploy) |

Locales are `en`, `zh-HK` (Traditional, Hong Kong vocabulary), and `zh-CN` (Simplified, Mainland vocabulary). They are written separately. Nothing in the build converts one Chinese into the other.

Node.js 20 or newer (`engines` in `package.json`). The repo has no `package-lock.json` because there is nothing to install.

## Install

```bash
git clone https://github.com/Vivchan12/labdelight-site.git
cd labdelight-site
```

`npm install` is optional. The build uses only Node's own modules.

## Run locally

Serve the folder over HTTP. Several assets use root-absolute paths (`/vendor/...`, `/assets/...`), so opening `index.html` as a file will miss them.

```bash
npm run serve
```

That runs `python3 -m http.server 8899`. Then open <http://localhost:8899/>.

Useful URLs on that server:

| URL | Page |
|---|---|
| `/` | English homepage |
| `/zh-HK/` | Traditional Chinese homepage |
| `/zh-CN/` | Simplified Chinese homepage |
| `/insights` | English insight index |
| `/audit` | AI Preparation Audit (English only) |
| `/privacy` | Privacy statement (English only) |

`npm run serve` shows the files already in the repo. It does not pull Sanity.

## Build

```bash
npm run build
```

That is what Vercel runs. In order:

1. `node scripts/pull-sanity.mjs` — published Sanity text into `i18n/*.json`, changed English blocks in `index.html`, and `content/insights/**/*.md`. Needs network access to `api.sanity.io`.
2. `node build-i18n.mjs` — rewrites `zh-HK/index.html` and `zh-CN/index.html` from `index.html` plus the JSON. Also restamps the stylesheet and script query on `index.html`, `audit.html`, `privacy.html`, and `404.html`.
3. `node build-insights.mjs` — rewrites the insight pages, each locale's `insights/rss.xml`, and the insight block inside `sitemap.xml`.

Safety rules in the pull, from `scripts/pull-sanity.mjs`:

- A Sanity text block overwrites a key only when that key already exists in the repo JSON and already holds a string. Unknown keys are reported and skipped.
- An empty Sanity field leaves the repo text in place.
- If Sanity returns no homepage sections, or no English insight, the build throws and stops.
- A form block whose markup contains `<input>` is left for the code to own.

`i18n/*.json` and `content/insights/**/*.md` are build inputs that the pull overwrites. A git edit to those files lasts until the next `npm run build`. An insight markdown file that Sanity does not have is deleted by the pull.

```bash
npm run check:cms
```

Runs the same pull with `--check` and writes nothing. On 16 November 2026 it reported four Chinese strings that differ from the repo. The repo uses a non-breaking space (U+00A0) before "AI"; Sanity has a normal space. The keys are `top.ai-transformation-design-strategy` and `top.leverage-ai-for` in both `zh-HK` and `zh-CN`. Running `npm run build` would write that difference and regenerate the two Chinese homepages. See [HANDOVER.md](HANDOVER.md).

`node build-carousel-pdf.mjs` is separate. It is not part of `npm run build`. It needs a local server and the macOS Google Chrome path hardcoded in that file, and it writes a PDF under `dist/`. `dist/` is listed in `.vercelignore`.

## Deploy

`vercel.json` is the deploy config in this repo:

- `framework` is `null` (static site).
- `installCommand` is empty.
- `buildCommand` is `npm run build`.
- `outputDirectory` is `.` (the repo root after the build).
- `cleanUrls` is true and `trailingSlash` is false, so `/privacy.html` is served as `/privacy`.
- Redirects, all temporary: `/zh` and `/cn` go to `/zh-CN`; `/hk` and `/zh-TW` go to `/zh-HK`.

There is no GitHub Actions workflow and no other deploy script in the repo.

Checked on 16 November 2026:

- <https://www.labdelight.co/> responded `200` with `server: Vercel`.
- <https://labdelight.co/> responded `308` to `https://www.labdelight.co/`.
- The four locale shortcuts above responded `307` to the destinations in `vercel.json`.
- The live `build-i18n.mjs` does not contain the Sanity-related edit from commit `c482d62`. Requests for `/scripts/pull-sanity.mjs` and `/CLAUDE.md` returned the site's 404 page. The homepage response included `last-modified: Sat, 14 Nov 2026 14:11:15 GMT`.

So the live site is on Vercel, and the deployment that answered those requests is not commit `c482d62` on `main`. Which Vercel project and team it is, which Git branch it builds, and why `main` is not what is live: unknown, ask Viv.

Because the output directory is the repo root, some source files are on the public host. On the same day, these returned `200`:

- `/i18n/en.json`
- `/content/insights/when-building-is-free-discipline-is-the-only-cost-left.md`
- `/build-i18n.mjs`

`.vercelignore` excludes `.env`, `.env.*`, `.vercel`, `.gitignore`, `README.md`, and `dist`. It does not exclude `i18n/`, `content/`, or the build scripts.

## Environment variables

Names only. None of these are required for a normal build or for `npm run serve`. No `.env` file is committed, and the Sanity pull uses the public read API with no token.

| Name | Used by | Role |
|---|---|---|
| `SANITY_PROJECT_ID` | `scripts/pull-sanity.mjs` | Optional override. The file has a default. |
| `SANITY_DATASET` | `scripts/pull-sanity.mjs` | Optional override. The file has a default. |
| `SANITY_MOCK` | `scripts/pull-sanity.mjs` | Optional. Path to a JSON file shaped like the query result, so the pull can run without the network. |
| `ORIGIN` | `build-carousel-pdf.mjs` | Optional. Page origin for the PDF print. The file defaults to `http://localhost:8899`. |

Whether the Vercel project has further variables set could not be read from here. Unknown, ask Viv.

## Folder structure

```
index.html                 English homepage. Source markup for the other locales.
styles.css                 All shared styles.
script.js                  Homepage and insight interaction, including the enquiry form.
audit.html                 AI Preparation Audit. Hand-written, English only, own script.
privacy.html               Privacy statement. Hand-written, English only.
404.html                   Not-found page. English only, noindex.
robots.txt                 Allows all crawlers. Points at the sitemap.
sitemap.xml                Homepage, locale homepages, and privacy are hand-written.
                           The insight URLs are rewritten by build-insights.mjs.
vercel.json                Vercel build and redirects.
package.json               Scripts only. No dependencies.

assets/                    logo.png, og-image.png (declared 1200×630),
                           hero-poster.jpg, hero-transformation-loop.mp4
vendor/                    Pinned Lenis files. See vendor/README.md.
i18n/                      en.json, zh-HK.json, zh-CN.json. Build inputs.
                           _translations.cjs is not read by the current build.
                           See i18n/README.md.
content/insights/          Article Markdown, plus figures/ HTML carousels.
                           Locale articles live in zh-HK/ and zh-CN/ under here.
insights/                  Generated English article pages and rss.xml.
zh-HK/  zh-CN/             Generated homepages, article pages, and rss.xml.
scripts/pull-sanity.mjs    Sanity → JSON, English markup, and article Markdown.
build-i18n.mjs             English homepage → Chinese homepages.
build-insights.mjs         Markdown → article pages, RSS, sitemap entries.
build-carousel-pdf.mjs     Optional LinkedIn PDF of a figure. Not in npm run build.
lib/md.mjs                 Small Markdown renderer used by the insight build.
lib/checkHtml.mjs          Tag-balance check for generated pages.
dist/                      PDF output. Gitignored from the Vercel upload.
```

`zh-HK/`, `zh-CN/`, and `insights/` are generated. The next build overwrites them. Edit `index.html`, the locale JSON, the Markdown, or the figure HTML, then rebuild.
