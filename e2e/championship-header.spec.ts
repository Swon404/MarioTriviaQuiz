import { expect, test } from '@playwright/test';
import { QUESTIONS } from '../src/mario/questions.ts';

test('phone championship shows game and total scores through rewind, handovers and a new game', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.locator('.setup-settings > summary').click();
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Blaize');
  await page.getByLabel('Player 2 name').fill('Dad');
  await page.getByRole('button', { name: 'Quick', exact: true }).click();
  for (const game of ['Game Order', 'Clue Match Up', 'Match & Hunt', 'Clue Duel', 'Category Finder']) {
    await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  }
  await page.getByRole('button', { name: 'Start Championship', exact: true }).click();
  const points = [0, 0];
  const check = async (game: number[], totals = game) => {
    const table = page.getByRole('table', { name: 'Championship scores' });
    await expect(table).toHaveCount(1);
    for (const index of [0, 1]) {
      const cells = table.locator(`tbody tr[data-player-index="${index}"] td`);
      await expect(cells.nth(0)).toHaveText(`${game[index]} EP`);
      await expect(cells.nth(1)).toHaveText(`${totals[index]} EP`);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  };
  for (let turn = 0; turn < 6; turn++) {
    await check(points);
    await page.getByRole('button', { name: `Start ${turn % 2 ? 'Dad' : 'Blaize'}'s turn` }).click();
    await check(points);
    await expect(page.locator('.versus-now-playing')).toHaveCount(1);
    await expect(page.locator('.champ-game-banner')).toHaveCount(0);
    const prompt = await page.locator('.quiz-panel h1').innerText();
    const answer = QUESTIONS.find(question => question.prompt === prompt)!.answer;
    await page.locator('.answer-grid').getByText(answer, { exact: true }).click();
    if (turn === 0) {
      await page.getByRole('button', { name: 'Rewind', exact: false }).click();
      await check([0, 0]);
      await page.locator('.answer-grid').getByText(answer, { exact: true }).click();
    }
    points[turn % 2] += Number((await page.locator('.mario-earned').innerText()).match(/\d+/)![0]);
    await check(points);
    await page.getByRole('button', { name: turn === 5 ? 'See result' : 'Next turn' }).click();
  }
  await page.getByRole('button', { name: 'Next: Track Finder' }).click();
  await check([0, 0], points);
  await page.getByRole('button', { name: "Start Blaize's turn" }).click();
  await check([0, 0], points);
  await page.screenshot({ path: 'test-results/phone-championship-scores.png', fullPage: true });
});
