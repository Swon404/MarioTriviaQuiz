import { expect, test } from '@playwright/test';

test('Game Order legacy and current rules are separate and duplicate saves cannot replace a time', async ({ page }) => {
  await page.goto('./');
  const result = await page.evaluate(async () => {
    const path = '/MarioTriviaQuiz/src/mario/gameOrder.ts';
    const { saveOrderTime, getOrderTimes, orderLeaderboard } = await import(path);
    const item = { id: 'old', player: 'Ada', difficulty: 'explorer', challenge: 'easy', tiles: 3, elapsedMs: 1000, attempts: 1, completedAt: new Date().toISOString() };
    localStorage.setItem('mariotrivia_order_times_v1', JSON.stringify([item]));
    saveOrderTime({ ...item, id: 'current', elapsedMs: 2000 });
    saveOrderTime({ ...item, id: 'current', elapsedMs: 1 });
    saveOrderTime({ ...item, id: 'old-legend-label', difficulty: 'professor', elapsedMs: 3000 });
    return { all: getOrderTimes(), ranked: orderLeaderboard('explorer', { challenge: 'easy', tiles: 3 }) };
  });
  expect(result.all).toHaveLength(3);
  expect(result.ranked).toHaveLength(2);
  expect(result.ranked[0]).toMatchObject({ id: 'current', elapsedMs: 2000, ruleset: 'order-v3' });
  await page.getByRole('button', { name: 'High Scores' }).click();
  await expect(page.locator('.order-leaderboard').filter({ hasText: 'Legacy' })).toHaveCount(1);
  await expect(page.locator('.order-leaderboard').filter({ hasText: 'order-v3' })).toHaveCount(1);
  await expect(page.locator('.order-leaderboard').filter({ hasText: 'order-v3' }).locator('li')).toHaveCount(2);
  await expect(page.locator('.order-leaderboard').filter({ hasText: 'order-v3' }).locator('h4')).not.toContainText('Rookie');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_order_times_v1')!))).toEqual(result.all);
});
