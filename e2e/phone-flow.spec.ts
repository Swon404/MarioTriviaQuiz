import { expect, test } from '@playwright/test';
import { QUESTIONS } from '../src/mario/questions.ts';

test.use({ viewport: { width: 390, height: 740 }, isMobile: true, hasTouch: true });

for (const game of ['Quiz Battle', 'Game Order', 'Match & Hunt', 'Clue Match Up', 'Clue Duel', 'Track Finder', 'Category Finder']) {
  test(`${game} has phone-sized controls and no horizontal overflow`, async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: game, exact: false }).click();
    for (const stage of ['setup', 'play']) {
      if (stage === 'play') await page.getByRole('button', { name: 'Start!', exact: true }).click();
      const sizes = await page.locator('button:visible').evaluateAll(buttons => buttons.map(button => {
        const rect = button.getBoundingClientRect();
        return { label: button.textContent, width: rect.width, height: rect.height };
      }));
      expect(sizes.filter(size => size.width < 44 || size.height < 44), stage).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), stage).toBe(true);
    }
    await page.screenshot({ path: `test-results/phone-${game.replaceAll(' ', '-')}.png`, fullPage: true });
  });
}

test('phone quiz keeps feedback and Next reachable, resets focus and scroll for three questions', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  for (let round = 0; round < 3; round++) {
    const prompt = await page.locator('.quiz-panel h1').innerText();
    const answer = QUESTIONS.find(question => question.prompt === prompt)!.answer;
    await page.locator('.answer-grid').getByText(answer, { exact: true }).click();
    await expect(page.locator('.feedback h2')).toBeFocused();
    await expect(page.locator('.feedback')).toContainText('Fun fact:');
    const next = page.getByRole('button', { name: 'Next question' });
    const bounds = await next.boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(740);
    await next.click();
    await expect(page.locator('.quiz-panel h1')).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('.feedback-actions')).toHaveCount(0);
  }
});

test('phone timed Hunt keeps Next above the board and hides repeated instructions on the next go', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await page.getByRole('group', { name: 'Hunt timer' }).getByRole('button', { name: 'On' }).click();
  await page.getByRole('group', { name: 'Hunt target mode' }).getByRole('button', { name: 'Choose' }).click();
  await page.getByRole('group', { name: 'Target unlock' }).getByRole('button', { name: '0', exact: true }).click();
  const target = await page.getByLabel('Target name').inputValue();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  for (let round = 0; round < 2; round++) {
    await expect(page.locator('.game-help > .help-copy')).toHaveCount(round === 0 ? 1 : 0);
    await expect(page.locator('.order-leaderboard > details')).not.toHaveAttribute('open', '');
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    await page.locator(`.pair-card[data-pair-id="${target}"][data-kind="icon"]`).click();
    await page.locator(`.pair-card[data-pair-id="${target}"][data-kind="word"]`).click();
    const next = page.getByRole('button', { name: 'Next board' });
    const bounds = await next.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(740);
    await next.click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('.pair-card')).toHaveCount(0);
    await expect(page.locator('.game-help details')).not.toHaveAttribute('open', '');
  }
});
