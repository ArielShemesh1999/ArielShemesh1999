#!/usr/bin/env node
// Regenerates assets/stats-{dark,light}.svg from live GitHub data.
// No dependencies, no third-party README services — everything this profile
// renders is served from this repository.
//
//   node scripts/build-stats.mjs [username]

import { writeFile, mkdir } from 'node:fs/promises';
import { textRects, textWidth, GLYPH_H } from './pixel-font.mjs';

const USER = process.argv[2] || 'shear559';
const UA = { 'user-agent': 'shear559-profile-stats' };

// The ramp runs sky -> gold across the bar, over near-black. Every number and
// every spark bar samples the same gradient at its own x, so the three colours
// read as one sweep rather than as three separate accents.
const THEMES = {
  dark: {
    muted: '#8B949E', hair: 'rgba(240,243,246,0.10)',
    ramp: ['#8FDBF7', '#4FA9D8', '#D8B458', '#F7DC8A'],
    shadow: '#05070B',
  },
  light: {
    muted: '#57606A', hair: 'rgba(13,17,23,0.12)',
    ramp: ['#2E86B0', '#2D7FA8', '#9A7B22', '#6B520F'],
    shadow: '#C8CDD4',
  },
};

const nf = new Intl.NumberFormat('en-US');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function contributions(user) {
  const res = await fetch(`https://github.com/users/${user}/contributions`, { headers: UA });
  if (!res.ok) throw new Error(`contributions ${res.status}`);
  const html = await res.text();

  // Each day is a <td data-date="YYYY-MM-DD"> whose tooltip reads
  // "N contributions on <date>" (or "No contributions on <date>").
  const days = [];
  const cellRe = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="(contribution-day-component-[\d-]+)"/g;
  const tipRe = /for="(contribution-day-component-[\d-]+)"[^>]*>\s*(?:(\d+)|No)\s+contributions?/g;

  const byId = new Map();
  for (let m; (m = tipRe.exec(html)); ) byId.set(m[1], m[2] ? Number(m[2]) : 0);
  for (let m; (m = cellRe.exec(html)); ) days.push({ date: m[1], count: byId.get(m[2]) ?? 0 });

  if (!days.length) throw new Error('contribution calendar could not be parsed');
  days.sort((a, b) => a.date.localeCompare(b.date));

  const total = days.reduce((s, d) => s + d.count, 0);
  return { total, days };
}

