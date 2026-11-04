// Pulls the website's words from Sanity into the files the existing build reads.
//
//   node scripts/pull-sanity.mjs            pull, then the normal build runs
//   node scripts/pull-sanity.mjs --check    report differences only, write nothing
//
// Sanity is the source of truth for TEXT. This repo stays the source of truth
// for DESIGN and STRUCTURE (markup, styles, script, which keys exist).
//
//   Sanity "siteSection"  ->  i18n/en.json, i18n/zh-HK.json, i18n/zh-CN.json
//   Sanity "insight"      ->  content/insights[/<locale>]/<slug>.md
//
// Safety rules, so a CMS edit can never break the page:
//   - A text block only overwrites a key that already exists in the repo's
//     JSON and already holds a string. New keys need a code change (they need
//     markup to live in), so unknown keys are reported and skipped.
//   - An empty field in Sanity keeps the repo's text instead of blanking it.
//   - If Sanity returns no sections or no English articles, the build stops,
//     so a failed or empty fetch never deploys a blank site.
//
// Reads published content only, from a public dataset: no token needed.

import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync, existsSync } from 'fs';

const PROJECT = process.env.SANITY_PROJECT_ID || '5f2xc0wb';
const DATASET = process.env.SANITY_DATASET || 'production';
const API = '2025-02-19';
const CHECK = process.argv.includes('--check');
const MOCK = process.env.SANITY_MOCK; // path to a JSON file shaped like the query result (tests)

const LOCALES = { en: 'en', 'zh-HK': 'zhHK', 'zh-CN': 'zhCN' };
const DIR = 'content/insights';
const FM_ORDER = ['title', 'description', 'kicker', 'date', 'slug'];

const QUERY = `{
  "sections": *[_type == "siteSection" && !(_id in path("drafts.**"))]{ section, items[]{ key, en, zhHK, zhCN } },
  "insights": *[_type == "insight" && !(_id in path("drafts.**")) && defined(slug.current)]{
    language, title, description, kicker, date, "slug": slug.current, body
  }
}`;

