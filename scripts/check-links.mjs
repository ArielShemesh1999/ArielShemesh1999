#!/usr/bin/env node
// Fails if the profile README points at something that is no longer there.
//
// Two ways this page can quietly break, neither of which shows up in a diff:
//   1. an asset is renamed or dropped and the card renders as a broken image
//   2. a product is taken down and "Live site ↗" leads nowhere
//
//   node scripts/check-links.mjs

import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const README = fileURLToPath(new URL('README.md', ROOT));
const OWN_RAW = 'https://raw.githubusercontent.com/ArielShemesh1999/ArielShemesh1999/';

// Hosts that answer automated requests with 403/999 no matter what. Their
// reachability says nothing about the link, so only the syntax is checked.
const NO_BOTS = ['linkedin.com'];

const readme = await readFile(README, 'utf8');
const urls = [...new Set([...readme.matchAll(/https?:\/\/[^\s"')]+/g)].map(m => m[0]))];

const failures = [];
const checks = urls.map(async url => {
  // Assets on main must exist in this checkout — a network 200 could just be
  // raw.githubusercontent still serving a deleted file from its cache.
  if (url.startsWith(OWN_RAW + 'main/')) {
    const rel = url.slice((OWN_RAW + 'main/').length).split('?')[0];
    try {
      await access(new URL(rel, ROOT));
      return ['file', 'ok', rel];
    } catch {
      failures.push(`missing asset: ${rel}`);
      return ['file', 'MISSING', rel];
    }
  }

  const host = new URL(url).hostname;
  if (NO_BOTS.some(h => host.endsWith(h))) return ['skip', '-', url];

  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'ArielShemesh1999-profile-linkcheck' },
      signal: AbortSignal.timeout(20_000),
    });
    if (res.status >= 400) {
      failures.push(`${res.status} ${url}`);
      return ['http', String(res.status), url];
    }
    return ['http', String(res.status), url];
  } catch (err) {
    failures.push(`unreachable ${url} — ${err.message}`);
    return ['http', 'ERR', url];
  }
});

for (const [kind, status, target] of await Promise.all(checks)) {
  console.log(`${kind.padEnd(5)} ${status.padEnd(8)} ${target}`);
}

console.log(`\n${urls.length} links checked, ${failures.length} broken`);
if (failures.length) {
  console.error('\n' + failures.map(f => '  ✗ ' + f).join('\n'));
  process.exit(1);
}