async function account(user) {
  const headers = { ...UA, accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  // A rate-limited or errored call answers 403 with a JSON *object*. Reading
  // counts off that object yields 0, which is a number the rest of this
  // script is perfectly happy to render and commit — so every response is
  // checked before it is believed.
  const get = async (url, expect) => {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
    const body = await res.json();
    if (expect === 'array' && !Array.isArray(body)) throw new Error(`expected a list from ${url}`);
    return body;
  };

  const me = await get(`https://api.github.com/users/${user}`);
  if (typeof me.public_repos !== 'number') throw new Error('no public_repos in the user payload');

  let stars = 0;
  for (let page = 1; page <= 5; page++) {
    const batch = await get(
      `https://api.github.com/users/${user}/repos?per_page=100&type=owner&page=${page}`, 'array',
    );
    if (!batch.length) break;
    stars += batch.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    if (batch.length < 100) break;
  }
  return { repos: me.public_repos, stars };
}

function sparkline(days, x, y, w, h, scale) {
  const last = days.slice(-30);
  const peak = Math.max(1, ...last.map(d => d.count));
  const cell = scale * 3;                       // one spark pixel
  const gap = scale;
  const cols = last.length;
  const colW = (w - gap * (cols - 1)) / cols;
  const rowsMax = Math.max(1, Math.round(h / cell));

  return last.map((d, i) => {
    const rows = d.count ? Math.max(1, Math.round((d.count / peak) * rowsMax)) : 0;
    const bx = x + i * (colW + gap);
    if (!rows) {
      // an empty day is one dim pixel on the baseline, so the row still reads
      return `<rect x="${bx.toFixed(1)}" y="${y + h - cell}" width="${colW.toFixed(1)}" height="${cell}" fill="url(#spark)" opacity="0.22"/>`;
    }
    return Array.from({ length: rows }, (_, r) =>
      `<rect x="${bx.toFixed(1)}" y="${y + h - (r + 1) * cell}" width="${colW.toFixed(1)}" height="${cell - 1}" fill="url(#spark)"/>`,
    ).join('');
  }).join('');
}

function svg(stats, theme) {
  const t = THEMES[theme];
  const W = 1200, H = 124;
  const NUM = 6;                 // pixels per glyph pixel, big numbers
  const LBL = 2;                 // ... and labels
  const COL = [2, 372, 660];

  const tiles = [
    { value: nf.format(stats.total), lines: ['CONTRIBUTIONS', 'LAST 12 MONTHS'] },
    { value: nf.format(stats.repos), lines: ['PUBLIC', 'REPOSITORIES'] },
    { value: nf.format(stats.stars), lines: ['STARS', 'EARNED'] },
  ];

  const numY = 8, numH = GLYPH_H * NUM;
  const lblY = numY + numH + 14;
  const lineH = GLYPH_H * LBL + 6;

  const body = tiles.map((tile, i) => {
    const x = COL[i];
    const divider = i > 0
      ? `<rect x="${x - 46}" y="${numY + 4}" width="${LBL}" height="${numH + lineH + 4}" fill="${t.hair}"/>`
      : '';
    return divider
      // a one-pixel drop shadow, offset like a sprite, keeps the digits legible
      // on either canvas without a second accent colour
      + textRects(tile.value, x + LBL, numY + LBL, NUM, t.shadow, { opacity: theme === 'dark' ? 0.9 : 0.35 })
      + textRects(tile.value, x, numY, NUM, 'url(#ramp)')
      + tile.lines.map((line, n) => textRects(line, x, lblY + n * lineH, LBL, t.muted)).join('');
  }).join('');

  const sparkW = 246, sparkX = W - sparkW, sparkH = 54;
  const sparkLabel = 'LAST 30 DAYS';
  const spark =
    textRects(sparkLabel, W - textWidth(sparkLabel, LBL), numY + 2, LBL, t.muted)
    + sparkline(stats.days, sparkX, numY + 22, sparkW, sparkH, LBL);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" shape-rendering="crispEdges" aria-label="${nf.format(stats.total)} contributions in the last 12 months, ${stats.repos} public repositories, ${stats.stars} stars earned">
  <defs>
    <linearGradient id="ramp" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
      <stop offset="0"    stop-color="${t.ramp[0]}"/>
      <stop offset="0.16" stop-color="${t.ramp[0]}"/>
      <stop offset="0.29" stop-color="${t.ramp[1]}"/>
      <stop offset="0.38" stop-color="${t.ramp[1]}"/>
      <stop offset="0.54" stop-color="${t.ramp[2]}"/>
      <stop offset="1"    stop-color="${t.ramp[3]}"/>
    </linearGradient>
    <linearGradient id="spark" gradientUnits="userSpaceOnUse" x1="${W - 246}" y1="0" x2="${W}" y2="0">
      <stop offset="0"    stop-color="${t.ramp[0]}"/>
      <stop offset="0.45" stop-color="${t.ramp[1]}"/>
      <stop offset="0.8"  stop-color="${t.ramp[2]}"/>
      <stop offset="1"    stop-color="${t.ramp[3]}"/>
    </linearGradient>
  </defs>
${body}
${spark}
</svg>
`;
}

const [contrib, acct] = await Promise.all([contributions(USER), account(USER)]);
const stats = { total: contrib.total, days: contrib.days, repos: acct.repos, stars: acct.stars };

await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
for (const theme of Object.keys(THEMES)) {
  await writeFile(new URL(`../assets/stats-${theme}.svg`, import.meta.url), svg(stats, theme));
}
console.log(`stats: ${stats.total} contributions · ${stats.repos} public repos · ${stats.stars} stars`);