async function fetchContent() {
  if (MOCK) return JSON.parse(readFileSync(MOCK, 'utf8'));
  const url = `https://${PROJECT}.api.sanity.io/v${API}/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}&perspective=published`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity responded ${res.status} ${res.statusText}`);
  return (await res.json()).result;
}

const pathOf = key => key.includes('/') ? key.split('/') : [key];

function getAt(obj, path) {
  let cur = obj;
  for (const p of path) { if (cur == null) return undefined; cur = cur[Array.isArray(cur) ? Number(p) : p]; }
  return cur;
}
function setAt(obj, path, value) {
  let cur = obj;
  for (const p of path.slice(0, -1)) cur = cur[Array.isArray(cur) ? Number(p) : p];
  const last = path[path.length - 1];
  cur[Array.isArray(cur) ? Number(last) : last] = value;
}

const oneLine = s => String(s ?? '').replace(/\s*\n\s*/g, ' ').trim();

function markdown(post) {
  const fm = FM_ORDER.filter(k => post[k]).map(k => `${k}: ${oneLine(post[k])}`).join('\n');
  const body = String(post.body ?? '').replace(/^\n+/, '');
  return `---\n${fm}\n---\n\n${body.endsWith('\n') ? body : body + '\n'}`;
}

const data = await fetchContent();
const sections = data.sections || [];
const insights = data.insights || [];
if (!sections.length) throw new Error('Sanity returned no homepage sections — stopping so a blank site is never deployed.');
if (!insights.some(p => p.language === 'en')) throw new Error('Sanity returned no English insight articles — stopping.');

// ---- Homepage and chrome text -------------------------------------------
const dicts = Object.fromEntries(Object.keys(LOCALES).map(l => [l, JSON.parse(readFileSync(`i18n/${l}.json`, 'utf8'))]));
const enRepo = structuredClone(dicts.en); // repo English, before Sanity edits
let changed = 0, unknown = [];
for (const s of sections) for (const item of s.items || []) {
  const path = pathOf(item.key);
  for (const [loc, field] of Object.entries(LOCALES)) {
    const now = getAt(dicts[loc], path);
    if (typeof now !== 'string') { if (loc === 'en') unknown.push(item.key); continue; }
    const next = item[field];
    if (typeof next !== 'string' || next.trim() === '') continue;   // empty in CMS: keep repo text
    if (next !== now) { changed++; if (CHECK) console.log(`  ${loc} ${item.key}\n    was: ${now}\n    now: ${next}`); setAt(dicts[loc], path, next); }
  }
}
console.log(`text blocks: ${changed} changed${unknown.length ? `, ${unknown.length} unknown key(s) skipped: ${unknown.join(', ')}` : ''}`);
if (!CHECK) for (const l of Object.keys(LOCALES)) writeFileSync(`i18n/${l}.json`, JSON.stringify(dicts[l], null, 2) + '\n');

// ---- English page -------------------------------------------------------
// index.html is the English source: its copy lives in the markup, and the
// Chinese pages are generated from it. So an English edit is written into the
// markup — but only for blocks whose text actually changed, so untouched
// markup is never rewritten.
let html = readFileSync('index.html', 'utf8');
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const reKey = k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let enApplied = 0;
for (const [key, value] of Object.entries(dicts.en)) {
  if (typeof value !== 'string' || key.startsWith('__') || value === enRepo[key]) continue;
  const re = new RegExp(`(<([a-z0-9]+)[^>]*?\\sdata-i18n="${reKey(key)}"[^>]*>)([\\s\\S]*?)(</\\2>)`);
  const m = html.match(re);
  if (!m) continue;
  if (/<input|data-i18n-attr/.test(m[3])) { console.log(`  skipped ${key}: contains a form field, edit it in code`); continue; }
  html = html.replace(re, (_, open, _t, _old, close) => open + value + close); enApplied++;
}
for (const [key, value] of Object.entries(dicts.en.__attrs || {})) {
  if (value === enRepo.__attrs?.[key]) continue;
  html = html.replace(new RegExp(`(data-i18n-attr="([a-z-]+):${reKey(key)}"\\s+\\2=")[^"]*(")`, 'g'), (_, a, _n, b) => a + esc(value) + b); enApplied++;
}
const meta = dicts.en.__meta || {}, metaRepo = enRepo.__meta || {};
const metaRules = [
  ['title', /<title>[\s\S]*?<\/title>/, v => `<title>${v}</title>`],
  ['description', /(<meta name="description" content=")[^"]*(")/],
  ['ogTitle', /(<meta property="og:title" content=")[^"]*(")/], ['ogTitle', /(<meta name="twitter:title" content=")[^"]*(")/],
  ['ogDescription', /(<meta property="og:description" content=")[^"]*(")/], ['ogDescription', /(<meta name="twitter:description" content=")[^"]*(")/],
  ['ogImageAlt', /(<meta property="og:image:alt" content=")[^"]*(")/],
];
for (const [k, re, fn] of metaRules) {
  if (!meta[k] || meta[k] === metaRepo[k]) continue;
  html = html.replace(re, fn ? fn(meta[k]) : (_, a, b) => a + esc(meta[k]) + b); enApplied++;
}
// Interactive text (rotating hero lines, question explorer, form messages):
// script.js reads window.__I18N__ and falls back to its built-in English.
// Inject the English set only when something in it changed.
const jsChanged = JSON.stringify(dicts.en.__js) !== JSON.stringify(enRepo.__js) || JSON.stringify(dicts.en.__msgs) !== JSON.stringify(enRepo.__msgs);
html = html.replace(/<script id="i18n-en">[\s\S]*?<\/script>\n\s*/, '');
if (jsChanged) {
  const payload = JSON.stringify({ ...dicts.en.__js, __msgs: dicts.en.__msgs }).replace(/</g, '\\u003c');
  html = html.replace(/(\s*)(<script src="script\.js[^"]*"><\/script>)/, `$1<script id="i18n-en">window.__I18N__=${payload};</script>$1$2`); enApplied++;
}
console.log(`english page: ${enApplied} update(s)`);
if (!CHECK) writeFileSync('index.html', html);

// ---- Insight articles ---------------------------------------------------
let postChanges = 0;
for (const loc of Object.keys(LOCALES)) {
  const dir = loc === 'en' ? DIR : `${DIR}/${loc}`;
  mkdirSync(dir, { recursive: true });
  const wanted = new Map(insights.filter(p => p.language === loc).map(p => [`${p.slug}.md`, markdown(p)]));
  const existing = readdirSync(dir).filter(f => f.endsWith('.md'));
  for (const f of existing) if (!wanted.has(f)) { postChanges++; console.log(`  remove ${dir}/${f}`); if (!CHECK) unlinkSync(`${dir}/${f}`); }
  for (const [f, md] of wanted) {
    const file = `${dir}/${f}`;
    const before = existsSync(file) ? readFileSync(file, 'utf8') : null;
    if (before === md) continue;
    postChanges++; console.log(`  ${before === null ? 'add' : 'update'} ${file}`);
    if (!CHECK) writeFileSync(file, md);
  }
}
console.log(`insight files: ${postChanges} changed`);
console.log(CHECK ? 'check only — nothing written' : 'pulled from Sanity');
