#!/usr/bin/env node
// Regenerates assets/stats-{dark,light}.svg from live GitHub data.
// No dependencies, no third-party README services — everything this profile
// renders is served from this repository.
//
//   node scripts/build-stats.mjs [username]

import { writeFile, mkdir } from 'node:fs/promises';

const USER = process.argv[2] || 'ArielShemesh1999';
const UA = { 'user-agent': 'ArielShemesh1999-profile-stats' };

const THEMES = {
  dark:  { ink: '#F0F3F6', muted: '#8B949E', accent: '#C9A84C', hair: 'rgba(240,243,246,0.10)', spark: '#C9A84C' },
  light: { ink: '#0D1117', muted: '#57606A', accent: '#8A6D1F', hair: 'rgba(13,17,23,0.10)',    spark: '#8A6D1F' },
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

function sparkline(days, { spark }, x, y, w, h) {
  const last = days.slice(-30);
  const peak = Math.max(1, ...last.map(d => d.count));
  const gap = 3;
  const bw = (w - gap * (last.length - 1)) / last.length;
  return last.map((d, i) => {
    const bh = Math.max(2, Math.round((d.count / peak) * h));
    const bx = (x + i * (bw + gap)).toFixed(1);
    const by = (y + h - bh).toFixed(1);
    const o = d.count ? 0.95 : 0.18;
    return `<rect x="${bx}" y="${by}" width="${bw.toFixed(1)}" height="${bh}" rx="1.5" fill="${spark}" opacity="${o}"/>`;
  }).join('');
}

function svg(stats, theme) {
  const t = THEMES[theme];
  const W = 1200, H = 136;
  const font = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

  const tiles = [
    { value: nf.format(stats.total), label: 'contributions · last 12 months' },
    { value: nf.format(stats.repos), label: 'public repositories' },
    { value: nf.format(stats.stars), label: 'stars earned' },
  ];

  const COL = [2, 330, 570];
  const body = tiles.map((tile, i) => {
    const x = COL[i];
    const divider = i > 0
      ? `<rect x="${x - 44}" y="32" width="1" height="62" fill="${t.hair}"/>`
      : '';
    return `${divider}
    <text x="${x}" y="68" font-family="${font}" font-size="42" font-weight="600" letter-spacing="-1" fill="${t.accent}">${esc(tile.value)}</text>
    <text x="${x}" y="95" font-family="${font}" font-size="11.5" font-weight="500" letter-spacing="1.6" fill="${t.muted}">${esc(tile.label.toUpperCase())}</text>`;
  }).join('\n');

  const sparkX = 966, sparkW = 232, sparkH = 36;
  const spark = `
    <text x="${sparkX}" y="44" font-family="${font}" font-size="11.5" font-weight="500" letter-spacing="1.6" fill="${t.muted}">LAST 30 DAYS</text>
    ${sparkline(stats.days, t, sparkX, 54, sparkW, sparkH)}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${nf.format(stats.total)} contributions in the last 12 months, ${stats.repos} public repositories, ${stats.stars} stars earned">
  <rect width="${W}" height="${H}" fill="none"/>
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
