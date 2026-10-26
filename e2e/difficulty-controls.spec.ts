import { expect, test } from '@playwright/test';

test('matching exposes only useful human controls and explains Shroomer memory', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await page.locator('.setup-settings > summary').click();
  for (const format of ['Solo', 'Two Players']) {
    await page.getByRole('button', { name: format, exact: true }).click();
    await expect(page.getByRole('group', { name: 'Difficulty', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Rookie|Pro|Legend/ })).toHaveCount(0);
    await expect(page.getByLabel('Selected settings')).not.toContainText('Rookie');
    await expect(page.getByRole('group', { name: 'Board pairs' })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Play Shroomer', exact: true }).click();
  const memory = page.getByRole('group', { name: 'Shroomer memory' });
  await expect(memory).toBeVisible();
  await memory.getByRole('button', { name: /Legend/ }).click();
  await expect(page.locator('.setup-settings > .selected-setting-help')).toContainText('remembers 40 revealed cards');
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await expect(memory).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await expect(page.getByLabel('Selected settings')).not.toContainText('Legend');
});

test('each other game describes its actual level changes', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  for (const [game, rookie, legend] of [
    ['Quiz Battle', '4 attempts per question', '1 attempt per question'],
    ['Game Order', '4 selected tiles · 3 rounds', '8 selected tiles · 5 rounds'],
    ['Clue Match Up', '4 clue pairs · up to 4 wrong matches', '8 clue pairs · up to 1 wrong match'],
    ['Clue Duel', '4 answer choices', '8 answer choices'],
    ['Track Finder', '4 track tiles · 3 rounds', '9 track tiles · 5 rounds'],
    ['Category Finder', '9 tiles · broad groups', '9 tiles · character abilities'],
  ]) {
    await page.getByRole('button', { name: game }).click();
    await page.locator('.setup-settings > summary').click();
    const levels = page.getByRole('group', { name: 'Difficulty', exact: true });
    await levels.getByRole('button', { name: /Rookie/ }).click();
    await expect(page.locator('.setup-settings > .selected-setting-help')).toContainText(rookie);
    await levels.getByRole('button', { name: /Legend/ }).click();
    await expect(page.locator('.setup-settings > .selected-setting-help')).toContainText(legend);
    await page.getByRole('button', { name: 'Back to games', exact: false }).click();
  }
});

for (const width of [390, 800]) {
  test(`matching puts a full third row of cards on screen at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Match & Hunt' }).click();
    await page.locator('.setup-settings > summary').click();
    await page.getByRole('button', { name: 'Two Players', exact: true }).click();
    await page.getByRole('group', { name: 'Matching mode' }).getByRole('button', { name: 'Time Trial' }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    await expect(page.locator('.pair-card')).toHaveCount(24);
    await expect(page.locator('.timer-countdown')).toBeHidden();
    await page.evaluate(() => scrollTo(0, 0));
    const first = await page.locator('.pair-card').first().boundingBox();
    const thirdRow = await page.locator('.pair-card').nth(11).boundingBox();
    expect(first!.y).toBeLessThan(330);
    expect(thirdRow!.y + thirdRow!.height).toBeLessThan(740);
    expect(first!.height).toBeGreaterThanOrEqual(80);
    const restart = await page.getByRole('button', { name: 'Restart go', exact: false }).boundingBox();
    expect(restart!.height).toBeGreaterThanOrEqual(44);
    await expect(page.getByRole('timer')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`compact-board-${width}.png`) });
  });
}
