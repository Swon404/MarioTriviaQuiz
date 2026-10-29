import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { chromium, expect } from '@playwright/test';

// Exercise the actual production worker, including a second tab and an offline
// navigation. A changed worker comment models a newly published SW byte version.
const root = resolve('dist');
let revision = 1;
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith('/MarioTriviaQuiz/')) { res.writeHead(404).end(); return; }
    const relative = pathname.slice('/MarioTriviaQuiz/'.length) || 'index.html';
    const path = resolve(root, relative);
    if (!path.startsWith(root + sep)) { res.writeHead(404).end(); return; }
    let body = await readFile(path);
    if (relative === 'sw.js') body = Buffer.from(`${body.toString()}\n// audit revision ${revision}\n`);
    res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/MarioTriviaQuiz/`;
const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  await context.addInitScript(() => { window.__auditDocument = Math.random(); });
  const active = await context.newPage();
  await active.goto(url);
  await active.evaluate(() => navigator.serviceWorker.ready);
  await active.reload();
  await expect.poll(() => active.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const manifest = await active.evaluate(async () => (await fetch('manifest.webmanifest')).json());
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512' && icon.purpose.includes('maskable')));
  for (const size of [180, 192, 512]) {
    const png = await active.evaluate(async size => [...new Uint8Array(await (await fetch(`icon-${size}.png`)).arrayBuffer()).slice(0, 8)], size);
    assert.deepEqual(png, [137, 80, 78, 71, 13, 10, 26, 10]);
  }
  await active.evaluate(() => localStorage.setItem('pwa-audit-keep', 'unchanged'));
  await active.getByRole('button', { name: 'Play Games' }).click();
  await active.getByRole('button', { name: 'Quiz Battle', exact: false }).click();
  await active.getByRole('button', { name: 'Start!', exact: true }).click();
  const prompt = await active.locator('.quiz-playing h1').innerText();
  const documentId = await active.evaluate(() => window.__auditDocument);
  revision++;
  await active.evaluate(async () => { const reg = await navigator.serviceWorker.getRegistration(); await reg.update(); });
  await expect.poll(() => active.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting)).toBe(true);
  await expect(active.getByRole('button', { name: 'Update now' })).toHaveCount(0);
  const other = await context.newPage();
  await other.goto(url);
  await expect(other.getByRole('button', { name: 'Update now' })).toBeVisible();
  const otherDocument = await other.evaluate(() => window.__auditDocument);
  await other.getByRole('button', { name: 'Update now' }).click();
  await expect.poll(async () => { try { return await other.evaluate(previous => window.__auditDocument !== previous, otherDocument); } catch { return false; } }).toBe(true);
  assert.equal(await active.evaluate(() => window.__auditDocument), documentId, 'Updating another tab must not reload active play');
  await expect(active.locator('.quiz-playing h1')).toHaveText(prompt);
  active.once('dialog', dialog => dialog.accept());
  await active.getByRole('button', { name: '← Games', exact: true }).click();
  await expect(active.getByRole('button', { name: 'Update now' })).toBeVisible();
  await active.getByRole('button', { name: 'Update now' }).click();
  await expect.poll(async () => { try { return await active.evaluate(previous => window.__auditDocument !== previous, documentId); } catch { return false; } }).toBe(true);
  await expect(active.getByRole('button', { name: 'Play Games' })).toBeVisible();
  await context.setOffline(true);
  await active.reload();
  await expect(active.getByRole('button', { name: 'Play Games' })).toBeVisible();
  assert.equal(await active.evaluate(() => localStorage.getItem('pwa-audit-keep')), 'unchanged');
  await active.getByRole('button', { name: 'Play Games' }).click();
  await active.getByRole('button', { name: 'Match & Hunt', exact: false }).click();
  await active.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(active.locator('.pair-card')).toHaveCount(24);
  console.log('Production PWA: real update waits during play, second-tab update preserves active board, icons load and offline Hunt starts with storage intact.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
