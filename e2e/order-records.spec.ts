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
    return { all: getOrderTimes(), ranked: orderLeaderboard('explorer', { challenge: 'easy', tiles: 3 }) };
  });
  expect(result.all).toHaveLength(2);
  expect(result.ranked).toHaveLength(1);
  expect(result.ranked[0]).toMatchObject({ id: 'current', elapsedMs: 2000, ruleset: 'order-v2' });
  await page.getByRole('button', { name: 'High Scores' }).click();
  await expect(page.locator('.order-leaderboard').filter({ hasText: 'Legacy' })).toHaveCount(1);
  await expect(page.locator('.order-leaderboard').filter({ hasText: 'order-v2' })).toHaveCount(1);
});
