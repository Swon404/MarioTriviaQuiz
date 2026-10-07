import { expect, test } from '@playwright/test';
import { ICON_PAIRS } from '../src/mario/pairCatalog.ts';

test('Shroomer welcomes players on the home page on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const portrait = page.getByAltText('Shroomer, your friendly mushroom companion');
  await expect(portrait).toBeVisible();
  expect(await portrait.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.shroomer-home-speech')).toContainText('Hi, I’m Shroomer!');
  await expect(page.getByRole('button', { name: 'Read welcome aloud' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/shroomer-home-phone.png', fullPage: true });
  await page.getByRole('button', { name: 'Play Games' }).click();
  await expect(page.getByRole('button', { name: 'Play Shroomer' })).toBeVisible();
});

test('Shroomer is a spotted mushroom and all matching web images load', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await expect(page.getByRole('button', { name: 'Play Shroomer' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play Shroomer' })).not.toContainText('robot');
  await expect(page.getByAltText('Shroomer')).toHaveAttribute('src', /shroomer\.svg$/);
  for (const pair of ICON_PAIRS.filter(pair => pair.iconKind === 'image')) {
    const response = await page.request.get(`/MarioTriviaQuiz/${pair.icon}`);
    expect(response.ok(), pair.name).toBe(true);
    expect(response.headers()['content-type']).toMatch(/^image\//);
  }
  await page.screenshot({ path: 'test-results/shroomer-hub.png', fullPage: true });
  // Contact sheet for visual QA, not an extra production screen.
  await page.evaluate(pairs => {
    document.body.replaceChildren();
    document.body.style.cssText = 'margin:0;padding:20px;background:#49334f;color:white;display:grid;grid-template-columns:repeat(6,1fr);gap:12px;font:16px Arial';
    for (const pair of pairs) {
      const tile = document.createElement('div');
      tile.style.cssText = 'background:#285849;border-radius:12px;padding:12px;text-align:center';
      const img = document.createElement('img');
      img.src = `/MarioTriviaQuiz/${pair.icon}`;
      img.style.cssText = 'display:block;width:96px;height:96px;object-fit:contain;margin:auto';
      tile.append(img, document.createTextNode(pair.name));
      document.body.append(tile);
    }
  }, ICON_PAIRS.filter(pair => pair.iconKind === 'image'));
  await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
  await page.screenshot({ path: 'test-results/matching-icons-review.png', fullPage: true });
});

test('private Time Trial shows Shroomer flips, cancels on restart and resumes after reload', async ({ page }) => {
  test.setTimeout(60000);
  await page.clock.install();
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await page.getByRole('button', { name: 'Play Shroomer', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Legend', exact: false }).click();
  await page.getByRole('group', { name: 'Matching mode' }).getByRole('button', { name: 'Time Trial' }).click();
  await expect(page.getByRole('button', { name: 'Separate timed turns' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('group', { name: 'Matches to find' }).getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await page.clock.runFor(3000);
  await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
  const ids = await page.locator('.pair-card[data-kind="word"]').evaluateAll(cards => cards.slice(0, 3).map(card => card.getAttribute('data-pair-id')));
  for (const id of ids) {
    await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="icon"]`).click();
    await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="word"]`).click();
  }
  await page.getByRole('button', { name: 'Next turn' }).click();
  await page.getByRole('button', { name: "Start Shroomer's turn" }).click();
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await page.clock.runFor(3000);
  await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
  await page.clock.runFor(500);
  await expect(page.locator('.pair-card-face')).toHaveCount(1);
  await page.getByRole('button', { name: 'Restart go', exact: false }).click();
  await page.clock.runFor(5000);
  await expect(page.locator('.pair-card')).toHaveCount(0);
  await expect(page.locator('.feedback')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await page.clock.runFor(3000);
  await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
  await page.clock.runFor(500);
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  await expect(page.locator('.versus-now-playing')).toContainText("Shroomer's turn");
  for (let step = 0; step < 180 && await page.locator('.feedback').count() === 0; step++) await page.clock.runFor(2500);
  await expect(page.getByText('Shroomer’s time:', { exact: false })).toBeVisible();
  await expect(page.locator('.pair-card-found')).toHaveCount(6);
  await page.getByRole('button', { name: 'Next turn' }).click();
  await page.clock.runFor(10000);
  await expect(page.getByRole('heading', { name: "Ada's turn", exact: true })).toBeVisible();
  await expect(page.locator('.pair-card')).toHaveCount(0);
  const scores = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_pair_times_v1')!));
  expect(scores).toHaveLength(1);
  expect(scores[0].player).toBe('Ada');
});
