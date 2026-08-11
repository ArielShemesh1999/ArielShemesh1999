#!/usr/bin/env node
// Renders scripts/hero.html into assets/hero-{dark,light}.webp at 2x.
//
// The canvas is transparent on purpose: GitHub serves the profile on three
// different backgrounds (light #ffffff, dark #0d1117, dark dimmed #22272e)
// and a banner with a baked-in background shows its edges on two of them.
//
//   npx playwright@latest install chromium   # once
//   node scripts/build-hero.mjs

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('./hero.html', import.meta.url));
const OUT = fileURLToPath(new URL('../assets/', import.meta.url));
const WIDTH = 1200, HEIGHT = 340, SCALE = 2;

const browser = await chromium.launch();
for (const theme of ['dark', 'light']) {
  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
  });
  const page = await ctx.newPage();
  await page.goto('file://' + SRC);
  if (theme === 'light') await page.evaluate(() => document.documentElement.classList.add('light'));
  await page.waitForTimeout(500);

  const png = await page.screenshot({ omitBackground: true });
  const webp = await toWebp(page, png, 0.92);
  await ctx.close();

  const { writeFile } = await import('node:fs/promises');
  await writeFile(OUT + `hero-${theme}.webp`, webp);
  console.log(`hero-${theme}.webp  ${(webp.length / 1024).toFixed(0)} KB`);
}
await browser.close();

// Chromium already ships a WebP encoder — re-encode through a canvas rather
// than pulling in an image library for two files.
async function toWebp(page, pngBuffer, quality) {
  const dataUrl = await page.evaluate(async ({ b64, quality }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', quality);
  }, { b64: pngBuffer.toString('base64'), quality });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}
