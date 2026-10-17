import { expect, test } from '@playwright/test';
import { createRounds, isCorrect } from '../src/mario/rounds.ts';
import { CATEGORY_CHALLENGES, CATEGORY_ITEMS, fitsCategory } from '../src/mario/categoryCatalog.ts';

for (const difficulty of ['scientist', 'professor'] as const) {
  test(`Category Finder ${difficulty} uses knowledge, plausible alternatives and distinct player turns`, () => {
    const seen = new Set<string>();
    for (let run = 0; run < 50; run++) {
      const rounds = createRounds('category-finder', 'mixed', difficulty, Math.random, undefined, 6);
      expect(new Set(rounds.map(round => round.id)).size).toBe(6);
      for (const round of rounds) {
        if (round.mode !== 'category-finder') throw new Error('Wrong mode');
        const task = CATEGORY_CHALLENGES[round.targetCategory]!;
        seen.add(round.targetCategory);
        expect(task.levels).toContain(difficulty);
        expect(round.tiles).toHaveLength(9);
        expect(round.tiles.filter(tile => fitsCategory(tile, round.targetCategory)).length).toBeLessThanOrEqual(3);
        expect(round.tiles.every(tile => task.pool === 'character' ? ['friend', 'baddie'].includes(tile.category) : tile.category === task.pool)).toBe(true);
        expect(round.sourceUrl).toBe(task.sourceUrl);
        for (const tile of round.tiles) expect(isCorrect(round, tile.id)).toBe(fitsCategory(tile, round.targetCategory));
      }
    }
    expect([...seen].sort()).toEqual(Object.entries(CATEGORY_CHALLENGES).filter(([, task]) => task!.levels.includes(difficulty)).map(([key]) => key).sort());
  });
}

test('New relationships distinguish powers, start characters and first releases', () => {
  const fits = (name: string, category: string) => fitsCategory(CATEGORY_ITEMS.find(item => item.name === name)!, category);
  expect(fits('Fire Flower', 'wonder-power')).toBe(false);
  expect(fits('Bubble Flower', 'wonder-power')).toBe(true);
  expect(fits('Super Bell', '3d-power')).toBe(true);
  expect(fits('Rosalina', '3d-starter')).toBe(false);
  expect(fits('Princess Peach', '3d-starter')).toBe(true);
  expect(fits('Goomba', 'world-newcomer')).toBe(true);
  expect(fits('Bowser', 'world-newcomer')).toBe(false);
  expect(fits('New Super Mario Bros. Wii', 'wii-game')).toBe(true);
  expect(fits('Super Mario 3D World', 'switch-game')).toBe(false);
});

test('Advanced challenge history prefers unseen knowledge, not just a new tile shuffle', () => {
  const ids = Object.entries(CATEGORY_CHALLENGES).filter(([, task]) => task!.levels.includes('scientist')).map(([category]) => `category-v2-scientist-${category}`);
  const unseen = ids.slice(0, 3);
  const rounds = createRounds('category-finder', 'mixed', 'scientist', Math.random, undefined, 3, undefined, ids.slice(3));
  expect(rounds.map(round => round.id).sort()).toEqual(unseen.sort());
  expect(rounds.every(round => !round.review)).toBe(true);
  const repeated = createRounds('category-finder', 'mixed', 'scientist', Math.random, undefined, 3, undefined, ids);
  expect(repeated.every(round => round.review)).toBe(true);
});

test('Pro World challenge survives phone reload and accepts every visible newcomer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const seen = Object.keys(CATEGORY_CHALLENGES).filter(key => key !== 'world-newcomer').map(key => `category-v2-scientist-${key}`);
  await page.evaluate(ids => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ ada: ids })), seen);
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Category Finder' }).click();
  if (await page.locator('.setup-settings:not([open])').count()) await page.locator('.setup-settings > summary').click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Pro', exact: false }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.quiz-panel h1')).toContainText('racing debut in World');
  const tiles = await page.locator('.category-grid button span').allTextContents();
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  await expect(page.locator('.category-grid button span')).toHaveText(tiles);
  await expect(page.locator('.quiz-panel h1')).toContainText('racing debut in World');
  for (const name of ['Goomba', 'Cow', 'Spike']) {
    await page.locator('.category-grid').getByText(name, { exact: true }).click();
    await expect(page.locator('.finder-verdict')).toContainText('Correct');
    await expect(page.locator('.category-grid .right-answer')).toHaveCount(3);
    await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/category-world-pro-phone.png', fullPage: true });
});
