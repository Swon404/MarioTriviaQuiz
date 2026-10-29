import { expect, test } from '@playwright/test';
import { ICON_PAIRS } from '../src/mario/pairCatalog.ts';

for (const pairs of [16, 20]) test(`${pairs}-pair phone board handles slow artwork, rapid matches and large text`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/match-icons/**', async route => { await hold; await route.continue(); });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt', exact: false }).click();
  await page.locator('.setup-settings > summary').click();
  await page.getByLabel('Player name', { exact: true }).fill('A very long player name');
  await page.getByRole('group', { name: 'Board pairs' }).getByRole('button', { name: `${pairs}`, exact: true }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const cards = page.locator('.pair-card');
  await expect(cards).toHaveCount(pairs * 2);
  expect(await page.locator('.pair-card-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(4);
  expect(await cards.evaluateAll(nodes => nodes.every(n => /^Hidden card \d+$/.test(n.getAttribute('aria-label')!)))).toBe(true);
  const availableIds = await page.locator('.pair-card[data-kind="icon"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-pair-id')));
  const imageId = ICON_PAIRS.find(pair => availableIds.includes(pair.id) && ['image', 'svg'].includes(pair.iconKind))!.id;
  const icon = page.locator(`.pair-card[data-kind="icon"][data-pair-id="${imageId}"]`);
  const id = await icon.getAttribute('data-pair-id');
  const word = page.locator(`.pair-card[data-kind="word"][data-pair-id="${id}"]`);
  await icon.focus();
  await page.keyboard.press('Enter');
  const fallback = icon.locator('.pair-card-word');
  await expect(fallback).toBeVisible();
  const name = await fallback.innerText();
  expect(name.length).toBeGreaterThan(0);
  release();
  await expect(icon.locator('img')).toBeVisible();
  expect(await icon.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(fallback).toHaveCount(0);
  await word.click({ clickCount: 3, delay: 20 });
  await expect(page.locator('.pair-card-found')).toHaveCount(2);
  await expect(page.locator('.score-display')).toContainText('1 point');
  await expect(word).toHaveAccessibleName(`Word: ${name}`);
  expect(await icon.evaluate(node => getComputedStyle(node).transitionDuration)).toBe('0s');
  await page.evaluate(() => { document.documentElement.style.fontSize = '24px'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const sizes = await cards.evaluateAll(nodes => nodes.map(n => ({ width: n.getBoundingClientRect().width, height: n.getBoundingClientRect().height })));
  expect(sizes.every(size => size.width >= 120 && size.height >= 120)).toBe(true);
  expect(await page.locator('.pair-card-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
  // Check every catalogue label at the enlarged font, not just this random board.
  const overflowing = await word.evaluate((node, names) => {
    const label = node.querySelector('.pair-card-word')!;
    const original = label.textContent;
    (node as HTMLElement).style.overflowWrap = 'normal';
    const bad = names.filter(name => {
      label.textContent = name;
      return node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight;
    });
    label.textContent = original;
    (node as HTMLElement).style.overflowWrap = '';
    return bad;
  }, ICON_PAIRS.map(pair => pair.name));
  expect(overflowing).toEqual([]);
  await page.screenshot({ path: test.info().outputPath(`hunt-${pairs}-large-text.png`), fullPage: true });
});

test('failed artwork becomes a readable name only after the card is revealed', async ({ page }) => {
  await page.route('**/match-icons/**', route => route.abort());
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt', exact: false }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const availableIds = await page.locator('.pair-card[data-kind="icon"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-pair-id')));
  const imageId = ICON_PAIRS.find(pair => availableIds.includes(pair.id) && ['image', 'svg'].includes(pair.iconKind))!.id;
  const icon = page.locator(`.pair-card[data-kind="icon"][data-pair-id="${imageId}"]`);
  await expect(icon).toHaveAccessibleName(/^Hidden card/);
  await expect(icon.locator('.pair-card-word')).toHaveCount(0);
  await icon.click();
  await expect(icon.locator('.pair-card-word')).toBeVisible();
  await expect(icon.locator('img')).toHaveCount(0);
  await expect(page.locator('.pair-card-back').first()).toHaveAccessibleName(/^Hidden card/);
});
